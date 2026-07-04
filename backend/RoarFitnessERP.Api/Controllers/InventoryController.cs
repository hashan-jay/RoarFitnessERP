using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Inventory API — product CRUD and stock management (Admin).</summary>
[ApiController]
[Route("api/inventory")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class InventoryController(IInventoryService inventory) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>List all products with current stock levels.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetAll() =>
        Ok(await inventory.GetAllAsync());

    /// <summary>List product categories for the add/edit form.</summary>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(IReadOnlyList<ProductCategoryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetCategories() =>
        Ok(await inventory.GetCategoriesAsync());

    /// <summary>Create a new product with initial stock.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Create([FromBody] CreateProductRequest request)
    {
        var product = await inventory.CreateProductAsync(UserId, request);
        return product is null
            ? BadRequest(new { message = "Could not create product. Check SKU uniqueness and category." })
            : Ok(product);
    }

    /// <summary>Update product details and availability.</summary>
    [HttpPut("{productId:int}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Update(int productId, [FromBody] UpdateProductRequest request)
    {
        var product = await inventory.UpdateProductAsync(productId, request);
        return product is null
            ? NotFound(new { message = "Product not found or SKU already in use." })
            : Ok(product);
    }

    /// <summary>Soft-delete a product (removes from shop listings).</summary>
    [HttpDelete("{productId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int productId)
    {
        var ok = await inventory.DeleteProductAsync(productId);
        return ok ? Ok(new { message = "Product removed." }) : NotFound(new { message = "Product not found." });
    }

    /// <summary>Set stock quantity to zero with an audit reason.</summary>
    [HttpPost("{productId:int}/clear")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> ClearStock(int productId, [FromBody] ClearStockRequest request)
    {
        var ok = await inventory.ClearStockAsync(UserId, productId, request);
        return ok ? Ok(new { message = "Stock cleared." }) : NotFound(new { message = "Product not found." });
    }

    /// <summary>Adjust stock quantity (add or remove) with an audit reason.</summary>
    [HttpPost("adjust")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Adjust([FromBody] InventoryAdjustRequest request)
    {
        var ok = await inventory.AdjustAsync(UserId, request);
        return ok ? Ok(new { message = "Inventory updated." }) : BadRequest(new { message = "Product not found." });
    }
}
