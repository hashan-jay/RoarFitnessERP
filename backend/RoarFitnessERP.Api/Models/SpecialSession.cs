namespace RoarFitnessERP.Api.Models;

/// <summary>Instructor-proposed paid class or workshop pending admin approval.</summary>
public class SpecialSession
{
    public int SessionId { get; set; }
    public int InstructorId { get; set; }
    public Instructor Instructor { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public decimal FeePerPersonLKR { get; set; }
    public int MaxParticipants { get; set; }
    public string Status { get; set; } = "Pending";
    public string? RejectionReason { get; set; }
    public int? ReviewedByUserId { get; set; }
    public User? ReviewedByUser { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<SpecialSessionEnrollment> Enrollments { get; set; } = [];
}
