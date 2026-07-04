namespace RoarFitnessERP.Api.Models;

/// <summary>Order lifecycle state (PendingPayment, Paid, ReadyForCollection, Collected, Cancelled).</summary>
public class OrderStatus
{
    public int OrderStatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
}
