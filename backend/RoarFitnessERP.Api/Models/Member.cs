namespace RoarFitnessERP.Api.Models;

/// <summary>Gym member profile linked to a user account, membership, and fingerprint access.</summary>
public class Member
{
    public int MemberId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string IdentificationNumber { get; set; } = string.Empty;
    public string? NicNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? AddressLine1 { get; set; }
    public string? City { get; set; } = "Colombo";
    public string? Country { get; set; } = "Sri Lanka";
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? FingerprintTemplateId { get; set; }
    public bool IsFingerprintActivated { get; set; }
    public DateTime? FingerprintActivatedAt { get; set; }
    public DateTime JoinedAt { get; set; } = AppTime.Now();
    public bool IsTerminated { get; set; }
    public DateTime? TerminatedAt { get; set; }
    public ICollection<Membership> Memberships { get; set; } = [];
}
