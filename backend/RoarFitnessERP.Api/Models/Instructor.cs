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
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? Specialization { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public DateTime HireDate { get; set; } = DateTime.UtcNow.Date;
    public string? FingerprintTemplateId { get; set; }
    public bool IsFingerprintActivated { get; set; }
}
