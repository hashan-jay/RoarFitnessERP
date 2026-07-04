using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Special session API — instructor requests, admin approval, and member enrollment.</summary>
[ApiController]
[Route("api/special-sessions")]
[Produces("application/json")]
public class SpecialSessionController(ISpecialSessionService sessions) : ControllerBase
{
    /// <summary>List special sessions submitted by the logged-in instructor.</summary>
    [Authorize(Roles = "Instructor")]
    [HttpGet("instructor")]
    [ProducesResponseType(typeof(IReadOnlyList<SpecialSessionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetInstructorSessions()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await sessions.GetInstructorSessionsAsync(userId));
    }

    /// <summary>Submit a new special session request for admin approval (Instructor).</summary>
    [Authorize(Roles = "Instructor")]
    [HttpPost("instructor/request")]
    [ProducesResponseType(typeof(SpecialSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CreateRequest([FromBody] CreateSpecialSessionRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var created = await sessions.CreateRequestAsync(userId, request);
            return created is null
                ? BadRequest(new { message = "Instructor profile not found." })
                : Ok(created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>List session requests for admin review, optionally filtered by status.</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    [ProducesResponseType(typeof(IReadOnlyList<SpecialSessionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetAdminSessions([FromQuery] string? status) =>
        Ok(await sessions.GetAdminSessionsAsync(status));

    /// <summary>List accepted sessions for the admin calendar view.</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/calendar")]
    [ProducesResponseType(typeof(IReadOnlyList<SpecialSessionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetCalendarSessions() =>
        Ok(await sessions.GetAcceptedCalendarSessionsAsync());

    /// <summary>Get full detail of a session including enrollments (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/{sessionId:int}")]
    [ProducesResponseType(typeof(SpecialSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetAdminSessionDetail(int sessionId)
    {
        var session = await sessions.GetSessionDetailAsync(sessionId);
        return session is null ? NotFound() : Ok(session);
    }

    /// <summary>Approve a pending special session request (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("admin/{sessionId:int}/accept")]
    [ProducesResponseType(typeof(SpecialSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> AcceptSession(int sessionId)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var session = await sessions.AcceptSessionAsync(sessionId, userId);
            return session is null
                ? NotFound(new { message = "Pending session request not found." })
                : Ok(session);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Reject a pending special session request with an optional reason (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("admin/{sessionId:int}/reject")]
    [ProducesResponseType(typeof(SpecialSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> RejectSession(int sessionId, [FromBody] ReviewSpecialSessionRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var session = await sessions.RejectSessionAsync(sessionId, userId, request);
        return session is null
            ? NotFound(new { message = "Pending session request not found." })
            : Ok(session);
    }

    /// <summary>List accepted sessions open for enrollment (Member).</summary>
    [Authorize(Roles = "Member")]
    [HttpGet("member/available")]
    [ProducesResponseType(typeof(IReadOnlyList<SpecialSessionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetAvailableSessions()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await sessions.GetAvailableSessionsForMemberAsync(userId));
    }

    /// <summary>List sessions the logged-in member is enrolled in.</summary>
    [Authorize(Roles = "Member")]
    [HttpGet("member/mine")]
    [ProducesResponseType(typeof(IReadOnlyList<SpecialSessionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetMySessions()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await sessions.GetMemberEnrollmentsAsync(userId));
    }
}
