namespace RoarFitnessERP.Api.Services;

/// <summary>Shared helpers for building member and instructor profile DTOs.</summary>
public static class ProfileHelper
{
    private static readonly TimeSpan AppOffset = TimeSpan.FromHours(5.5);

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

    private static DateTime GetAppToday()
    {
        try
        {
            var timeZoneId = OperatingSystem.IsWindows() ? "Sri Lanka Standard Time" : "Asia/Colombo";
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZone).Date;
        }
        catch
        {
            return DateTime.UtcNow.Add(AppOffset).Date;
        }
    }
}
