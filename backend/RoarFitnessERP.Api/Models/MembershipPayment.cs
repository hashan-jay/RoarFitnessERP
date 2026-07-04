namespace RoarFitnessERP.Api.Models;

/// <summary>Links a completed payment to the membership and package it activated.</summary>
public class MembershipPayment
{
    public int MembershipPaymentId { get; set; }
    public int PaymentId { get; set; }
    public Payment Payment { get; set; } = null!;
    public int MembershipId { get; set; }
    public Membership Membership { get; set; } = null!;
    public int PackageId { get; set; }
    public MembershipPackage Package { get; set; } = null!;
}
