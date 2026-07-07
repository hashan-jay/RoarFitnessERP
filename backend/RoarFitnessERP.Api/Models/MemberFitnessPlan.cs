namespace RoarFitnessERP.Api.Models;

/// <summary>Approved workout or meal plan sent from an instructor to a member.</summary>
public class MemberFitnessPlan
{
    public int PlanId { get; set; }
    public int? RequestId { get; set; }
    public MemberPlanRequest? Request { get; set; }
    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;
    public int InstructorId { get; set; }
    public Instructor Instructor { get; set; } = null!;
    public string PlanCategory { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = AppTime.Now();
    public DateTime UpdatedAt { get; set; } = AppTime.Now();
}
