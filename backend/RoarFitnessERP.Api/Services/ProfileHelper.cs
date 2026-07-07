namespace RoarFitnessERP.Api.Services;

using RoarFitnessERP.Api.Models;

/// <summary>Shared helpers for building member and instructor profile DTOs.</summary>
public static class ProfileHelper
{
    /// <summary>Today's calendar date in Asia/Colombo (GMT+5:30).</summary>
    public static DateTime GetAppToday() => AppTime.Today;

    /// <summary>Returns the member's current valid membership, if any.</summary>
    public static Membership? ResolveActiveMembership(IEnumerable<Membership> memberships)
    {
        var today = GetAppToday();
        return memberships
            .Where(ms => ms.IsActive && ms.StartDate.Date <= today && ms.EndDate.Date >= today)
            .OrderByDescending(ms => ms.EndDate)
            .FirstOrDefault();
    }

    /// <summary>Returns the next queued membership that has not started yet.</summary>
    public static Membership? ResolveQueuedMembership(IEnumerable<Membership> memberships)
    {
        var today = GetAppToday();
        return memberships
            .Where(ms => ms.IsActive && ms.StartDate.Date > today)
            .OrderBy(ms => ms.StartDate)
            .FirstOrDefault();
    }

    /// <summary>Calculates when a newly purchased membership should begin.</summary>
    public static DateTime ResolveNextMembershipStartDate(IEnumerable<Membership> memberships)
    {
        var today = GetAppToday();
        var currentActive = ResolveActiveMembership(memberships);
        var futureMemberships = memberships
            .Where(ms => ms.IsActive && ms.StartDate.Date > today)
            .ToList();

        if (futureMemberships.Count > 0)
            return futureMemberships.Max(ms => ms.EndDate.Date).AddDays(1);

        if (currentActive is not null)
            return currentActive.EndDate.Date.AddDays(1);

        return today;
    }

    /// <summary>Calculates age in whole years from a date of birth using GMT+5:30, or null when unknown.</summary>
    public static int? CalculateAge(DateTime? dateOfBirth)
    {
        if (dateOfBirth is null) return null;

        var today = GetAppToday();
        var dob = dateOfBirth.Value.Date;
        var age = today.Year - dob.Year;
        if (dob > today.AddYears(-age))
            age--;

        return age >= 0 ? age : null;
    }

    /// <summary>Parses a yyyy-MM-dd portal date or returns null.</summary>
    public static DateTime? ParseAppDate(string? dateText)
    {
        if (string.IsNullOrWhiteSpace(dateText))
            return null;

        return DateTime.TryParse(dateText, out var parsed) ? parsed.Date : null;
    }

    /// <summary>Colombo calendar day range [start, end) for filtering stored wall-clock timestamps.</summary>
    public static (DateTime Start, DateTime End) GetAppDayRange(DateTime colomboDate) =>
        AppTime.GetDayRange(colomboDate);

    /// <summary>Legacy alias kept for callers migrating from UTC day windows.</summary>
    public static (DateTime StartUtc, DateTime EndUtc) GetAppDayUtcRange(DateTime colomboDate)
    {
        var (start, end) = GetAppDayRange(colomboDate);
        return (start, end);
    }

    /// <summary>Normalizes a stored timestamp to Colombo wall-clock for API responses.</summary>
    public static DateTime ToUtcKind(DateTime value) => AppTime.NormalizeStored(value);
}
