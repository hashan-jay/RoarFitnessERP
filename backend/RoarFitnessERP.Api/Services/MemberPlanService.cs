using Microsoft.EntityFrameworkCore;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Services;

/// <summary>Member plan requests and instructor-approved workout/meal plans.</summary>
public class MemberPlanService(AppDbContext db) : IMemberPlanService
{
    private static readonly HashSet<string> ValidCategories = ["Workout", "Meal"];

    /// <summary>Lists active instructors available for plan requests.</summary>
    public async Task<IReadOnlyList<PlanInstructorOptionDto>> GetInstructorsForPlanningAsync() =>
        await db.Instructors
            .Include(i => i.User)
            .Where(i => !i.IsTerminated)
            .OrderBy(i => i.User.FirstName)
            .ThenBy(i => i.User.LastName)
            .Select(i => new PlanInstructorOptionDto(
                i.InstructorId,
                i.User.FirstName + " " + i.User.LastName,
                i.Specialization))
            .ToListAsync();

    /// <summary>Creates a pending plan request from the logged-in member.</summary>
    public async Task<MemberPlanRequestDto?> CreatePlanRequestAsync(int userId, CreateMemberPlanRequest request)
    {
        var memberId = await GetMemberIdAsync(userId);
        if (memberId is null)
            return null;

        ValidateRequestInput(request.InstructorId, request.PlanCategory);

        if (!await db.Instructors.AnyAsync(i => i.InstructorId == request.InstructorId && !i.IsTerminated))
            throw new InvalidOperationException("Instructor not found.");

        var planRequest = new MemberPlanRequest
        {
            MemberId = memberId.Value,
            InstructorId = request.InstructorId,
            PlanCategory = request.PlanCategory.Trim(),
            MemberNote = request.MemberNote?.Trim(),
            Status = "Pending",
            CreatedAt = AppTime.Now()
        };

        db.MemberPlanRequests.Add(planRequest);
        await db.SaveChangesAsync();

        return await GetRequestDtoAsync(planRequest.RequestId);
    }

    /// <summary>Returns pending plan requests submitted by the logged-in member.</summary>
    public async Task<IReadOnlyList<MemberPlanRequestDto>> GetMemberPendingRequestsAsync(int userId)
    {
        var memberId = await GetMemberIdAsync(userId);
        if (memberId is null)
            return [];

        return await db.MemberPlanRequests
            .AsNoTracking()
            .Where(r => r.MemberId == memberId && r.Status == "Pending")
            .OrderByDescending(r => r.CreatedAt)
            .Select(MapRequestDtoExpression())
            .ToListAsync();
    }

    /// <summary>Returns pending plan requests assigned to the logged-in instructor.</summary>
    public async Task<IReadOnlyList<MemberPlanRequestDto>> GetPendingRequestsAsync(int userId)
    {
        var instructorId = await GetInstructorIdAsync(userId);
        if (instructorId is null)
            return [];

        return await db.MemberPlanRequests
            .AsNoTracking()
            .Where(r => r.InstructorId == instructorId && r.Status == "Pending")
            .OrderBy(r => r.CreatedAt)
            .Select(MapRequestDtoExpression())
            .ToListAsync();
    }

    /// <summary>Approves a pending request and sends the plan to the member.</summary>
    public async Task<MemberFitnessPlanDto?> ApprovePlanRequestAsync(
        int userId,
        int requestId,
        ApproveMemberPlanRequest request)
    {
        var instructorId = await GetInstructorIdAsync(userId);
        if (instructorId is null)
            return null;

        if (string.IsNullOrWhiteSpace(request.Description))
            throw new InvalidOperationException("Plan description is required.");

        var planRequest = await db.MemberPlanRequests
            .FirstOrDefaultAsync(r =>
                r.RequestId == requestId &&
                r.InstructorId == instructorId &&
                r.Status == "Pending");

        if (planRequest is null)
            return null;

        var now = AppTime.Now();
        var plan = new MemberFitnessPlan
        {
            RequestId = planRequest.RequestId,
            MemberId = planRequest.MemberId,
            InstructorId = planRequest.InstructorId,
            PlanCategory = planRequest.PlanCategory,
            Description = request.Description.Trim(),
            Notes = request.Notes?.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        db.MemberFitnessPlans.Add(plan);
        await db.SaveChangesAsync();

        planRequest.Status = "Approved";
        planRequest.PlanId = plan.PlanId;
        planRequest.ApprovedAt = now;

        await db.SaveChangesAsync();

        return await GetPlanDtoAsync(plan.PlanId);
    }

    /// <summary>Returns approved plan summaries assigned to the logged-in member.</summary>
    public async Task<IReadOnlyList<MemberFitnessPlanSummaryDto>> GetMemberPlansAsync(int userId)
    {
        var memberId = await GetMemberIdAsync(userId);
        if (memberId is null)
            return [];

        return await db.MemberFitnessPlans
            .AsNoTracking()
            .Where(p => p.MemberId == memberId)
            .OrderByDescending(p => p.UpdatedAt)
            .Select(MapPlanSummaryExpression())
            .ToListAsync();
    }

    /// <summary>Returns approved plan summaries created by the logged-in instructor.</summary>
    public async Task<IReadOnlyList<MemberFitnessPlanSummaryDto>> GetInstructorPlansAsync(int userId)
    {
        var instructorId = await GetInstructorIdAsync(userId);
        if (instructorId is null)
            return [];

        return await db.MemberFitnessPlans
            .AsNoTracking()
            .Where(p => p.InstructorId == instructorId)
            .OrderByDescending(p => p.UpdatedAt)
            .Select(MapPlanSummaryExpression())
            .ToListAsync();
    }

    /// <summary>Returns full plan detail when assigned to the logged-in member.</summary>
    public async Task<MemberFitnessPlanDto?> GetPlanForMemberAsync(int userId, int planId)
    {
        var memberId = await GetMemberIdAsync(userId);
        if (memberId is null)
            return null;

        var exists = await db.MemberFitnessPlans
            .AnyAsync(p => p.PlanId == planId && p.MemberId == memberId);

        return exists ? await GetPlanDtoAsync(planId) : null;
    }

    /// <summary>Returns full plan detail when created by the logged-in instructor.</summary>
    public async Task<MemberFitnessPlanDto?> GetPlanForInstructorAsync(int userId, int planId)
    {
        var instructorId = await GetInstructorIdAsync(userId);
        if (instructorId is null)
            return null;

        var exists = await db.MemberFitnessPlans
            .AnyAsync(p => p.PlanId == planId && p.InstructorId == instructorId);

        return exists ? await GetPlanDtoAsync(planId) : null;
    }

    private async Task<MemberPlanRequestDto?> GetRequestDtoAsync(int requestId) =>
        await db.MemberPlanRequests
            .AsNoTracking()
            .Where(r => r.RequestId == requestId)
            .Select(MapRequestDtoExpression())
            .FirstOrDefaultAsync();

    private async Task<MemberFitnessPlanDto?> GetPlanDtoAsync(int planId) =>
        await db.MemberFitnessPlans
            .AsNoTracking()
            .Where(p => p.PlanId == planId)
            .Select(p => new MemberFitnessPlanDto(
                p.PlanId,
                p.RequestId,
                p.MemberId,
                p.Member.User.FirstName + " " + p.Member.User.LastName,
                p.Member.IdentificationNumber,
                p.InstructorId,
                p.Instructor.User.FirstName + " " + p.Instructor.User.LastName,
                p.PlanCategory,
                p.Description,
                p.Notes,
                p.CreatedAt,
                p.UpdatedAt))
            .FirstOrDefaultAsync();

    private static System.Linq.Expressions.Expression<Func<MemberPlanRequest, MemberPlanRequestDto>> MapRequestDtoExpression() =>
        r => new MemberPlanRequestDto(
            r.RequestId,
            r.MemberId,
            r.Member.User.FirstName + " " + r.Member.User.LastName,
            r.Member.IdentificationNumber,
            r.InstructorId,
            r.Instructor.User.FirstName + " " + r.Instructor.User.LastName,
            r.PlanCategory,
            r.MemberNote,
            r.Status,
            r.CreatedAt,
            r.ApprovedAt,
            r.PlanId);

    private static System.Linq.Expressions.Expression<Func<MemberFitnessPlan, MemberFitnessPlanSummaryDto>> MapPlanSummaryExpression() =>
        p => new MemberFitnessPlanSummaryDto(
            p.PlanId,
            p.MemberId,
            p.Member.User.FirstName + " " + p.Member.User.LastName,
            p.Member.IdentificationNumber,
            p.Instructor.User.FirstName + " " + p.Instructor.User.LastName,
            p.PlanCategory,
            p.UpdatedAt);

    private async Task<int?> GetInstructorIdAsync(int userId) =>
        await db.Instructors.Where(i => i.UserId == userId).Select(i => (int?)i.InstructorId).FirstOrDefaultAsync();

    private async Task<int?> GetMemberIdAsync(int userId) =>
        await db.Members.Where(m => m.UserId == userId).Select(m => (int?)m.MemberId).FirstOrDefaultAsync();

    private static void ValidateRequestInput(int instructorId, string planCategory)
    {
        if (instructorId <= 0)
            throw new InvalidOperationException("Instructor is required.");

        var category = planCategory?.Trim() ?? string.Empty;
        if (!ValidCategories.Contains(category))
            throw new InvalidOperationException("Plan category must be Workout or Meal.");
    }
}
