using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>General class schedule for the logged-in instructor.</summary>
[ApiController]
[Route("api/general-classes/instructor")]
[Authorize(Roles = "Instructor")]
[Produces("application/json")]
public class GeneralClassInstructorController(IGeneralClassService generalClasses) : ControllerBase
{
    /// <summary>Active general classes assigned to the logged-in instructor.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<PublicGeneralClassDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetMine()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await generalClasses.GetForInstructorAsync(userId));
    }
}
