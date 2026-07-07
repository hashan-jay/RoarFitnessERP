using Microsoft.EntityFrameworkCore;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Services;

/// <summary>Member and instructor lifecycle: registration, profiles, packages, and activation.</summary>
public class MembershipService(AppDbContext db, InstructorPhotoStorage photoStorage) : IMembershipService
{
    public const int PublicInstructorLimit = 12;
    /// <summary>Registers a new member online; account stays inactive until payment completes.</summary>
    public async Task<(User user, Member member)?> RegisterOnlineAsync(RegisterMemberRequest request)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email))
            return null;

        var package = await db.MembershipPackages.FirstOrDefaultAsync(p => p.PackageId == request.PackageId && p.IsActive);
        if (package is null) return null;

        var memberRole = await db.Roles.FirstAsync(r => r.RoleName == "Member");
        var user = new User
        {
            Email = request.Email,
            PasswordHash = AuthenticationService.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            IsActive = false
        };

        var member = new Member
        {
            User = user,
            NicNumber = request.NicNumber,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            AddressLine1 = request.AddressLine1,
            City = request.City ?? "Colombo",
            EmergencyContactName = request.EmergencyContactName,
            EmergencyContactPhone = request.EmergencyContactPhone
        };

        user.Member = member;
        user.UserRoles.Add(new UserRole { Role = memberRole });
        db.Users.Add(user);
        db.Members.Add(member);
        await db.SaveChangesAsync();
        return (user, member);
    }

    /// <summary>Creates a member at the front desk; optionally activates membership with in-gym cash payment.</summary>
    public async Task<(User user, Member member)?> CreateMemberByAdminAsync(CreateUserByAdminRequest request)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email))
            return null;

        var role = await db.Roles.FirstOrDefaultAsync(r => r.RoleName == "Member");
        if (role is null) return null;

        var user = new User
        {
            Email = request.Email,
            PasswordHash = AuthenticationService.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            IsActive = request.PackageId.HasValue
        };

        user.UserRoles.Add(new UserRole { Role = role });
        var member = new Member
        {
            User = user,
            NicNumber = request.NicNumber,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            AddressLine1 = request.AddressLine1,
            City = request.City ?? "Colombo",
            Country = request.Country ?? "Sri Lanka",
            EmergencyContactName = request.EmergencyContactName,
            EmergencyContactPhone = request.EmergencyContactPhone
        };
        db.Users.Add(user);
        db.Members.Add(member);
        await db.SaveChangesAsync();

        if (request.PackageId.HasValue)
        {
            var package = await db.MembershipPackages.FindAsync(request.PackageId.Value);
            if (package is not null)
            {
                var membership = new Membership
                {
                    MemberId = member.MemberId,
                    PackageId = package.PackageId,
                    StartDate = AppTime.Now().Date,
                    EndDate = AppTime.Now().Date.AddDays(package.DurationDays),
                    IsActive = true
                };
                db.Memberships.Add(membership);
                user.IsActive = true;
                await db.SaveChangesAsync();

                var cashMethod = await db.PaymentMethods.FirstAsync(m => m.MethodName == "Cash");
                var completed = await db.PaymentStatuses.FirstAsync(s => s.StatusName == "Completed");
                var payment = new Payment
                {
                    PaymentReference = $"PAY-{Guid.NewGuid():N}"[..20].ToUpperInvariant(),
                    MemberId = member.MemberId,
                    PaymentMethodId = cashMethod.PaymentMethodId,
                    PaymentStatusId = completed.PaymentStatusId,
                    AmountLKR = package.PriceLKR,
                    PaymentPurpose = "MembershipInGym",
                    PaidAt = AppTime.Now()
                };
                db.Payments.Add(payment);
                await db.SaveChangesAsync();

                db.MembershipPayments.Add(new MembershipPayment
                {
                    PaymentId = payment.PaymentId,
                    MembershipId = membership.MembershipId,
                    PackageId = package.PackageId
                });
                await db.SaveChangesAsync();
            }
        }

        return (user, member);
    }

    /// <summary>Creates an instructor account with an active login.</summary>
    public async Task<(User user, Instructor instructor)?> CreateInstructorByAdminAsync(CreateUserByAdminRequest request)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email))
            return null;

        var role = await db.Roles.FirstOrDefaultAsync(r => r.RoleName == "Instructor");
        if (role is null) return null;

        var user = new User
        {
            Email = request.Email,
            PasswordHash = AuthenticationService.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            IsActive = true
        };

        user.UserRoles.Add(new UserRole { Role = role });
        var instructor = new Instructor
        {
            User = user,
            Specialization = request.Specialization,
            NicNumber = request.NicNumber,
            DateOfBirth = request.DateOfBirth,
            AddressLine1 = request.AddressLine1,
            Country = request.Country ?? "Sri Lanka",
            YearsExperience = Math.Max(0, request.YearsExperience ?? 0),
            Qualification1 = request.Qualification1?.Trim(),
            Qualification2 = request.Qualification2?.Trim(),
            Speciality1 = request.Speciality1?.Trim() ?? request.Specialization?.Trim(),
            Speciality2 = request.Speciality2?.Trim(),
            Speciality3 = request.Speciality3?.Trim(),
        };

        db.Users.Add(user);
        db.Instructors.Add(instructor);
        await db.SaveChangesAsync();
        return (user, instructor);
    }

    /// <summary>Creates a membership and links it to a completed gateway payment.</summary>
    public async Task<Membership> ActivateMembershipAfterPaymentAsync(int memberId, int packageId, Payment payment)
    {
        var package = await db.MembershipPackages.FindAsync(packageId)
            ?? throw new InvalidOperationException("Package not found");

        var member = await db.Members
            .Include(m => m.User)
            .Include(m => m.Memberships)
            .FirstAsync(m => m.MemberId == memberId);

        var startDate = ProfileHelper.ResolveNextMembershipStartDate(member.Memberships);

        var membership = new Membership
        {
            MemberId = memberId,
            PackageId = packageId,
            StartDate = startDate,
            EndDate = startDate.AddDays(package.DurationDays),
            IsActive = true
        };

        db.Memberships.Add(membership);
        await db.SaveChangesAsync();

        db.MembershipPayments.Add(new MembershipPayment
        {
            Payment = payment,
            MembershipId = membership.MembershipId,
            PackageId = packageId
        });

        member.User.IsActive = true;
        await db.SaveChangesAsync();

        return membership;
    }

    /// <summary>Builds the member profile DTO including active membership and fingerprint status.</summary>
    public async Task<MemberProfileDto?> GetProfileAsync(int userId)
    {
        var member = await db.Members
            .Include(m => m.User)
            .Include(m => m.Memberships).ThenInclude(ms => ms.Package)
            .FirstOrDefaultAsync(m => m.UserId == userId);

        if (member is null) return null;

        var active = ProfileHelper.ResolveActiveMembership(member.Memberships);
        var queued = ProfileHelper.ResolveQueuedMembership(member.Memberships);
        var lastMembership = member.Memberships
            .OrderByDescending(ms => ms.EndDate)
            .FirstOrDefault();

        return new MemberProfileDto(
            member.MemberId,
            member.IdentificationNumber,
            $"{member.User.FirstName} {member.User.LastName}",
            member.User.Email,
            member.User.Phone,
            member.NicNumber,
            member.DateOfBirth,
            ProfileHelper.CalculateAge(member.DateOfBirth),
            member.Gender,
            member.AddressLine1,
            member.City,
            member.Country,
            member.EmergencyContactName,
            member.EmergencyContactPhone,
            member.IsFingerprintActivated,
            member.FingerprintActivatedAt,
            active is not null,
            active?.StartDate ?? lastMembership?.StartDate,
            active?.EndDate ?? lastMembership?.EndDate,
            active?.Package.PackageName ?? lastMembership?.Package.PackageName,
            queued?.Package.PackageName,
            queued?.StartDate,
            queued?.EndDate);
    }

    /// <summary>Builds the instructor profile DTO for the authenticated user.</summary>
    public async Task<InstructorProfileDto?> GetInstructorProfileAsync(int userId)
    {
        var instructor = await db.Instructors
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.UserId == userId);

        if (instructor is null) return null;

        return new InstructorProfileDto(
            instructor.InstructorId,
            instructor.IdentificationNumber,
            $"{instructor.User.FirstName} {instructor.User.LastName}",
            instructor.User.Email,
            instructor.User.Phone,
            instructor.NicNumber,
            instructor.DateOfBirth,
            ProfileHelper.CalculateAge(instructor.DateOfBirth),
            instructor.Specialization,
            instructor.Bio,
            instructor.AddressLine1,
            instructor.City,
            instructor.Country,
            instructor.YearsExperience,
            instructor.Qualification1,
            instructor.Qualification2,
            instructor.Speciality1,
            instructor.Speciality2,
            instructor.Speciality3,
            instructor.ProfilePhotoUrl,
            instructor.HireDate,
            instructor.IsFingerprintActivated);
    }

    /// <summary>Updates editable contact and address fields on a member profile.</summary>
    public async Task<bool> UpdateMemberProfileAsync(int userId, UpdateProfileRequest request)
    {
        var member = await db.Members.Include(m => m.User).FirstOrDefaultAsync(m => m.UserId == userId);
        if (member is null) return false;

        member.User.Phone = request.Phone?.Trim();
        member.AddressLine1 = request.AddressLine1?.Trim();
        member.City = request.City?.Trim();
        member.Country = request.Country?.Trim();
        member.EmergencyContactName = request.EmergencyContactName?.Trim();
        member.EmergencyContactPhone = request.EmergencyContactPhone?.Trim();
        if (request.DateOfBirth.HasValue)
            member.DateOfBirth = request.DateOfBirth.Value.Date;
        member.User.UpdatedAt = AppTime.Now();
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Updates editable contact and address fields on an instructor profile.</summary>
    public async Task<bool> UpdateInstructorProfileAsync(int userId, UpdateProfileRequest request)
    {
        var instructor = await db.Instructors.Include(i => i.User).FirstOrDefaultAsync(i => i.UserId == userId);
        if (instructor is null) return false;

        instructor.User.Phone = request.Phone?.Trim();
        instructor.AddressLine1 = request.AddressLine1?.Trim();
        instructor.City = request.City?.Trim();
        instructor.Country = request.Country?.Trim();
        instructor.User.UpdatedAt = AppTime.Now();
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Returns active membership packages for public display and registration.</summary>
    public async Task<IReadOnlyList<PackageDto>> GetPackagesAsync()
    {
        var packages = await db.MembershipPackages
            .Include(p => p.PackageType)
            .Where(p => p.IsActive)
            .OrderBy(p => p.PriceLKR)
            .ToListAsync();
        return packages.Select(MapPackage).ToList();
    }

    /// <summary>Returns all packages including inactive ones for admin management.</summary>
    public async Task<IReadOnlyList<PackageDto>> GetAllPackagesAdminAsync()
    {
        var packages = await db.MembershipPackages
            .Include(p => p.PackageType)
            .OrderBy(p => p.PriceLKR)
            .ToListAsync();
        return packages.Select(MapPackage).ToList();
    }

    /// <summary>Returns membership package billing types (Monthly, Quarterly, Annual).</summary>
    public async Task<IReadOnlyList<PackageTypeDto>> GetPackageTypesAsync() =>
        await db.MembershipPackageTypes
            .OrderBy(t => t.TypeName)
            .Select(t => new PackageTypeDto(t.PackageTypeId, t.TypeName, t.Description))
            .ToListAsync();

    /// <summary>Creates a new sellable membership package.</summary>
    public async Task<PackageDto?> CreatePackageAsync(CreatePackageRequest request)
    {
        if (!await db.MembershipPackageTypes.AnyAsync(t => t.PackageTypeId == request.PackageTypeId))
            return null;

        var package = new MembershipPackage
        {
            PackageTypeId = request.PackageTypeId,
            PackageName = request.PackageName.Trim(),
            Description = request.Description?.Trim(),
            Amenities = request.Amenities?.Trim(),
            DurationDays = request.DurationDays,
            PriceLKR = request.PriceLKR,
            IsFeatured = request.IsFeatured,
            IsActive = true
        };

        db.MembershipPackages.Add(package);
        await db.SaveChangesAsync();

        return await db.MembershipPackages
            .Include(p => p.PackageType)
            .Where(p => p.PackageId == package.PackageId)
            .FirstOrDefaultAsync() is { } saved
            ? MapPackage(saved)
            : null;
    }

    /// <summary>Updates an existing membership package's details and availability.</summary>
    public async Task<PackageDto?> UpdatePackageAsync(int packageId, UpdatePackageRequest request)
    {
        var package = await db.MembershipPackages
            .Include(p => p.PackageType)
            .FirstOrDefaultAsync(p => p.PackageId == packageId);
        if (package is null || !await db.MembershipPackageTypes.AnyAsync(t => t.PackageTypeId == request.PackageTypeId))
            return null;

        package.PackageTypeId = request.PackageTypeId;
        package.PackageName = request.PackageName.Trim();
        package.Description = request.Description?.Trim();
        package.Amenities = request.Amenities?.Trim();
        package.DurationDays = request.DurationDays;
        package.PriceLKR = request.PriceLKR;
        package.IsFeatured = request.IsFeatured;
        package.IsActive = request.IsActive;
        await db.SaveChangesAsync();

        await db.Entry(package).Reference(p => p.PackageType).LoadAsync();
        return MapPackage(package);
    }

    /// <summary>Soft-deletes a package by marking it inactive and removing featured status.</summary>
    public async Task<bool> DeletePackageAsync(int packageId)
    {
        var package = await db.MembershipPackages.FirstOrDefaultAsync(p => p.PackageId == packageId);
        if (package is null) return false;

        package.IsActive = false;
        package.IsFeatured = false;
        await db.SaveChangesAsync();
        return true;
    }

    private static PackageDto MapPackage(MembershipPackage p) =>
        new(
            p.PackageId,
            p.PackageName,
            p.Description,
            p.DurationDays,
            p.PriceLKR,
            p.PackageType.TypeName,
            p.Amenities,
            p.IsActive,
            p.IsFeatured,
            p.PackageTypeId);

    /// <summary>Lists members for admin dashboards, filtered by lifecycle section.</summary>
    public async Task<IReadOnlyList<AdminMemberListItemDto>> ListMembersForAdminAsync(string? section = null)
    {
        var members = await db.Members
            .AsNoTracking()
            .Include(m => m.User)
            .Include(m => m.Memberships).ThenInclude(ms => ms.Package)
            .OrderByDescending(m => m.JoinedAt)
            .ToListAsync();

        var items = members.Select(MapAdminMember).ToList();
        var normalized = (section ?? "all").Trim().ToLowerInvariant();

        return normalized switch
        {
            "terminated" => items.Where(i => i.IsTerminated).ToList(),
            "active" => items.Where(i => !i.IsTerminated && i.HasActiveMembership).ToList(),
            "inactive" => items.Where(i => !i.IsTerminated && !i.HasActiveMembership).ToList(),
            _ => items.Where(i => !i.IsTerminated).ToList(),
        };
    }

    /// <summary>Updates a member account on admin request with member permission.</summary>
    public async Task<bool> UpdateMemberAccountByAdminAsync(int memberId, AdminUpdateMemberAccountRequest request)
    {
        if (!request.MemberPermissionConfirmed)
            return false;

        var member = await db.Members.Include(m => m.User).FirstOrDefaultAsync(m => m.MemberId == memberId);
        if (member is null || member.IsTerminated)
            return false;

        var email = request.Email.Trim();
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName) || string.IsNullOrWhiteSpace(email))
            return false;

        if (await db.Users.AnyAsync(u => u.Email == email && u.UserId != member.UserId))
            return false;

        member.User.FirstName = request.FirstName.Trim();
        member.User.LastName = request.LastName.Trim();
        member.User.Email = email;
        member.NicNumber = string.IsNullOrWhiteSpace(request.NicNumber) ? null : request.NicNumber.Trim();

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            if (request.Password.Length < 8)
                return false;
            member.User.PasswordHash = AuthenticationService.HashPassword(request.Password);
        }

        member.User.UpdatedAt = AppTime.Now();
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Terminates a member account — blocks login and fingerprint access.</summary>
    public async Task<bool> TerminateMemberAsync(int memberId)
    {
        var member = await db.Members.Include(m => m.User).FirstOrDefaultAsync(m => m.MemberId == memberId);
        if (member is null || member.IsTerminated)
            return false;

        member.IsTerminated = true;
        member.TerminatedAt = AppTime.Now();
        member.User.IsActive = false;
        member.User.UpdatedAt = AppTime.Now();
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Reinstates a terminated member so they can log in and use fingerprint again.</summary>
    public async Task<bool> ReinstateMemberAsync(int memberId)
    {
        var member = await db.Members.Include(m => m.User).FirstOrDefaultAsync(m => m.MemberId == memberId);
        if (member is null || !member.IsTerminated)
            return false;

        member.IsTerminated = false;
        member.TerminatedAt = null;
        member.User.IsActive = true;
        member.User.UpdatedAt = AppTime.Now();
        await db.SaveChangesAsync();
        return true;
    }

    private static AdminMemberListItemDto MapAdminMember(Member member)
    {
        var active = ProfileHelper.ResolveActiveMembership(member.Memberships);

        return new AdminMemberListItemDto(
            member.MemberId,
            member.IdentificationNumber,
            member.User.FirstName,
            member.User.LastName,
            $"{member.User.FirstName} {member.User.LastName}",
            member.User.Email,
            member.User.Phone,
            member.NicNumber,
            member.EmergencyContactName,
            member.EmergencyContactPhone,
            member.IsFingerprintActivated,
            member.User.IsActive,
            member.IsTerminated,
            member.TerminatedAt,
            active is not null,
            active?.StartDate,
            active?.EndDate,
            active?.Package.PackageName,
            member.DateOfBirth,
            member.Gender,
            member.AddressLine1,
            member.City,
            member.Country);
    }

    /// <summary>Lists instructors for admin dashboards, filtered by lifecycle section.</summary>
    public async Task<IReadOnlyList<AdminInstructorListItemDto>> ListInstructorsForAdminAsync(string? section = null)
    {
        var instructors = await db.Instructors
            .AsNoTracking()
            .Include(i => i.User)
            .OrderByDescending(i => i.HireDate)
            .ToListAsync();

        var items = instructors.Select(MapAdminInstructor).ToList();
        var normalized = (section ?? "all").Trim().ToLowerInvariant();

        return normalized switch
        {
            "terminated" => items.Where(i => i.IsTerminated).ToList(),
            "active" => items.Where(i => !i.IsTerminated && i.IsAccountActive).ToList(),
            _ => items.Where(i => !i.IsTerminated).ToList(),
        };
    }

    /// <summary>Updates an instructor account on admin request with instructor permission.</summary>
    public async Task<bool> UpdateInstructorAccountByAdminAsync(int instructorId, AdminUpdateInstructorAccountRequest request)
    {
        if (!request.InstructorPermissionConfirmed)
            return false;

        var instructor = await db.Instructors.Include(i => i.User).FirstOrDefaultAsync(i => i.InstructorId == instructorId);
        if (instructor is null || instructor.IsTerminated)
            return false;

        var email = request.Email.Trim();
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName) || string.IsNullOrWhiteSpace(email))
            return false;

        if (await db.Users.AnyAsync(u => u.Email == email && u.UserId != instructor.UserId))
            return false;

        instructor.User.FirstName = request.FirstName.Trim();
        instructor.User.LastName = request.LastName.Trim();
        instructor.User.Email = email;
        instructor.User.Phone = request.Phone?.Trim();
        instructor.NicNumber = string.IsNullOrWhiteSpace(request.NicNumber) ? null : request.NicNumber.Trim();
        instructor.DateOfBirth = request.DateOfBirth;
        instructor.Specialization = request.Specialization?.Trim();
        instructor.AddressLine1 = request.AddressLine1?.Trim();
        instructor.Country = request.Country?.Trim();
        instructor.YearsExperience = Math.Max(0, request.YearsExperience);
        instructor.Qualification1 = string.IsNullOrWhiteSpace(request.Qualification1) ? null : request.Qualification1.Trim();
        instructor.Qualification2 = string.IsNullOrWhiteSpace(request.Qualification2) ? null : request.Qualification2.Trim();
        instructor.Speciality1 = string.IsNullOrWhiteSpace(request.Speciality1) ? null : request.Speciality1.Trim();
        instructor.Speciality2 = string.IsNullOrWhiteSpace(request.Speciality2) ? null : request.Speciality2.Trim();
        instructor.Speciality3 = string.IsNullOrWhiteSpace(request.Speciality3) ? null : request.Speciality3.Trim();

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            if (request.Password.Length < 8)
                return false;
            instructor.User.PasswordHash = AuthenticationService.HashPassword(request.Password);
        }

        instructor.User.UpdatedAt = AppTime.Now();
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Terminates an instructor when they leave the gym.</summary>
    public async Task<bool> TerminateInstructorAsync(int instructorId)
    {
        var instructor = await db.Instructors.Include(i => i.User).FirstOrDefaultAsync(i => i.InstructorId == instructorId);
        if (instructor is null || instructor.IsTerminated)
            return false;

        instructor.IsTerminated = true;
        instructor.TerminatedAt = AppTime.Now();
        instructor.User.IsActive = false;
        instructor.User.UpdatedAt = AppTime.Now();
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Reinstates a terminated instructor returning to work at Roar Fitness.</summary>
    public async Task<bool> ReinstateInstructorAsync(int instructorId)
    {
        var instructor = await db.Instructors.Include(i => i.User).FirstOrDefaultAsync(i => i.InstructorId == instructorId);
        if (instructor is null || !instructor.IsTerminated)
            return false;

        instructor.IsTerminated = false;
        instructor.TerminatedAt = null;
        instructor.User.IsActive = true;
        instructor.User.UpdatedAt = AppTime.Now();
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Finds non-terminated members for front-desk membership purchase or renewal.</summary>
    public async Task<IReadOnlyList<MemberRenewSearchItemDto>> SearchMembersForRenewalAsync(string query)
    {
        var trimmed = query?.Trim() ?? string.Empty;
        if (trimmed.Length < 2)
            return Array.Empty<MemberRenewSearchItemDto>();

        var lowered = trimmed.ToLowerInvariant();
        var members = await db.Members
            .Include(m => m.User)
            .Include(m => m.Memberships)
            .Where(m => !m.IsTerminated)
            .ToListAsync();

        return members
            .Where(m =>
            {
                var fullName = $"{m.User.FirstName} {m.User.LastName}".ToLowerInvariant();
                return m.IdentificationNumber.Contains(trimmed, StringComparison.OrdinalIgnoreCase)
                    || fullName.Contains(lowered)
                    || m.User.FirstName.Contains(trimmed, StringComparison.OrdinalIgnoreCase)
                    || m.User.LastName.Contains(trimmed, StringComparison.OrdinalIgnoreCase)
                    || (m.NicNumber?.Contains(trimmed, StringComparison.OrdinalIgnoreCase) ?? false)
                    || (m.User.Phone?.Contains(trimmed, StringComparison.OrdinalIgnoreCase) ?? false);
            })
            .OrderBy(m => m.User.LastName)
            .ThenBy(m => m.User.FirstName)
            .Take(20)
            .Select(m =>
            {
                var active = ProfileHelper.ResolveActiveMembership(m.Memberships);
                var queued = ProfileHelper.ResolveQueuedMembership(m.Memberships);
                var lastEnd = m.Memberships
                    .OrderByDescending(ms => ms.EndDate)
                    .Select(ms => (DateTime?)ms.EndDate)
                    .FirstOrDefault();

                return new MemberRenewSearchItemDto(
                    m.MemberId,
                    m.IdentificationNumber,
                    $"{m.User.FirstName} {m.User.LastName}",
                    m.User.Phone,
                    m.NicNumber,
                    active is not null,
                    active?.EndDate,
                    active is null ? lastEnd : null,
                    queued?.StartDate,
                    m.IsFingerprintActivated);
            })
            .ToList();
    }

    /// <summary>Records an in-gym cash or card payment and creates the next membership period.</summary>
    public async Task<MembershipRenewBillDto?> RenewMembershipInGymAsync(int memberId, AdminMembershipRenewRequest request)
    {
        var member = await db.Members
            .Include(m => m.User)
            .Include(m => m.Memberships)
            .FirstOrDefaultAsync(m => m.MemberId == memberId);

        if (member is null || member.IsTerminated)
            return null;

        var package = await db.MembershipPackages.FirstOrDefaultAsync(p => p.PackageId == request.PackageId && p.IsActive);
        if (package is null)
            return null;

        var methodName = request.PaymentMethod switch
        {
            "Card" => "Card",
            "Cash" => "Cash",
            _ => null
        };
        if (methodName is null)
            return null;

        var method = await db.PaymentMethods.FirstAsync(m => m.MethodName == methodName);
        var completed = await db.PaymentStatuses.FirstAsync(s => s.StatusName == "Completed");
        var billReference = $"BILL-MEM-{Guid.NewGuid():N}"[..24].ToUpperInvariant();
        var paymentReference = $"PAY-{Guid.NewGuid():N}"[..20].ToUpperInvariant();
        var paidAt = AppTime.Now();

        var payment = new Payment
        {
            PaymentReference = paymentReference,
            MemberId = member.MemberId,
            PaymentMethodId = method.PaymentMethodId,
            PaymentStatusId = completed.PaymentStatusId,
            AmountLKR = package.PriceLKR,
            PaymentPurpose = "MembershipInGym",
            PaidAt = paidAt
        };

        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        await ActivateMembershipAfterPaymentAsync(member.MemberId, package.PackageId, payment);

        var newMembership = await db.Memberships
            .Include(ms => ms.Package)
            .Where(ms => ms.MemberId == member.MemberId)
            .OrderByDescending(ms => ms.MembershipId)
            .FirstAsync();

        return new MembershipRenewBillDto(
            billReference,
            paymentReference,
            $"{member.User.FirstName} {member.User.LastName}",
            member.IdentificationNumber,
            member.User.Phone,
            member.NicNumber,
            package.PackageName,
            package.DurationDays,
            package.PriceLKR,
            methodName,
            paidAt,
            newMembership.StartDate,
            newMembership.EndDate);
    }

    private static AdminInstructorListItemDto MapAdminInstructor(Instructor instructor) =>
        new(
            instructor.InstructorId,
            instructor.IdentificationNumber,
            instructor.User.FirstName,
            instructor.User.LastName,
            $"{instructor.User.FirstName} {instructor.User.LastName}",
            instructor.User.Email,
            instructor.User.Phone,
            instructor.NicNumber,
            instructor.DateOfBirth,
            instructor.Specialization,
            instructor.AddressLine1,
            instructor.Country,
            instructor.YearsExperience,
            instructor.Qualification1,
            instructor.Qualification2,
            instructor.Speciality1,
            instructor.Speciality2,
            instructor.Speciality3,
            instructor.ProfilePhotoUrl,
            instructor.IsFingerprintActivated,
            instructor.User.IsActive,
            instructor.IsTerminated,
            instructor.TerminatedAt,
            instructor.HireDate);

    /// <summary>Active instructors shown on the public website coaches section.</summary>
    public async Task<IReadOnlyList<PublicInstructorDto>> GetPublicInstructorsAsync()
    {
        return await db.Instructors
            .AsNoTracking()
            .Where(i => !i.IsTerminated)
            .Join(
                db.Users.AsNoTracking().Where(u => u.IsActive),
                instructor => instructor.UserId,
                user => user.UserId,
                (instructor, user) => new { instructor, user })
            .OrderBy(row => row.instructor.HireDate)
            .ThenBy(row => row.user.LastName)
            .Take(PublicInstructorLimit)
            .Select(row => new PublicInstructorDto(
                row.instructor.InstructorId,
                (row.user.FirstName + " " + row.user.LastName).Trim(),
                string.IsNullOrWhiteSpace(row.instructor.Specialization)
                    ? "Fitness Coach"
                    : row.instructor.Specialization.Trim(),
                row.instructor.YearsExperience,
                row.instructor.Qualification1,
                row.instructor.Qualification2,
                row.instructor.Speciality1,
                row.instructor.Speciality2,
                row.instructor.Speciality3,
                row.instructor.ProfilePhotoUrl))
            .ToListAsync();
    }

    /// <summary>Stores a profile photo for an instructor and updates the profile URL.</summary>
    public async Task<string?> UploadInstructorPhotoAsync(int instructorId, IFormFile file)
    {
        if (file is null || file.Length <= 0)
            return null;

        var instructor = await db.Instructors
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.InstructorId == instructorId);
        if (instructor is null || instructor.IsTerminated)
            return null;

        var savedUrl = await photoStorage.SaveAsync(instructorId, file);
        if (savedUrl is null)
            return null;

        photoStorage.DeleteIfExists(instructor.ProfilePhotoUrl);
        instructor.ProfilePhotoUrl = savedUrl;
        instructor.User.UpdatedAt = AppTime.Now();
        await db.SaveChangesAsync();
        return savedUrl;
    }
}
