using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Admin read-only access to public website visitor contact inquiries.</summary>
[ApiController]
[Route("api/admin/visitor-inquiries")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class VisitorInquiryController(IPublicContentService content) : ControllerBase
{
    /// <summary>List all visitor inquiries submitted through the public Contact Us form.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<VisitorInquiryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetVisitorInquiries() =>
        Ok(await content.GetVisitorInquiriesAsync());
}
