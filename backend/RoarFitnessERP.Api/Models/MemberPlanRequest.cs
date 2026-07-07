namespace RoarFitnessERP.Api.Models;

/// <summary>Member-initiated request for a workout or meal plan from an instructor.</summary>
public class MemberPlanRequest
{
    public int RequestId { get; set; }
    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;
    public int InstructorId { get; set; }
    public Instructor Instructor { get; set; } = null!;
    public string PlanCategory { get; set; } = string.Empty;
    public string? MemberNote { get; set; }
    public string Status { get; set; } = "Pending";
    public int? PlanId { get; set; }
    public MemberFitnessPlan? Plan { get; set; }
    public DateTime CreatedAt { get; set; } = AppTime.Now();
    public DateTime? ApprovedAt { get; set; }
}
