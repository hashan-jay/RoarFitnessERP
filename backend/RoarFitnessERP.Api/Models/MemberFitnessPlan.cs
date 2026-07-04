namespace RoarFitnessERP.Api.Models;

/// <summary>Personalized workout and meal plan authored by an instructor for a member.</summary>
public class MemberFitnessPlan
{
    public int PlanId { get; set; }
    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;
    public int InstructorId { get; set; }
    public Instructor Instructor { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string FitnessGoal { get; set; } = string.Empty;
    public string WorkoutPlan { get; set; } = string.Empty;
    public string MealPlan { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
