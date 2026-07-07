using Microsoft.EntityFrameworkCore;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Services;

/// <summary>Fingerprint scan validation, activation, and attendance logging.</summary>
public class AttendanceService(AppDbContext db) : IAttendanceService
{
    /// <summary>
    /// Validates a fingerprint against members or instructors and logs the entry attempt.
    /// Access is denied unless fingerprint is activated, account is active, and membership is valid.
    /// </summary>
    public async Task<FingerprintScanResponse> ProcessScanAsync(FingerprintScanRequest request)
    {
        var member = await db.Members
            .Include(m => m.User)
            .Include(m => m.Memberships)
            .FirstOrDefaultAsync(m => m.FingerprintTemplateId == request.FingerprintTemplateId);

        if (member is not null)
        {
            var activeMembership = ProfileHelper.ResolveActiveMembership(member.Memberships);
            var accessGranted = member.IsFingerprintActivated &&
                                !member.IsTerminated &&
                                member.User.IsActive &&
                                activeMembership is not null;

            var message = member.IsTerminated
                ? "Member account terminated. Contact admin desk."
                : !member.IsFingerprintActivated
                ? "Fingerprint not activated. Visit admin desk."
                : !member.User.IsActive
                    ? "Member account inactive."
                    : activeMembership is null
                        ? "Membership expired or inactive. Access denied."
                        : "Entry granted.";

            await LogAsync(member.MemberId, null, request, accessGranted, message);
            return new FingerprintScanResponse(
                accessGranted,
                message,
                $"{member.User.FirstName} {member.User.LastName}",
                "Member",
                ProfileHelper.ToUtcKind(AppTime.Now()));
        }

        var instructor = await db.Instructors
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.FingerprintTemplateId == request.FingerprintTemplateId);

        if (instructor is not null)
        {
            var accessGranted = instructor.IsFingerprintActivated &&
                                !instructor.IsTerminated &&
                                instructor.User.IsActive;
            var message = instructor.IsTerminated
                ? "Instructor account terminated. Contact admin desk."
                : accessGranted
                ? "Staff entry granted."
                : "Instructor fingerprint not activated.";
            await LogAsync(null, instructor.InstructorId, request, accessGranted, message);
            return new FingerprintScanResponse(
                accessGranted,
                message,
                $"{instructor.User.FirstName} {instructor.User.LastName}",
                "Instructor",
                ProfileHelper.ToUtcKind(AppTime.Now()));
        }

        await LogAsync(null, null, request, false, "Unknown fingerprint.");
        return new FingerprintScanResponse(false, "Unknown fingerprint.", null, null, ProfileHelper.ToUtcKind(AppTime.Now()));
    }

    /// <summary>Binds a fingerprint template to a member and enables gym entry.</summary>
    public async Task<bool> ActivateMemberFingerprintAsync(ActivateFingerprintRequest request)
    {
        var member = await db.Members.FindAsync(request.MemberId);
        if (member is null) return false;
        member.FingerprintTemplateId = request.FingerprintTemplateId;
        member.IsFingerprintActivated = true;
        member.FingerprintActivatedAt = AppTime.Now();
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Binds a fingerprint template to an instructor and enables staff entry.</summary>
    public async Task<bool> ActivateInstructorFingerprintAsync(ActivateInstructorFingerprintRequest request)
    {
        var instructor = await db.Instructors.FindAsync(request.InstructorId);
        if (instructor is null) return false;
        instructor.FingerprintTemplateId = request.FingerprintTemplateId;
        instructor.IsFingerprintActivated = true;
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Returns today's entry scan logs in Colombo time, granted and denied, up to 200 records.</summary>
    public async Task<IReadOnlyList<AttendanceLogDto>> GetTodayLogsAsync()
    {
        var (startUtc, endUtc) = ProfileHelper.GetAppDayUtcRange(ProfileHelper.GetAppToday());
        return await QueryLogsAsync(startUtc, endUtc);
    }

    /// <summary>Returns member gym entry logs for a Colombo calendar date (Admin).</summary>
    public async Task<IReadOnlyList<AdminMemberAttendanceLogDto>> GetMemberLogsByDateAsync(DateTime colomboDate)
    {
        var (startUtc, endUtc) = ProfileHelper.GetAppDayUtcRange(colomboDate);
        return await db.AttendanceLogs
            .AsNoTracking()
            .Include(a => a.Member!).ThenInclude(m => m.User)
            .Where(a => a.MemberId != null && a.LoggedAt >= startUtc && a.LoggedAt < endUtc)
            .OrderByDescending(a => a.LoggedAt)
            .Select(a => new AdminMemberAttendanceLogDto(
                a.AttendanceLogId,
                ProfileHelper.ToUtcKind(a.LoggedAt),
                a.AccessGranted,
                a.ValidationMessage,
                a.MemberId!.Value,
                a.Member!.IdentificationNumber,
                a.Member.User.FirstName + " " + a.Member.User.LastName))
            .ToListAsync();
    }

    /// <summary>Returns gym entry logs for a Colombo calendar date (Admin), optionally filtered by person type.</summary>
    public async Task<IReadOnlyList<AdminAttendanceLogDto>> GetAdminLogsByDateAsync(DateTime colomboDate, string filter)
    {
        var (startUtc, endUtc) = ProfileHelper.GetAppDayUtcRange(colomboDate);
        var normalizedFilter = filter.Trim().ToLowerInvariant();

        var query = db.AttendanceLogs
            .AsNoTracking()
            .Include(a => a.Member!).ThenInclude(m => m.User)
            .Include(a => a.Instructor!).ThenInclude(i => i.User)
            .Where(a => a.LoggedAt >= startUtc && a.LoggedAt < endUtc);

        if (normalizedFilter is "members" or "member")
            query = query.Where(a => a.MemberId != null);
        else if (normalizedFilter is "instructors" or "instructor")
            query = query.Where(a => a.InstructorId != null);

        return await query
            .OrderByDescending(a => a.LoggedAt)
            .Select(a => new AdminAttendanceLogDto(
                a.AttendanceLogId,
                ProfileHelper.ToUtcKind(a.LoggedAt),
                a.AccessGranted,
                a.ValidationMessage,
                a.MemberId != null ? "Member" : a.InstructorId != null ? "Instructor" : "Unknown",
                a.MemberId != null
                    ? a.Member!.IdentificationNumber
                    : a.InstructorId != null
                        ? a.Instructor!.IdentificationNumber
                        : null,
                a.MemberId != null
                    ? a.Member!.User.FirstName + " " + a.Member.User.LastName
                    : a.InstructorId != null
                        ? a.Instructor!.User.FirstName + " " + a.Instructor.User.LastName
                        : "Unknown"))
            .ToListAsync();
    }

    /// <summary>Returns the logged-in member's entry logs for a Colombo calendar month.</summary>
    public async Task<IReadOnlyList<MemberAttendanceEntryDto>> GetMemberLogsForMonthAsync(int userId, int year, int month)
    {
        if (month is < 1 or > 12)
            return [];

        var memberId = await db.Members
            .Where(m => m.UserId == userId)
            .Select(m => (int?)m.MemberId)
            .FirstOrDefaultAsync();

        if (memberId is null)
            return [];

        var monthStart = new DateTime(year, month, 1);
        var (startUtc, _) = ProfileHelper.GetAppDayUtcRange(monthStart);
        var (endUtcExclusive, _) = ProfileHelper.GetAppDayUtcRange(monthStart.AddMonths(1));

        return await db.AttendanceLogs
            .AsNoTracking()
            .Where(a => a.MemberId == memberId && a.LoggedAt >= startUtc && a.LoggedAt < endUtcExclusive)
            .OrderByDescending(a => a.LoggedAt)
            .Select(a => new MemberAttendanceEntryDto(
                a.AttendanceLogId,
                ProfileHelper.ToUtcKind(a.LoggedAt),
                a.AccessGranted,
                a.ValidationMessage))
            .ToListAsync();
    }

    /// <summary>Returns the logged-in instructor's entry logs for a Colombo calendar month.</summary>
    public async Task<IReadOnlyList<MemberAttendanceEntryDto>> GetInstructorLogsForMonthAsync(int userId, int year, int month)
    {
        if (month is < 1 or > 12)
            return [];

        var instructorId = await db.Instructors
            .Where(i => i.UserId == userId)
            .Select(i => (int?)i.InstructorId)
            .FirstOrDefaultAsync();

        if (instructorId is null)
            return [];

        var monthStart = new DateTime(year, month, 1);
        var (startUtc, _) = ProfileHelper.GetAppDayUtcRange(monthStart);
        var (endUtcExclusive, _) = ProfileHelper.GetAppDayUtcRange(monthStart.AddMonths(1));

        return await db.AttendanceLogs
            .AsNoTracking()
            .Where(a => a.InstructorId == instructorId && a.LoggedAt >= startUtc && a.LoggedAt < endUtcExclusive)
            .OrderByDescending(a => a.LoggedAt)
            .Select(a => new MemberAttendanceEntryDto(
                a.AttendanceLogId,
                ProfileHelper.ToUtcKind(a.LoggedAt),
                a.AccessGranted,
                a.ValidationMessage))
            .ToListAsync();
    }

    /// <summary>Returns gym entry logs for the logged-in person (instructor or member) for a Colombo calendar month.</summary>
    public async Task<IReadOnlyList<MemberAttendanceEntryDto>> GetPersonLogsForMonthAsync(int userId, int year, int month)
    {
        var isInstructor = await db.Instructors.AnyAsync(i => i.UserId == userId);
        if (isInstructor)
            return await GetInstructorLogsForMonthAsync(userId, year, month);

        return await GetMemberLogsForMonthAsync(userId, year, month);
    }

    private async Task<IReadOnlyList<AttendanceLogDto>> QueryLogsAsync(DateTime startUtc, DateTime endUtc) =>
        await db.AttendanceLogs
            .AsNoTracking()
            .Include(a => a.Member).ThenInclude(m => m!.User)
            .Include(a => a.Instructor).ThenInclude(i => i!.User)
            .Where(a => a.LoggedAt >= startUtc && a.LoggedAt < endUtc)
            .OrderByDescending(a => a.LoggedAt)
            .Take(200)
            .Select(a => new AttendanceLogDto(
                a.AttendanceLogId,
                ProfileHelper.ToUtcKind(a.LoggedAt),
                a.AccessGranted,
                a.ValidationMessage,
                a.Member != null ? a.Member.User.FirstName + " " + a.Member.User.LastName : null,
                a.Instructor != null ? a.Instructor.User.FirstName + " " + a.Instructor.User.LastName : null,
                a.Member != null ? "Member" : a.Instructor != null ? "Instructor" : "Unknown"))
            .ToListAsync();

    /// <summary>Returns all activated fingerprint templates for simulator and admin desk lookup.</summary>
    public async Task<IReadOnlyList<EnrolledFingerprintDto>> GetEnrolledFingerprintsAsync()
    {
        var members = await db.Members
            .AsNoTracking()
            .Include(m => m.User)
            .Include(m => m.Memberships)
            .Where(m => m.IsFingerprintActivated && m.FingerprintTemplateId != null)
            .ToListAsync();

        var memberItems = members.Select(m =>
        {
            var active = ProfileHelper.ResolveActiveMembership(m.Memberships);
            return new EnrolledFingerprintDto(
                m.FingerprintTemplateId!,
                $"{m.User.FirstName} {m.User.LastName}",
                "Member",
                m.MemberId,
                null,
                m.IdentificationNumber,
                active is not null);
        });

        var instructors = await db.Instructors
            .AsNoTracking()
            .Include(i => i.User)
            .Where(i => i.IsFingerprintActivated && i.FingerprintTemplateId != null)
            .Select(i => new EnrolledFingerprintDto(
                i.FingerprintTemplateId!,
                i.User.FirstName + " " + i.User.LastName,
                "Instructor",
                null,
                i.InstructorId,
                i.IdentificationNumber,
                true))
            .ToListAsync();

        return memberItems.Concat(instructors)
            .OrderBy(e => e.PersonType)
            .ThenBy(e => e.PersonName)
            .ToList();
    }

    private async Task LogAsync(
        int? memberId,
        int? instructorId,
        FingerprintScanRequest request,
        bool accessGranted,
        string message)
    {
        db.AttendanceLogs.Add(new AttendanceLog
        {
            MemberId = memberId,
            InstructorId = instructorId,
            FingerprintTemplateId = request.FingerprintTemplateId,
            ScannerDeviceId = request.ScannerDeviceId,
            AccessGranted = accessGranted,
            ValidationMessage = message
        });
        await db.SaveChangesAsync();
    }
}
