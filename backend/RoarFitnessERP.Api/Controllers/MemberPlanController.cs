using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Member fitness plan API — instructors create plans; members view assigned plans.</summary>
[ApiController]
[Route("api/member-plans")]
[Produces("application/json")]
public class MemberPlanController(IMemberPlanService memberPlans) : ControllerBase
{
    /// <summary>List members available for plan assignment (Instructor).</summary>
    [Authorize(Roles = "Instructor")]
    [HttpGet("instructor/members")]
    [ProducesResponseType(typeof(IReadOnlyList<MemberPlanMemberOptionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetMembersForPlanning() =>
        Ok(await memberPlans.GetMembersForPlanningAsync());

    /// <summary>List fitness plans authored by the logged-in instructor.</summary>
    [Authorize(Roles = "Instructor")]
    [HttpGet("instructor")]
    [ProducesResponseType(typeof(IReadOnlyList<MemberFitnessPlanSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetInstructorPlans()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await memberPlans.GetInstructorPlansAsync(userId));
    }

    /// <summary>Get full plan detail for an instructor-owned plan.</summary>
    [Authorize(Roles = "Instructor")]
    [HttpGet("instructor/{planId:int}")]
    [ProducesResponseType(typeof(MemberFitnessPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetInstructorPlan(int planId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var plan = await memberPlans.GetPlanForInstructorAsync(userId, planId);
        return plan is null ? NotFound() : Ok(plan);
    }

    /// <summary>Create a new fitness plan for a member (Instructor).</summary>
    [Authorize(Roles = "Instructor")]
    [HttpPost("instructor")]
    [ProducesResponseType(typeof(MemberFitnessPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CreatePlan([FromBody] CreateMemberFitnessPlanRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var plan = await memberPlans.CreatePlanAsync(userId, request);
            return plan is null
                ? BadRequest(new { message = "Instructor profile not found." })
                : Ok(plan);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Update an existing instructor-owned fitness plan.</summary>
    [Authorize(Roles = "Instructor")]
    [HttpPut("instructor/{planId:int}")]
    [ProducesResponseType(typeof(MemberFitnessPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdatePlan(int planId, [FromBody] UpdateMemberFitnessPlanRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var plan = await memberPlans.UpdatePlanAsync(userId, planId, request);
            return plan is null ? NotFound() : Ok(plan);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Delete an instructor-owned fitness plan.</summary>
    [Authorize(Roles = "Instructor")]
    [HttpDelete("instructor/{planId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeletePlan(int planId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var deleted = await memberPlans.DeletePlanAsync(userId, planId);
        return deleted ? Ok(new { message = "Plan deleted." }) : NotFound();
    }

    /// <summary>List fitness plans assigned to the logged-in member.</summary>
    [Authorize(Roles = "Member")]
    [HttpGet("member")]
    [ProducesResponseType(typeof(IReadOnlyList<MemberFitnessPlanSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetMemberPlans()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await memberPlans.GetMemberPlansAsync(userId));
    }

    /// <summary>Get full detail of a plan assigned to the logged-in member.</summary>
    [Authorize(Roles = "Member")]
    [HttpGet("member/{planId:int}")]
    [ProducesResponseType(typeof(MemberFitnessPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetMemberPlan(int planId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var plan = await memberPlans.GetPlanForMemberAsync(userId, planId);
        return plan is null ? NotFound() : Ok(plan);
    }
}
