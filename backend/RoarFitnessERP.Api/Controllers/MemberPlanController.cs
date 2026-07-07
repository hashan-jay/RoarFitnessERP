using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Member plan request API — members request plans; instructors approve and send them.</summary>
[ApiController]
[Route("api/member-plans")]
[Produces("application/json")]
public class MemberPlanController(IMemberPlanService memberPlans) : ControllerBase
{
    /// <summary>List active instructors available for plan requests (Member).</summary>
    [Authorize(Roles = "Member")]
    [HttpGet("instructors")]
    [ProducesResponseType(typeof(IReadOnlyList<PlanInstructorOptionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetInstructorsForPlanning() =>
        Ok(await memberPlans.GetInstructorsForPlanningAsync());

    /// <summary>Submit a workout or meal plan request to an instructor (Member).</summary>
    [Authorize(Roles = "Member")]
    [HttpPost("member/requests")]
    [ProducesResponseType(typeof(MemberPlanRequestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CreatePlanRequest([FromBody] CreateMemberPlanRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var planRequest = await memberPlans.CreatePlanRequestAsync(userId, request);
            return planRequest is null
                ? BadRequest(new { message = "Member profile not found." })
                : Ok(planRequest);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>List pending plan requests submitted by the logged-in member.</summary>
    [Authorize(Roles = "Member")]
    [HttpGet("member/requests")]
    [ProducesResponseType(typeof(IReadOnlyList<MemberPlanRequestDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetMemberPendingRequests()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await memberPlans.GetMemberPendingRequestsAsync(userId));
    }

    /// <summary>List pending plan requests for the logged-in instructor.</summary>
    [Authorize(Roles = "Instructor")]
    [HttpGet("instructor/pending")]
    [ProducesResponseType(typeof(IReadOnlyList<MemberPlanRequestDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetPendingRequests()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await memberPlans.GetPendingRequestsAsync(userId));
    }

    /// <summary>Approve a pending plan request and send the plan to the member (Instructor).</summary>
    [Authorize(Roles = "Instructor")]
    [HttpPost("instructor/pending/{requestId:int}/approve")]
    [ProducesResponseType(typeof(MemberFitnessPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> ApprovePlanRequest(int requestId, [FromBody] ApproveMemberPlanRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var plan = await memberPlans.ApprovePlanRequestAsync(userId, requestId, request);
            return plan is null ? NotFound() : Ok(plan);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>List approved plans assigned to the logged-in member.</summary>
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

    /// <summary>List approved plans created by the logged-in instructor.</summary>
    [Authorize(Roles = "Instructor")]
    [HttpGet("instructor")]
    [ProducesResponseType(typeof(IReadOnlyList<MemberFitnessPlanSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetInstructorPlans()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await memberPlans.GetInstructorPlansAsync(userId));
    }

    /// <summary>Get full detail of a plan created by the logged-in instructor.</summary>
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
}
