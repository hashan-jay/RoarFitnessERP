using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Admin CRUD for recurring weekly general classes on the public schedule.</summary>
[ApiController]
[Route("api/admin/general-classes")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class GeneralClassAdminController(IGeneralClassService generalClasses) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AdminGeneralClassDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetList() =>
        Ok(await generalClasses.GetAdminListAsync());

    [HttpPost]
    [ProducesResponseType(typeof(AdminGeneralClassDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Create([FromBody] CreateGeneralClassRequest request)
    {
        try
        {
            var created = await generalClasses.CreateAsync(request);
            return created is null
                ? BadRequest(new { message = "Unable to create general class." })
                : Ok(created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{generalClassId:int}")]
    [ProducesResponseType(typeof(AdminGeneralClassDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Update(int generalClassId, [FromBody] UpdateGeneralClassRequest request)
    {
        try
        {
            var updated = await generalClasses.UpdateAsync(generalClassId, request);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{generalClassId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int generalClassId)
    {
        var deleted = await generalClasses.DeleteAsync(generalClassId);
        return deleted
            ? Ok(new { message = "General class removed from the public schedule." })
            : NotFound();
    }
}
