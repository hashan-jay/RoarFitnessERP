using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>POS API — in-gym point of sale integrated with ERP revenue tracking.</summary>
[ApiController]
[Route("api/pos")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class PosController(IPosService pos) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Record an in-gym POS sale (Cash or Card).</summary>
    [HttpPost("sale")]
    [ProducesResponseType(typeof(PosSaleResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Sale([FromBody] PosSaleRequest request)
    {
        var result = await pos.CreateInGymSaleAsync(request, UserId);
        return result is null
            ? BadRequest(new { message = "Sale failed. Check stock and items." })
            : Ok(result);
    }
}
