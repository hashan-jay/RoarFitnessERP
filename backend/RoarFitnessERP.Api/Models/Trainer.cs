namespace RoarFitnessERP.Api.Models;

/// <summary>Public-facing trainer profile displayed on the Roar Fitness website.</summary>
public class Trainer
{
    public int TrainerId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public string? Specializations { get; set; }
    public string? PhotoUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
