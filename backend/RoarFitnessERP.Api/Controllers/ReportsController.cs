using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Reports API — company revenue, sold items, and monthly summaries.</summary>
[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class ReportsController(IReportService reports) : ControllerBase
{
    /// <summary>Get full revenue summary: membership, shop, POS, session fees, and recent orders.</summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ReportSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult> Summary() =>
        Ok(await reports.GetSummaryAsync());

    /// <summary>Get monthly revenue breakdown and sold items for printing.</summary>
    /// <param name="year">Calendar year (e.g. 2026).</param>
    /// <param name="month">Month number 1–12.</param>
    [HttpGet("monthly")]
    [ProducesResponseType(typeof(MonthlyReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult> Monthly([FromQuery] int year, [FromQuery] int month)
    {
        if (year < 2000 || month is < 1 or > 12)
            return BadRequest(new { message = "Invalid year or month." });

        return Ok(await reports.GetMonthlyReportAsync(year, month));
    }
}
