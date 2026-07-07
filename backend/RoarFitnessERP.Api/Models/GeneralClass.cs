using System.ComponentModel.DataAnnotations.Schema;

namespace RoarFitnessERP.Api.Models;

/// <summary>Recurring weekly class shown on the public schedule — admin-managed.</summary>
[Table("generalClasses")]
public class GeneralClass
{
    public int GeneralClassId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int InstructorId { get; set; }
    public Instructor Instructor { get; set; } = null!;
    /// <summary>Day of week (0 = Sunday … 6 = Saturday). Repeats every week.</summary>
    public int Weekday { get; set; }
    public string TimeRange { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string Studio { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = AppTime.Now();
    public DateTime UpdatedAt { get; set; } = AppTime.Now();
}
