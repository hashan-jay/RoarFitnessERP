namespace RoarFitnessERP.Api.Models;

/// <summary>Staff instructor profile linked to a user account and fingerprint access.</summary>
public class Instructor
{
    public int InstructorId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string IdentificationNumber { get; set; } = string.Empty;
    public string? NicNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? AddressLine1 { get; set; }
    public string? City { get; set; } = "Colombo";
    public string? Country { get; set; } = "Sri Lanka";
    public string? Specialization { get; set; }
    public string? Bio { get; set; }
    public int YearsExperience { get; set; }
    public string? Qualification1 { get; set; }
    public string? Qualification2 { get; set; }
    public string? Speciality1 { get; set; }
    public string? Speciality2 { get; set; }
    public string? Speciality3 { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public DateTime HireDate { get; set; } = AppTime.Now().Date;
    public string? FingerprintTemplateId { get; set; }
    public bool IsFingerprintActivated { get; set; }
    public bool IsTerminated { get; set; }
    public DateTime? TerminatedAt { get; set; }
}
