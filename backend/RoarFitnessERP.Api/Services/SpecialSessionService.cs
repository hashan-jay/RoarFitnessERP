using Microsoft.EntityFrameworkCore;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Services;

/// <summary>Utility methods for special session scheduling and status calculation.</summary>
public static class SpecialSessionHelper
{
    /// <summary>Derives the live status (Pending, Upcoming, Ongoing, Expired) from approval and time window.</summary>
    public static string GetRuntimeStatus(SpecialSession session, DateTime? now = null)
    {
        now ??= DateTime.UtcNow;

        if (session.Status == "Pending")
            return "Pending";

        if (session.Status == "Rejected")
            return "Rejected";

        if (now < session.StartDateTime)
            return "Upcoming";

        if (now >= session.StartDateTime && now <= session.EndDateTime)
            return "Ongoing";

        return "Expired";
    }

    public static bool Overlaps(DateTime startA, DateTime endA, DateTime startB, DateTime endB) =>
        startA < endB && endA > startB;
}

/// <summary>Instructor session requests, admin approval workflow, and paid enrollments.</summary>
public class SpecialSessionService(AppDbContext db) : ISpecialSessionService
{
    /// <summary>Submits a new special session request on behalf of the logged-in instructor.</summary>
    public async Task<SpecialSessionDto?> CreateRequestAsync(int userId, CreateSpecialSessionRequest request)
    {
        var instructor = await db.Instructors
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.UserId == userId);

        if (instructor is null)
            return null;

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new InvalidOperationException("Title is required.");

        if (request.EndDateTime <= request.StartDateTime)
            throw new InvalidOperationException("End time must be after start time.");

        if (request.FeePerPersonLKR < 0)
            throw new InvalidOperationException("Fee cannot be negative.");

        if (request.MaxParticipants < 1)
            throw new InvalidOperationException("Member limit must be at least 1.");

        var session = new SpecialSession
        {
            InstructorId = instructor.InstructorId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            StartDateTime = DateTime.SpecifyKind(request.StartDateTime, DateTimeKind.Utc),
            EndDateTime = DateTime.SpecifyKind(request.EndDateTime, DateTimeKind.Utc),
            FeePerPersonLKR = request.FeePerPersonLKR,
            MaxParticipants = request.MaxParticipants,
            Status = "Pending"
        };

        db.SpecialSessions.Add(session);
        await db.SaveChangesAsync();

        return await MapSessionAsync(session.SessionId, includeEnrollments: false);
    }

    /// <summary>Returns all sessions submitted by the logged-in instructor.</summary>
    public async Task<IReadOnlyList<SpecialSessionDto>> GetInstructorSessionsAsync(int userId)
    {
        var instructorId = await db.Instructors
            .Where(i => i.UserId == userId)
            .Select(i => i.InstructorId)
            .FirstOrDefaultAsync();

        if (instructorId == 0)
            return [];

        var sessions = await db.SpecialSessions
            .Where(s => s.InstructorId == instructorId)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => s.SessionId)
            .ToListAsync();

        var results = new List<SpecialSessionDto>();
        foreach (var sessionId in sessions)
        {
            var mapped = await MapSessionAsync(sessionId, includeEnrollments: true);
            if (mapped is not null)
                results.Add(mapped);
        }

        return results;
    }

    /// <summary>Returns session requests for admin review, optionally filtered by status.</summary>
    public async Task<IReadOnlyList<SpecialSessionDto>> GetAdminSessionsAsync(string? status = null)
    {
        var query = db.SpecialSessions.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(s => s.Status == status);

        var sessionIds = await query
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => s.SessionId)
            .ToListAsync();

        var results = new List<SpecialSessionDto>();
        foreach (var sessionId in sessionIds)
        {
            var mapped = await MapSessionAsync(sessionId, includeEnrollments: true);
            if (mapped is not null)
                results.Add(mapped);
        }

        return results;
    }

    /// <summary>Returns accepted sessions ordered by start time for the admin calendar.</summary>
    public async Task<IReadOnlyList<SpecialSessionDto>> GetAcceptedCalendarSessionsAsync()
    {
        var sessionIds = await db.SpecialSessions
            .Where(s => s.Status == "Accepted")
            .OrderBy(s => s.StartDateTime)
            .Select(s => s.SessionId)
            .ToListAsync();

        var results = new List<SpecialSessionDto>();
        foreach (var sessionId in sessionIds)
        {
            var mapped = await MapSessionAsync(sessionId, includeEnrollments: true);
            if (mapped is not null)
                results.Add(mapped);
        }

        return results;
    }

    /// <summary>Returns full session detail including enrollments when requested.</summary>
    public async Task<SpecialSessionDto?> GetSessionDetailAsync(int sessionId) =>
        await MapSessionAsync(sessionId, includeEnrollments: true);

    /// <summary>Approves a pending session after checking for schedule conflicts.</summary>
    public async Task<SpecialSessionDto?> AcceptSessionAsync(int sessionId, int adminUserId)
    {
        var session = await db.SpecialSessions.FindAsync(sessionId);
        if (session is null || session.Status != "Pending")
            return null;

        if (await HasAcceptedTimeConflictAsync(session))
            throw new InvalidOperationException("Another accepted session is already scheduled during this time.");

        session.Status = "Accepted";
        session.ReviewedByUserId = adminUserId;
        session.ReviewedAt = DateTime.UtcNow;
        session.RejectionReason = null;
        await db.SaveChangesAsync();

        return await MapSessionAsync(sessionId, includeEnrollments: true);
    }

    /// <summary>Rejects a pending session with an optional reason for the instructor.</summary>
    public async Task<SpecialSessionDto?> RejectSessionAsync(int sessionId, int adminUserId, ReviewSpecialSessionRequest request)
    {
        var session = await db.SpecialSessions.FindAsync(sessionId);
        if (session is null || session.Status != "Pending")
            return null;

        session.Status = "Rejected";
        session.ReviewedByUserId = adminUserId;
        session.ReviewedAt = DateTime.UtcNow;
        session.RejectionReason = string.IsNullOrWhiteSpace(request.RejectionReason)
            ? "Request rejected by management."
            : request.RejectionReason.Trim();
        await db.SaveChangesAsync();

        return await MapSessionAsync(sessionId, includeEnrollments: true);
    }

    /// <summary>Returns accepted sessions open for member enrollment that the member has not joined.</summary>
    public async Task<IReadOnlyList<SpecialSessionDto>> GetAvailableSessionsForMemberAsync(int userId)
    {
        var memberId = await db.Members
            .Where(m => m.UserId == userId)
            .Select(m => m.MemberId)
            .FirstOrDefaultAsync();

        if (memberId == 0)
            return [];

        var now = DateTime.UtcNow;
        var enrolledSessionIds = await GetEnrolledSessionIdsAsync(memberId);

        var sessions = await db.SpecialSessions
            .Where(s => s.Status == "Accepted" && s.EndDateTime >= now)
            .OrderBy(s => s.StartDateTime)
            .Select(s => s.SessionId)
            .ToListAsync();

        var results = new List<SpecialSessionDto>();
        foreach (var sessionId in sessions)
        {
            if (enrolledSessionIds.Contains(sessionId))
                continue;

            var mapped = await MapSessionAsync(sessionId, includeEnrollments: false);
            if (mapped is null || mapped.SpotsRemaining <= 0)
                continue;

            results.Add(mapped);
        }

        return results;
    }

    /// <summary>Returns sessions the logged-in member is enrolled in.</summary>
    public async Task<IReadOnlyList<SpecialSessionDto>> GetMemberEnrollmentsAsync(int userId)
    {
        var memberId = await db.Members
            .Where(m => m.UserId == userId)
            .Select(m => m.MemberId)
            .FirstOrDefaultAsync();

        if (memberId == 0)
            return [];

        var sessionIds = await db.SpecialSessionEnrollments
            .Where(e => e.MemberId == memberId)
            .OrderByDescending(e => e.EnrolledAt)
            .Select(e => e.SessionId)
            .ToListAsync();

        var results = new List<SpecialSessionDto>();
        foreach (var sessionId in sessionIds)
        {
            var mapped = await MapSessionAsync(sessionId, includeEnrollments: false);
            if (mapped is not null)
                results.Add(mapped);
        }

        return results;
    }

    /// <summary>Validates enrollment eligibility and returns the member ID and fee for payment.</summary>
    public async Task<(int memberId, decimal amount)?> PrepareEnrollmentPaymentAsync(int userId, int sessionId)
    {
        var member = await db.Members.FirstOrDefaultAsync(m => m.UserId == userId);
        if (member is null)
            return null;

        var session = await db.SpecialSessions.FindAsync(sessionId);
        if (session is null || session.Status != "Accepted")
            throw new InvalidOperationException("This session is not available for enrollment.");

        if (session.EndDateTime < DateTime.UtcNow)
            throw new InvalidOperationException("This session has already ended.");

        var enrolledCount = await GetEnrolledCountAsync(sessionId);
        if (enrolledCount >= session.MaxParticipants)
            throw new InvalidOperationException("This session is full.");

        var alreadyEnrolled = await db.SpecialSessionEnrollments
            .AnyAsync(e => e.SessionId == sessionId && e.MemberId == member.MemberId);

        if (alreadyEnrolled)
            throw new InvalidOperationException("You are already enrolled in this session.");

        return (member.MemberId, session.FeePerPersonLKR);
    }

    /// <summary>Records enrollment after a completed session-fee payment.</summary>
    public async Task<bool> CompleteEnrollmentAfterPaymentAsync(int memberId, int sessionId, Payment payment)
    {
        var session = await db.SpecialSessions.FindAsync(sessionId);
        if (session is null || session.Status != "Accepted")
            return false;

        var enrolledCount = await GetEnrolledCountAsync(sessionId);
        if (enrolledCount >= session.MaxParticipants)
            return false;

        var exists = await db.SpecialSessionEnrollments
            .AnyAsync(e => e.SessionId == sessionId && e.MemberId == memberId);

        if (exists)
            return false;

        db.SpecialSessionEnrollments.Add(new SpecialSessionEnrollment
        {
            SessionId = sessionId,
            MemberId = memberId,
            PaymentId = payment.PaymentId
        });

        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Resolves the member ID linked to a user account, if any.</summary>
    public async Task<int?> GetMemberIdForUserAsync(int userId) =>
        await db.Members.Where(m => m.UserId == userId).Select(m => m.MemberId).Cast<int?>().FirstOrDefaultAsync();

    private async Task<bool> HasAcceptedTimeConflictAsync(SpecialSession session) =>
        await db.SpecialSessions.AnyAsync(s =>
            s.SessionId != session.SessionId &&
            s.Status == "Accepted" &&
            s.StartDateTime < session.EndDateTime &&
            s.EndDateTime > session.StartDateTime);

    private async Task<int> GetEnrolledCountAsync(int sessionId) =>
        await db.SpecialSessionEnrollments.CountAsync(e => e.SessionId == sessionId);

    private async Task<HashSet<int>> GetEnrolledSessionIdsAsync(int memberId) =>
        (await db.SpecialSessionEnrollments
            .Where(e => e.MemberId == memberId)
            .Select(e => e.SessionId)
            .ToListAsync())
        .ToHashSet();

    private async Task<SpecialSessionDto?> MapSessionAsync(int sessionId, bool includeEnrollments)
    {
        var session = await db.SpecialSessions
            .Include(s => s.Instructor).ThenInclude(i => i.User)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session is null)
            return null;

        var enrolledCount = await GetEnrolledCountAsync(sessionId);
        var hasConflict = session.Status == "Pending" && await HasAcceptedTimeConflictAsync(session);

        IReadOnlyList<SpecialSessionEnrollmentDto>? enrollments = null;
        if (includeEnrollments)
        {
            enrollments = await db.SpecialSessionEnrollments
                .Include(e => e.Member).ThenInclude(m => m.User)
                .Where(e => e.SessionId == sessionId)
                .OrderBy(e => e.EnrolledAt)
                .Select(e => new SpecialSessionEnrollmentDto(
                    e.MemberId,
                    e.Member.User.FirstName + " " + e.Member.User.LastName,
                    e.Member.User.Email,
                    e.EnrolledAt))
                .ToListAsync();
        }

        return new SpecialSessionDto(
            session.SessionId,
            session.Title,
            session.Description,
            session.StartDateTime,
            session.EndDateTime,
            session.FeePerPersonLKR,
            session.MaxParticipants,
            enrolledCount,
            Math.Max(0, session.MaxParticipants - enrolledCount),
            session.Status,
            SpecialSessionHelper.GetRuntimeStatus(session),
            hasConflict,
            session.Instructor.User.FirstName + " " + session.Instructor.User.LastName,
            session.InstructorId,
            session.RejectionReason,
            session.CreatedAt,
            enrollments);
    }
}
