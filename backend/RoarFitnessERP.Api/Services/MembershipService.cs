using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Services;

/// <summary>Member and instructor lifecycle: registration, profiles, packages, and activation.</summary>
public class MembershipService(AppDbContext db) : IMembershipService
{
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
            DateOfBirth = request.DateOfBirth
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
                    StartDate = DateTime.UtcNow.Date,
                    EndDate = DateTime.UtcNow.Date.AddDays(package.DurationDays),
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
                    PaidAt = DateTime.UtcNow
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
            DateOfBirth = request.DateOfBirth
        };

        db.Users.Add(user);
        db.Instructors.Add(instructor);
        await db.SaveChangesAsync();
        return (user, instructor);
    }

    /// <summary>Creates an active membership and links it to a completed gateway payment.</summary>
    public async Task ActivateMembershipAfterPaymentAsync(int memberId, int packageId, Payment payment)
    {
        var package = await db.MembershipPackages.FindAsync(packageId)
            ?? throw new InvalidOperationException("Package not found");

        var membership = new Membership
        {
            MemberId = memberId,
            PackageId = packageId,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(package.DurationDays),
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

        var member = await db.Members.Include(m => m.User).FirstAsync(m => m.MemberId == memberId);
        member.User.IsActive = true;
        await db.SaveChangesAsync();
    }

    /// <summary>Builds the member profile DTO including active membership and fingerprint status.</summary>
    public async Task<MemberProfileDto?> GetProfileAsync(int userId)
    {
        var member = await db.Members
            .Include(m => m.User)
            .Include(m => m.Memberships).ThenInclude(ms => ms.Package)
            .FirstOrDefaultAsync(m => m.UserId == userId);

        if (member is null) return null;

        var active = member.Memberships
            .Where(ms => ms.IsActive && ms.EndDate >= DateTime.UtcNow.Date)
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
            member.ProfilePhotoUrl,
            member.IsFingerprintActivated,
            member.FingerprintActivatedAt,
            active is not null,
            active?.EndDate,
            active?.Package.PackageName);
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
            instructor.AddressLine1,
            instructor.City,
            instructor.Country,
            instructor.EmergencyContactName,
            instructor.EmergencyContactPhone,
            instructor.ProfilePhotoUrl,
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
        if (request.ProfilePhotoUrl is not null)
            member.ProfilePhotoUrl = string.IsNullOrWhiteSpace(request.ProfilePhotoUrl) ? null : request.ProfilePhotoUrl.Trim();
        if (request.DateOfBirth.HasValue)
            member.DateOfBirth = request.DateOfBirth.Value.Date;
        member.User.UpdatedAt = DateTime.UtcNow;
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
        instructor.EmergencyContactName = request.EmergencyContactName?.Trim();
        instructor.EmergencyContactPhone = request.EmergencyContactPhone?.Trim();
        if (request.ProfilePhotoUrl is not null)
            instructor.ProfilePhotoUrl = string.IsNullOrWhiteSpace(request.ProfilePhotoUrl) ? null : request.ProfilePhotoUrl.Trim();
        instructor.User.UpdatedAt = DateTime.UtcNow;
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

    /// <summary>Lists all members with identification numbers and activation status for admin.</summary>
    public async Task<IReadOnlyList<object>> ListMembersAsync() =>
        await db.Members.Include(m => m.User).Select(m => (object)new
        {
            m.MemberId,
            identificationNumber = m.IdentificationNumber,
            FullName = m.User.FirstName + " " + m.User.LastName,
            m.User.Email,
            m.User.Phone,
            m.NicNumber,
            m.EmergencyContactName,
            m.EmergencyContactPhone,
            m.IsFingerprintActivated,
            m.User.IsActive
        }).ToListAsync();

    /// <summary>Lists all instructors with contact details for admin.</summary>
    public async Task<IReadOnlyList<object>> ListInstructorsAsync() =>
        await db.Instructors.Include(i => i.User).Select(i => (object)new
        {
            i.InstructorId,
            identificationNumber = i.IdentificationNumber,
            FullName = i.User.FirstName + " " + i.User.LastName,
            i.User.Email,
            i.User.Phone,
            i.NicNumber,
            i.EmergencyContactName,
            i.EmergencyContactPhone,
            i.Specialization,
            i.IsFingerprintActivated
        }).ToListAsync();

    /// <summary>Uploads and stores a member profile photo, returning its public URL.</summary>
    public async Task<string?> UploadMemberProfilePhotoAsync(int userId, IFormFile file, IWebHostEnvironment env)
    {
        var member = await db.Members.FirstOrDefaultAsync(m => m.UserId == userId);
        if (member is null) return null;

        var url = await ProfilePhotoStorage.SaveAsync(file, $"member-{member.MemberId}", env);
        if (url is null) return null;

        member.ProfilePhotoUrl = url;

        var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user is not null)
            user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return url;
    }

    /// <summary>Uploads and stores an instructor profile photo, returning its public URL.</summary>
    public async Task<string?> UploadInstructorProfilePhotoAsync(int userId, IFormFile file, IWebHostEnvironment env)
    {
        var instructor = await db.Instructors.FirstOrDefaultAsync(i => i.UserId == userId);
        if (instructor is null) return null;

        var url = await ProfilePhotoStorage.SaveAsync(file, $"instructor-{instructor.InstructorId}", env);
        if (url is null) return null;

        instructor.ProfilePhotoUrl = url;

        var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user is not null)
            user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return url;
    }
}
