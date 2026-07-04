namespace RoarFitnessERP.Api.Models;

/// <summary>Product grouping (e.g. Supplements, Merchandise) for inventory and POS.</summary>
public class ProductCategory
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<Product> Products { get; set; } = [];
}
