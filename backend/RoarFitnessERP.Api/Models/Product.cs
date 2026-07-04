namespace RoarFitnessERP.Api.Models;

/// <summary>Supplement or merchandise item sold at the in-gym POS.</summary>
public class Product
{
    public int ProductId { get; set; }
    public int CategoryId { get; set; }
    public ProductCategory Category { get; set; } = null!;
    public string SKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal UnitPriceLKR { get; set; }
    public bool IsActive { get; set; } = true;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public InventoryItem? Inventory { get; set; }
}
