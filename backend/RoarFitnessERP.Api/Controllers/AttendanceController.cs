using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services;
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

    /// <summary>Get today's entry scan logs in Colombo time (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("logs/today")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> TodayLogs() =>
        Ok(await attendance.GetTodayLogsAsync());

    /// <summary>Get member gym entry logs for a Colombo calendar date (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("logs/members")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminMemberAttendanceLogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> MemberLogsByDate([FromQuery] string? date)
    {
        var colomboDate = ProfileHelper.ParseAppDate(date) ?? ProfileHelper.GetAppToday();
        return Ok(await attendance.GetMemberLogsByDateAsync(colomboDate));
    }

    /// <summary>Get gym entry logs for a Colombo calendar date (Admin). Filter: all, members, or instructors.</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("logs/admin")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminAttendanceLogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> AdminLogsByDate([FromQuery] string? date, [FromQuery] string filter = "all")
    {
        var colomboDate = ProfileHelper.ParseAppDate(date) ?? ProfileHelper.GetAppToday();
        return Ok(await attendance.GetAdminLogsByDateAsync(colomboDate, filter));
    }

    /// <summary>Get the logged-in member or instructor gym entry logs for a calendar month (Colombo).</summary>
    [Authorize(Roles = "Member,Instructor")]
    [HttpGet("logs/me")]
    [ProducesResponseType(typeof(IReadOnlyList<MemberAttendanceEntryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> MyLogs([FromQuery] int year, [FromQuery] int month)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await attendance.GetPersonLogsForMonthAsync(userId, year, month));
    }

    /// <summary>Get the logged-in instructor's gym entry logs for a calendar month (Colombo).</summary>
    [Authorize(Roles = "Instructor")]
    [HttpGet("logs/instructor/me")]
    [ProducesResponseType(typeof(IReadOnlyList<MemberAttendanceEntryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> InstructorMyLogs([FromQuery] int year, [FromQuery] int month)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await attendance.GetInstructorLogsForMonthAsync(userId, year, month));
    }

    /// <summary>List activated fingerprint templates (Admin — simulator / front desk).</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("fingerprint/enrolled")]
    [ProducesResponseType(typeof(IReadOnlyList<EnrolledFingerprintDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> EnrolledFingerprints() =>
        Ok(await attendance.GetEnrolledFingerprintsAsync());
}
