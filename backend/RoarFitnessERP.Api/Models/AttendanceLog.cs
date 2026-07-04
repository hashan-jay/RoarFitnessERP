namespace RoarFitnessERP.Api.Models;

/// <summary>Fingerprint entry attempt log for members and instructors at gym scanners.</summary>
public class AttendanceLog
{
    public long AttendanceLogId { get; set; }
    public int? MemberId { get; set; }
    public Member? Member { get; set; }
    public int? InstructorId { get; set; }
    public Instructor? Instructor { get; set; }
    public string FingerprintTemplateId { get; set; } = string.Empty;
    public string? ScannerDeviceId { get; set; }
    public bool AccessGranted { get; set; }
    public string? ValidationMessage { get; set; }
    public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
}
