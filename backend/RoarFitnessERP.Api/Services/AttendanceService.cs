using Microsoft.EntityFrameworkCore;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Services;

/// <summary>Fingerprint scan validation, activation, and attendance logging.</summary>
public class AttendanceService(AppDbContext db) : IAttendanceService
{
    /// <summary>Validates a fingerprint against members or instructors and logs the entry attempt.</summary>
    public async Task<FingerprintScanResponse> ProcessScanAsync(FingerprintScanRequest request)
    {
        var member = await db.Members
            .Include(m => m.User)
            .Include(m => m.Memberships)
            .FirstOrDefaultAsync(m => m.FingerprintTemplateId == request.FingerprintTemplateId);

        if (member is not null)
        {
            var accessGranted = member.IsFingerprintActivated &&
                                member.User.IsActive &&
                                member.Memberships.Any(ms => ms.IsActive && ms.EndDate >= DateTime.UtcNow.Date);

            var message = !member.IsFingerprintActivated
                ? "Fingerprint not activated. Visit admin desk."
                : !member.User.IsActive
                    ? "Member account inactive."
                    : !member.Memberships.Any(ms => ms.IsActive && ms.EndDate >= DateTime.UtcNow.Date)
                        ? "Membership expired or inactive. Access denied."
                        : "Entry granted.";

            await LogAsync(member.MemberId, null, request, accessGranted, message);
            return new FingerprintScanResponse(
                accessGranted,
                message,
                $"{member.User.FirstName} {member.User.LastName}",
                "Member",
                DateTime.UtcNow);
        }

        var instructor = await db.Instructors
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.FingerprintTemplateId == request.FingerprintTemplateId);

        if (instructor is not null)
        {
            var accessGranted = instructor.IsFingerprintActivated && instructor.User.IsActive;
            var message = accessGranted
                ? "Staff entry granted."
                : "Instructor fingerprint not activated.";
            await LogAsync(null, instructor.InstructorId, request, accessGranted, message);
            return new FingerprintScanResponse(
                accessGranted,
                message,
                $"{instructor.User.FirstName} {instructor.User.LastName}",
                "Instructor",
                DateTime.UtcNow);
        }

        await LogAsync(null, null, request, false, "Unknown fingerprint.");
        return new FingerprintScanResponse(false, "Unknown fingerprint.", null, null, DateTime.UtcNow);
    }

    /// <summary>Binds a fingerprint template to a member and enables gym entry.</summary>
    public async Task<bool> ActivateMemberFingerprintAsync(ActivateFingerprintRequest request)
    {
        var member = await db.Members.FindAsync(request.MemberId);
        if (member is null) return false;
        member.FingerprintTemplateId = request.FingerprintTemplateId;
        member.IsFingerprintActivated = true;
        member.FingerprintActivatedAt = DateTime.UtcNow;
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

    /// <summary>Returns today's entry scan logs, granted and denied, up to 200 records.</summary>
    public async Task<IReadOnlyList<AttendanceLogDto>> GetTodayLogsAsync()
    {
        var today = DateTime.UtcNow.Date;
        return await db.AttendanceLogs
            .AsNoTracking()
            .Include(a => a.Member).ThenInclude(m => m!.User)
            .Include(a => a.Instructor).ThenInclude(i => i!.User)
            .Where(a => a.LoggedAt >= today)
            .OrderByDescending(a => a.LoggedAt)
            .Take(200)
            .Select(a => new AttendanceLogDto(
                a.AttendanceLogId,
                a.LoggedAt,
                a.AccessGranted,
                a.ValidationMessage,
                a.Member != null ? a.Member.User.FirstName + " " + a.Member.User.LastName : null,
                a.Instructor != null ? a.Instructor.User.FirstName + " " + a.Instructor.User.LastName : null,
                a.Member != null ? "Member" : a.Instructor != null ? "Instructor" : "Unknown"))
            .ToListAsync();
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
