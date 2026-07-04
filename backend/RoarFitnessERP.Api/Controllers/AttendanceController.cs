using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Attendance API — entry-only fingerprint validation and attendance logs.</summary>
[ApiController]
[Route("api/attendance")]
[Produces("application/json")]
public class AttendanceController(IAttendanceService attendance) : ControllerBase
{
    /// <summary>Process a fingerprint scan at the gym entrance. Validates membership and logs attendance.</summary>
    [HttpPost("scan")]
    [ProducesResponseType(typeof(FingerprintScanResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<FingerprintScanResponse>> Scan([FromBody] FingerprintScanRequest request) =>
        Ok(await attendance.ProcessScanAsync(request));

    /// <summary>Activate a member fingerprint after first gym visit (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("fingerprint/member/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> ActivateMemberFingerprint([FromBody] ActivateFingerprintRequest request)
    {
        var ok = await attendance.ActivateMemberFingerprintAsync(request);
        return ok ? Ok(new { message = "Member fingerprint activated." }) : NotFound();
    }

    /// <summary>Activate an instructor fingerprint (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("fingerprint/instructor/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> ActivateInstructorFingerprint([FromBody] ActivateInstructorFingerprintRequest request)
    {
        var ok = await attendance.ActivateInstructorFingerprintAsync(request);
        return ok ? Ok(new { message = "Instructor fingerprint activated." }) : NotFound();
    }

    /// <summary>Get today's entry scan logs (granted and denied).</summary>
    [Authorize(Roles = "Admin,Instructor")]
    [HttpGet("logs/today")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> TodayLogs() =>
        Ok(await attendance.GetTodayLogsAsync());
}
