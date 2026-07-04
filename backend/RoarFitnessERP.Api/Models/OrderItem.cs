namespace RoarFitnessERP.Api.Models;

/// <summary>Line item on an order capturing product, quantity, and price at time of sale.</summary>
public class OrderItem
{
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPriceLKR { get; set; }
}
