namespace RoarFitnessERP.Api.Models;

/// <summary>Sellable membership plan with duration, price, and amenities for gym access.</summary>
public class MembershipPackage
{
    public int PackageId { get; set; }
    public int PackageTypeId { get; set; }
    public MembershipPackageType PackageType { get; set; } = null!;
    public string PackageName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Amenities { get; set; }
    public int DurationDays { get; set; }
    public decimal PriceLKR { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
