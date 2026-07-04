namespace RoarFitnessERP.Api.Models;

/// <summary>In-gym POS sale order linked to payment and bill reference.</summary>
public class Order
{
    public int OrderId { get; set; }
    public string OrderReference { get; set; } = string.Empty;
    public int? MemberId { get; set; }
    public Member? Member { get; set; }
    public int OrderStatusId { get; set; }
    public OrderStatus OrderStatus { get; set; } = null!;
    public string OrderChannel { get; set; } = string.Empty;
    public decimal SubtotalLKR { get; set; }
    public decimal TotalLKR { get; set; }
    public int? PaymentId { get; set; }
    public Payment? Payment { get; set; }
    public int? ProcessedByUserId { get; set; }
    public User? ProcessedByUser { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? BillReference { get; set; }
    public ICollection<OrderItem> Items { get; set; } = [];
}
