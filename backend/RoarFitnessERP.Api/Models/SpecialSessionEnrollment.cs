namespace RoarFitnessERP.Api.Models;

/// <summary>Member enrollment in a special session, linked to the session fee payment.</summary>
public class SpecialSessionEnrollment
{
    public int EnrollmentId { get; set; }
    public int SessionId { get; set; }
    public SpecialSession Session { get; set; } = null!;
    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;
    public int PaymentId { get; set; }
    public Payment Payment { get; set; } = null!;
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
}
