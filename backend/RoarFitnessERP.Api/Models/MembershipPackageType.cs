namespace RoarFitnessERP.Api.Models;

/// <summary>Billing cadence category (e.g. Monthly, Quarterly, Annual) for membership packages.</summary>
public class MembershipPackageType
{
    public int PackageTypeId { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<MembershipPackage> Packages { get; set; } = [];
}
