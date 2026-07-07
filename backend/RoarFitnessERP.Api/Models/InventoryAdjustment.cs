using System.ComponentModel.DataAnnotations;

namespace RoarFitnessERP.Api.Models;

/// <summary>Audited stock change with reason and the admin user who performed it.</summary>
public class InventoryAdjustment
{
    [Key]
    public int AdjustmentId { get; set; }
    public int InventoryItemId { get; set; }
    public InventoryItem InventoryItem { get; set; } = null!;
    public int AdjustedByUserId { get; set; }
    public User AdjustedByUser { get; set; } = null!;
    public int QuantityChange { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime AdjustedAt { get; set; } = AppTime.Now();
}
