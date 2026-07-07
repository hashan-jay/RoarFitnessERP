using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Public Website API — packages, trainers, and contact (no auth required).</summary>
[ApiController]
[Route("api/public")]
[Produces("application/json")]
public class PublicController(
    IPublicContentService content,
    IMembershipService membership,
    IGeneralClassService generalClasses,
    ISpecialSessionService specialSessions) : ControllerBase
{
    /// <summary>Membership packages shown on the public website.</summary>
    [HttpGet("packages")]
    [ProducesResponseType(typeof(IReadOnlyList<PackageDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Packages() =>
        Ok(await membership.GetPackagesAsync());

    /// <summary>Active instructor profiles for the public website coaches section.</summary>
    [HttpGet("trainers")]
    [ProducesResponseType(typeof(IReadOnlyList<PublicInstructorDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Trainers() =>
        Ok(await membership.GetPublicInstructorsAsync());

    /// <summary>Recurring weekly general classes for the public website schedule.</summary>
    [HttpGet("general-classes")]
    [ProducesResponseType(typeof(IReadOnlyList<PublicGeneralClassDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GeneralClasses() =>
        Ok(await generalClasses.GetPublicAsync());

    /// <summary>Accepted VIP sessions on a Colombo calendar date for the public website schedule.</summary>
    [HttpGet("vip-sessions")]
    [ProducesResponseType(typeof(IReadOnlyList<PublicVipSessionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> VipSessions([FromQuery] string? date)
    {
        var colomboDate = ProfileHelper.ParseAppDate(date) ?? ProfileHelper.GetAppToday();
        return Ok(await specialSessions.GetPublicAcceptedSessionsForDateAsync(colomboDate));
    }

    /// <summary>Submit a contact form message from the public website.</summary>
    [HttpPost("contact")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> Contact([FromBody] ContactRequest request)
    {
        await content.SubmitContactAsync(request);
        return Ok(new { message = "Thank you. We will contact you soon." });
    }
}

