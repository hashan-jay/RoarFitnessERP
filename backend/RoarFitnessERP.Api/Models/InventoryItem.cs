namespace RoarFitnessERP.Api.Models;

/// <summary>Stock-on-hand record for a product, including reorder thresholds.</summary>
public class InventoryItem
{
    public int InventoryItemId { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int QuantityOnHand { get; set; }
    public int ReorderLevel { get; set; } = 5;
    public DateTime? LastRestockedAt { get; set; }
    public DateTime UpdatedAt { get; set; } = AppTime.Now();
}
