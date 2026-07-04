namespace RoarFitnessERP.Api.Models;

/// <summary>Lifecycle state of a payment (Pending, Completed, Failed, Refunded).</summary>
public class PaymentStatus
{
    public int PaymentStatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
}
