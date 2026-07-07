namespace RoarFitnessERP.Api.Models;

/// <summary>Active or historical membership period tying a member to a purchased package.</summary>
public class Membership
{
    public int MembershipId { get; set; }
    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;
    public int PackageId { get; set; }
    public MembershipPackage Package { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = AppTime.Now();
}
