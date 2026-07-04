using Microsoft.EntityFrameworkCore;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Services;

/// <summary>CRUD operations for instructor-authored member fitness and meal plans.</summary>
public class MemberPlanService(AppDbContext db) : IMemberPlanService
{
    /// <summary>Lists members available for plan assignment by the logged-in instructor.</summary>
    public async Task<IReadOnlyList<MemberPlanMemberOptionDto>> GetMembersForPlanningAsync() =>
        await db.Members
            .Include(m => m.User)
            .OrderBy(m => m.User.FirstName)
            .ThenBy(m => m.User.LastName)
            .Select(m => new MemberPlanMemberOptionDto(
                m.MemberId,
                m.IdentificationNumber,
                m.User.FirstName + " " + m.User.LastName,
                m.User.Email))
            .ToListAsync();

    /// <summary>Returns plan summaries authored by the logged-in instructor.</summary>
    public async Task<IReadOnlyList<MemberFitnessPlanSummaryDto>> GetInstructorPlansAsync(int userId)
    {
        var instructorId = await GetInstructorIdAsync(userId);
        if (instructorId is null)
            return [];

        return await db.MemberFitnessPlans
            .Include(p => p.Member).ThenInclude(m => m.User)
            .Include(p => p.Instructor).ThenInclude(i => i.User)
            .Where(p => p.InstructorId == instructorId)
            .OrderByDescending(p => p.UpdatedAt)
            .Select(p => new MemberFitnessPlanSummaryDto(
                p.PlanId,
                p.MemberId,
                p.Member.User.FirstName + " " + p.Member.User.LastName,
                p.Instructor.User.FirstName + " " + p.Instructor.User.LastName,
                p.Title,
                p.FitnessGoal,
                p.UpdatedAt))
            .ToListAsync();
    }

    /// <summary>Creates a new fitness plan for a member on behalf of the logged-in instructor.</summary>
    public async Task<MemberFitnessPlanDto?> CreatePlanAsync(int userId, CreateMemberFitnessPlanRequest request)
    {
        var instructorId = await GetInstructorIdAsync(userId);
        if (instructorId is null)
            return null;

        if (!await db.Members.AnyAsync(m => m.MemberId == request.MemberId))
            throw new InvalidOperationException("Member not found.");

        ValidatePlanContent(request.Title, request.FitnessGoal, request.WorkoutPlan, request.MealPlan);

        var plan = new MemberFitnessPlan
        {
            MemberId = request.MemberId,
            InstructorId = instructorId.Value,
            Title = request.Title.Trim(),
            FitnessGoal = request.FitnessGoal.Trim(),
            WorkoutPlan = request.WorkoutPlan.Trim(),
            MealPlan = request.MealPlan.Trim(),
            Notes = request.Notes?.Trim()
        };

        db.MemberFitnessPlans.Add(plan);
        await db.SaveChangesAsync();

        return await GetPlanDtoAsync(plan.PlanId);
    }

    /// <summary>Updates an existing plan owned by the logged-in instructor.</summary>
    public async Task<MemberFitnessPlanDto?> UpdatePlanAsync(int userId, int planId, UpdateMemberFitnessPlanRequest request)
    {
        var instructorId = await GetInstructorIdAsync(userId);
        if (instructorId is null)
            return null;

        var plan = await db.MemberFitnessPlans
            .FirstOrDefaultAsync(p => p.PlanId == planId && p.InstructorId == instructorId);

        if (plan is null)
            return null;

        ValidatePlanContent(request.Title, request.FitnessGoal, request.WorkoutPlan, request.MealPlan);

        plan.Title = request.Title.Trim();
        plan.FitnessGoal = request.FitnessGoal.Trim();
        plan.WorkoutPlan = request.WorkoutPlan.Trim();
        plan.MealPlan = request.MealPlan.Trim();
        plan.Notes = request.Notes?.Trim();
        plan.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return await GetPlanDtoAsync(plan.PlanId);
    }

    /// <summary>Deletes a plan owned by the logged-in instructor.</summary>
    public async Task<bool> DeletePlanAsync(int userId, int planId)
    {
        var instructorId = await GetInstructorIdAsync(userId);
        if (instructorId is null)
            return false;

        var plan = await db.MemberFitnessPlans
            .FirstOrDefaultAsync(p => p.PlanId == planId && p.InstructorId == instructorId);

        if (plan is null)
            return false;

        db.MemberFitnessPlans.Remove(plan);
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Returns full plan detail when owned by the logged-in instructor.</summary>
    public async Task<MemberFitnessPlanDto?> GetPlanForInstructorAsync(int userId, int planId)
    {
        var instructorId = await GetInstructorIdAsync(userId);
        if (instructorId is null)
            return null;

        var exists = await db.MemberFitnessPlans
            .AnyAsync(p => p.PlanId == planId && p.InstructorId == instructorId);

        return exists ? await GetPlanDtoAsync(planId) : null;
    }

    /// <summary>Returns plan summaries assigned to the logged-in member.</summary>
    public async Task<IReadOnlyList<MemberFitnessPlanSummaryDto>> GetMemberPlansAsync(int userId)
    {
        var memberId = await GetMemberIdAsync(userId);
        if (memberId is null)
            return [];

        return await db.MemberFitnessPlans
            .Include(p => p.Member).ThenInclude(m => m.User)
            .Include(p => p.Instructor).ThenInclude(i => i.User)
            .Where(p => p.MemberId == memberId)
            .OrderByDescending(p => p.UpdatedAt)
            .Select(p => new MemberFitnessPlanSummaryDto(
                p.PlanId,
                p.MemberId,
                p.Member.User.FirstName + " " + p.Member.User.LastName,
                p.Instructor.User.FirstName + " " + p.Instructor.User.LastName,
                p.Title,
                p.FitnessGoal,
                p.UpdatedAt))
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

    private async Task<MemberFitnessPlanDto?> GetPlanDtoAsync(int planId) =>
        await db.MemberFitnessPlans
            .Include(p => p.Member).ThenInclude(m => m.User)
            .Include(p => p.Instructor).ThenInclude(i => i.User)
            .Where(p => p.PlanId == planId)
            .Select(p => new MemberFitnessPlanDto(
                p.PlanId,
                p.MemberId,
                p.Member.User.FirstName + " " + p.Member.User.LastName,
                p.Member.IdentificationNumber,
                p.InstructorId,
                p.Instructor.User.FirstName + " " + p.Instructor.User.LastName,
                p.Title,
                p.FitnessGoal,
                p.WorkoutPlan,
                p.MealPlan,
                p.Notes,
                p.CreatedAt,
                p.UpdatedAt))
            .FirstOrDefaultAsync();

    private async Task<int?> GetInstructorIdAsync(int userId) =>
        await db.Instructors.Where(i => i.UserId == userId).Select(i => (int?)i.InstructorId).FirstOrDefaultAsync();

    private async Task<int?> GetMemberIdAsync(int userId) =>
        await db.Members.Where(m => m.UserId == userId).Select(m => (int?)m.MemberId).FirstOrDefaultAsync();

    private static void ValidatePlanContent(string title, string fitnessGoal, string workoutPlan, string mealPlan)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new InvalidOperationException("Plan title is required.");

        if (string.IsNullOrWhiteSpace(fitnessGoal))
            throw new InvalidOperationException("Fitness goal is required.");

        if (string.IsNullOrWhiteSpace(workoutPlan))
            throw new InvalidOperationException("Workout plan content is required.");

        if (string.IsNullOrWhiteSpace(mealPlan))
            throw new InvalidOperationException("Meal plan content is required.");
    }
}
