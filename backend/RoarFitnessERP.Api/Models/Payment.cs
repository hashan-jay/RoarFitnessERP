namespace RoarFitnessERP.Api.Models;

/// <summary>Financial transaction for membership, shop, POS, or special-session revenue.</summary>
public class Payment
{
    public int PaymentId { get; set; }
    public string PaymentReference { get; set; } = string.Empty;
    public int? MemberId { get; set; }
    public Member? Member { get; set; }
    public int PaymentMethodId { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = null!;
    public int PaymentStatusId { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = null!;
    public decimal AmountLKR { get; set; }
    public string Currency { get; set; } = "LKR";
    public string? GatewayTransactionId { get; set; }
    public string PaymentPurpose { get; set; } = string.Empty;
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
