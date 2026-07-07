using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Authentication API — login and session identity.</summary>
[ApiController]
[Route("api/authentication")]
[Produces("application/json")]
public class AuthenticationController(IAuthenticationService auth) : ControllerBase
{
    /// <summary>Login as Admin, Member, or Instructor. Returns a JWT bearer token.</summary>
    /// <response code="200">Login successful — use the token in Authorization header.</response>
    /// <response code="401">Invalid email or password.</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await auth.LoginAsync(request);
        if (result.IsTerminated)
            return Unauthorized(new { message = "Your membership account has been terminated. Please contact the gym admin to rejoin." });
        if (result.IsPendingActivation)
            return Unauthorized(new { message = "Account pending payment. Complete membership payment on the Join page to activate login." });
        if (result.Response is null)
            return Unauthorized(new { message = "Invalid credentials." });
        return Ok(result.Response);
    }

    /// <summary>Get the currently authenticated user profile and roles.</summary>
    /// <response code="200">Current user details.</response>
    /// <response code="401">Missing or invalid JWT.</response>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Me()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await auth.GetUserWithRolesAsync(userId);
        if (user is null) return NotFound();

        return Ok(new
        {
            user.UserId,
            user.Email,
            FullName = $"{user.FirstName} {user.LastName}",
            Roles = user.UserRoles.Select(r => r.Role.RoleName),
            MemberId = user.Member?.MemberId,
            InstructorId = user.Instructor?.InstructorId,
            user.Member?.IsFingerprintActivated
        });
    }
}
