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

    /// <summary>Upload a member profile photo (JPEG, PNG, or WebP up to 5 MB).</summary>
    [Authorize(Roles = "Member")]
    [HttpPost("profile/photo")]
    [ProducesResponseType(typeof(ProfilePhotoUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UploadMemberPhoto([FromForm] IFormFile photo, [FromServices] IWebHostEnvironment env)
    {
        if (photo is null || photo.Length == 0)
            return BadRequest(new { message = "Please choose a photo to upload." });

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var url = await membership.UploadMemberProfilePhotoAsync(userId, photo, env);
        return url is null
            ? BadRequest(new { message = "Could not upload photo. Use JPEG, PNG, or WebP under 5 MB." })
            : Ok(new ProfilePhotoUploadResponse(url));
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

    /// <summary>Update editable instructor profile fields.</summary>
    [Authorize(Roles = "Instructor")]
    [HttpPut("instructor/profile")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateInstructorProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var updated = await membership.UpdateInstructorProfileAsync(userId, request);
        return updated ? Ok(new { message = "Profile updated." }) : NotFound();
    }

    /// <summary>Upload an instructor profile photo (JPEG, PNG, or WebP up to 5 MB).</summary>
    [Authorize(Roles = "Instructor")]
    [HttpPost("instructor/profile/photo")]
    [ProducesResponseType(typeof(ProfilePhotoUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UploadInstructorPhoto([FromForm] IFormFile photo, [FromServices] IWebHostEnvironment env)
    {
        if (photo is null || photo.Length == 0)
            return BadRequest(new { message = "Please choose a photo to upload." });

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var url = await membership.UploadInstructorProfilePhotoAsync(userId, photo, env);
        return url is null
            ? BadRequest(new { message = "Could not upload photo. Use JPEG, PNG, or WebP under 5 MB." })
            : Ok(new ProfilePhotoUploadResponse(url));
    }

    /// <summary>List all gym members (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("members")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> ListMembers() =>
        Ok(await membership.ListMembersAsync());

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

    /// <summary>List all instructors (Admin).</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("instructors")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> ListInstructors() =>
        Ok(await membership.ListInstructorsAsync());

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
