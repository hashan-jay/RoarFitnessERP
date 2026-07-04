using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Public Website API — packages, trainers, and contact (no auth required).</summary>
[ApiController]
[Route("api/public")]
[Produces("application/json")]
public class PublicController(
    IPublicContentService content,
    IMembershipService membership) : ControllerBase
{
    /// <summary>Membership packages shown on the public website.</summary>
    [HttpGet("packages")]
    [ProducesResponseType(typeof(IReadOnlyList<PackageDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Packages() =>
        Ok(await membership.GetPackagesAsync());

    /// <summary>Legacy trainer profiles (marketing CMS table).</summary>
    [HttpGet("trainers")]
    [ProducesResponseType(typeof(IReadOnlyList<TrainerDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Trainers() =>
        Ok(await content.GetTrainersAsync());

    /// <summary>Submit a contact form message from the public website.</summary>
    [HttpPost("contact")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> Contact([FromBody] ContactRequest request)
    {
        await content.SubmitContactAsync(request);
        return Ok(new { message = "Thank you. We will contact you soon." });
    }
}
