using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Membership API — packages, registration, profiles, admin member/instructor management.</summary>
[ApiController]
[Route("api/membership")]
[Produces("application/json")]
public class MembershipController(IMembershipService membership) : ControllerBase
{
    /// <summary>List active membership packages (public).</summary>
    [HttpGet("packages")]
    [ProducesResponseType(typeof(IReadOnlyList<PackageDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetPackages() =>
        Ok(await membership.GetPackagesAsync());

    /// <summary>Register a new member online (JOIN US flow). Account activates after payment.</summary>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Register([FromBody] RegisterMemberRequest request)
    {
        var result = await membership.RegisterOnlineAsync(request);
        if (result is null)
            return BadRequest(new { message = "Registration failed. Email may already exist or package invalid." });

        return Ok(new
        {
            message = "Account created. Proceed to payment to activate membership.",
            memberId = result.Value.member.MemberId,
            identificationNumber = result.Value.member.IdentificationNumber,
            packageId = request.PackageId
        });
    }

    /// <summary>Get logged-in member profile, membership status, and fingerprint activation flag.</summary>
    [Authorize(Roles = "Member")]
    [HttpGet("profile")]
    [ProducesResponseType(typeof(MemberProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Profile()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var profile = await membership.GetProfileAsync(userId);
        return profile is null ? NotFound() : Ok(profile);
    }

    /// <summary>Update editable member profile fields (address, emergency contact, phone).</summary>
    [Authorize(Roles = "Member")]
    [HttpPut("profile")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var updated = await membership.UpdateMemberProfileAsync(userId, request);
        return updated ? Ok(new { message = "Profile updated." }) : NotFound();
    }

    /// <summary>Get logged-in instructor profile.</summary>
    [Authorize(Roles = "Instructor")]
    [HttpGet("instructor/profile")]
    [ProducesResponseType(typeof(InstructorProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> InstructorProfile()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var profile = await membership.GetInstructorProfileAsync(userId);
        return profile is null ? NotFound() : Ok(profile);
    }

    /// <summary>List gym members for admin, optionally filtered by lifecycle section.</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("members")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminMemberListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> ListMembers([FromQuery] string? section = "all") =>
        Ok(await membership.ListMembersForAdminAsync(section));

    /// <summary>Update a member account (name, email, NIC, password) with member permission.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("members/{memberId:int}/account")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UpdateMemberAccount(int memberId, [FromBody] AdminUpdateMemberAccountRequest request)
    {
        var ok = await membership.UpdateMemberAccountByAdminAsync(memberId, request);
        return ok
            ? Ok(new { message = "Member account updated." })
            : BadRequest(new { message = "Could not update member account. Check details and member permission." });
    }

    /// <summary>Terminate a member — blocks login and fingerprint access.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("members/{memberId:int}/terminate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> TerminateMember(int memberId)
    {
        var ok = await membership.TerminateMemberAsync(memberId);
        return ok
            ? Ok(new { message = "Member terminated." })
            : BadRequest(new { message = "Could not terminate member." });
    }

    /// <summary>Reinstate a terminated member back into the roster.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("members/{memberId:int}/reinstate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> ReinstateMember(int memberId)
    {
        var ok = await membership.ReinstateMemberAsync(memberId);
        return ok
            ? Ok(new { message = "Member reinstated." })
            : BadRequest(new { message = "Could not reinstate member." });
    }

    /// <summary>Search members for in-gym membership purchase or renewal.</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("members/renew/search")]
    [ProducesResponseType(typeof(IReadOnlyList<MemberRenewSearchItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> SearchMembersForRenewal([FromQuery] string? q) =>
        Ok(await membership.SearchMembersForRenewalAsync(q ?? string.Empty));

    /// <summary>Record in-gym membership payment and queue or activate the next membership period.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("members/{memberId:int}/renew/in-gym")]
    [ProducesResponseType(typeof(MembershipRenewBillDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> RenewMembershipInGym(int memberId, [FromBody] AdminMembershipRenewRequest request)
    {
        var bill = await membership.RenewMembershipInGymAsync(memberId, request);
        return bill is null
            ? BadRequest(new { message = "Could not process membership payment. Member may be terminated or the package is invalid." })
            : Ok(bill);
    }

    /// <summary>Create a member account at the gym front desk (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("members")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CreateMember([FromBody] CreateUserByAdminRequest request)
    {
        request = request with { Role = "Member" };
        var result = await membership.CreateMemberByAdminAsync(request);
        return result is null
            ? BadRequest(new { message = "Could not create member." })
            : Ok(new { message = "Member created.", memberId = result.Value.member.MemberId, identificationNumber = result.Value.member.IdentificationNumber });
    }

    /// <summary>List instructors for admin, optionally filtered by lifecycle section.</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("instructors")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminInstructorListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> ListInstructors([FromQuery] string? section = "all") =>
        Ok(await membership.ListInstructorsForAdminAsync(section));

    /// <summary>Update an instructor account with instructor permission.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("instructors/{instructorId:int}/account")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UpdateInstructorAccount(int instructorId, [FromBody] AdminUpdateInstructorAccountRequest request)
    {
        var ok = await membership.UpdateInstructorAccountByAdminAsync(instructorId, request);
        return ok
            ? Ok(new { message = "Instructor account updated." })
            : BadRequest(new { message = "Could not update instructor account. Check details and instructor permission." });
    }

    /// <summary>Upload or replace an instructor profile photo for the public website.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("instructors/{instructorId:int}/photo")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UploadInstructorPhoto(int instructorId, [FromForm] UploadInstructorPhotoForm form)
    {
        if (form.Photo is null || form.Photo.Length <= 0)
            return BadRequest(new { message = "No photo file was received." });

        var url = await membership.UploadInstructorPhotoAsync(instructorId, form.Photo);
        return url is null
            ? BadRequest(new { message = "Could not upload photo. Use JPG, PNG, or WebP up to 5 MB." })
            : Ok(new { message = "Profile photo updated.", photoUrl = url });
    }

    /// <summary>Terminate an instructor who has left the gym.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("instructors/{instructorId:int}/terminate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> TerminateInstructor(int instructorId)
    {
        var ok = await membership.TerminateInstructorAsync(instructorId);
        return ok
            ? Ok(new { message = "Instructor terminated." })
            : BadRequest(new { message = "Could not terminate instructor." });
    }

    /// <summary>Reinstate a terminated instructor returning to Roar Fitness.</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("instructors/{instructorId:int}/reinstate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> ReinstateInstructor(int instructorId)
    {
        var ok = await membership.ReinstateInstructorAsync(instructorId);
        return ok
            ? Ok(new { message = "Instructor reinstated." })
            : BadRequest(new { message = "Could not reinstate instructor." });
    }

    /// <summary>Create an instructor account (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("instructors")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CreateInstructor([FromBody] CreateUserByAdminRequest request)
    {
        request = request with { Role = "Instructor" };
        var result = await membership.CreateInstructorByAdminAsync(request);
        return result is null
            ? BadRequest(new { message = "Could not create instructor." })
            : Ok(new { message = "Instructor created.", instructorId = result.Value.instructor.InstructorId, identificationNumber = result.Value.instructor.IdentificationNumber });
    }

    /// <summary>List all membership packages including inactive (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("packages/admin")]
    [ProducesResponseType(typeof(IReadOnlyList<PackageDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetAllPackagesAdmin() =>
        Ok(await membership.GetAllPackagesAdminAsync());

    /// <summary>List membership package billing types (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("packages/types")]
    [ProducesResponseType(typeof(IReadOnlyList<PackageTypeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetPackageTypes() =>
        Ok(await membership.GetPackageTypesAsync());

    /// <summary>Create a membership package (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("packages")]
    [ProducesResponseType(typeof(PackageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CreatePackage([FromBody] CreatePackageRequest request)
    {
        var package = await membership.CreatePackageAsync(request);
        return package is null
            ? BadRequest(new { message = "Could not create package. Check package type." })
            : Ok(package);
    }

    /// <summary>Update a membership package (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("packages/{packageId:int}")]
    [ProducesResponseType(typeof(PackageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdatePackage(int packageId, [FromBody] UpdatePackageRequest request)
    {
        var package = await membership.UpdatePackageAsync(packageId, request);
        return package is null
            ? NotFound(new { message = "Package not found or invalid type." })
            : Ok(package);
    }

    /// <summary>Deactivate a membership package (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("packages/{packageId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeletePackage(int packageId)
    {
        var ok = await membership.DeletePackageAsync(packageId);
        return ok ? Ok(new { message = "Package deactivated." }) : NotFound(new { message = "Package not found." });
    }
}
