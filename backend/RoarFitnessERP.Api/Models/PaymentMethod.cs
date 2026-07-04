namespace RoarFitnessERP.Api.Models;

/// <summary>Lookup for how a payment was collected (PayHere, Cash, Card).</summary>
public class PaymentMethod
{
    public int PaymentMethodId { get; set; }
    public string MethodName { get; set; } = string.Empty;
}
