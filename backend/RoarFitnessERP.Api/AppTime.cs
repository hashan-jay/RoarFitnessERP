namespace RoarFitnessERP.Api;

/// <summary>Single source of truth for Asia/Colombo (GMT+5:30) wall-clock timestamps.</summary>
public static class AppTime
{
    public static readonly TimeSpan Offset = TimeSpan.FromHours(5.5);

    private const string WindowsTimeZoneId = "Sri Lanka Standard Time";
    private const string IanaTimeZoneId = "Asia/Colombo";

    public static DateTime Now()
    {
        var colombo = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, GetTimeZone());
        return DateTime.SpecifyKind(colombo, DateTimeKind.Unspecified);
    }

    public static DateTime Today => Now().Date;

    /// <summary>Normalize stored DB/API timestamps to Colombo wall-clock (handles legacy UTC rows).</summary>
    public static DateTime NormalizeStored(DateTime value)
    {
        if (value.Kind == DateTimeKind.Utc)
        {
            return DateTime.SpecifyKind(
                TimeZoneInfo.ConvertTimeFromUtc(value, GetTimeZone()),
                DateTimeKind.Unspecified);
        }

        return DateTime.SpecifyKind(value, DateTimeKind.Unspecified);
    }

    public static DateTime? NormalizeStored(DateTime? value) =>
        value.HasValue ? NormalizeStored(value.Value) : null;

    public static DateTimeOffset ToOffset(DateTime value) =>
        new(NormalizeStored(value), Offset);

    public static (DateTime Start, DateTime End) GetDayRange(DateTime colomboDate)
    {
        var start = colomboDate.Date;
        return (start, start.AddDays(1));
    }

    public static TimeZoneInfo GetTimeZone()
    {
        try
        {
            var timeZoneId = OperatingSystem.IsWindows() ? WindowsTimeZoneId : IanaTimeZoneId;
            return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        }
        catch
        {
            return TimeZoneInfo.CreateCustomTimeZone(
                IanaTimeZoneId,
                Offset,
                "Colombo",
                "Colombo");
        }
    }
}
