namespace RoarFitnessERP.Api.Models;

/// <summary>Inbound message submitted via the public website contact form.</summary>
public class ContactMessage
{
    public int ContactMessageId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}
