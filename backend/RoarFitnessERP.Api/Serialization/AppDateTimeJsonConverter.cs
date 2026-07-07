using System.Text.Json;
using System.Text.Json.Serialization;

namespace RoarFitnessERP.Api.Serialization;

public sealed class AppDateTimeJsonConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var text = reader.GetString();
        if (string.IsNullOrWhiteSpace(text))
            return default;

        if (DateTimeOffset.TryParse(text, out var parsedOffset))
        {
            var colombo = parsedOffset.ToOffset(AppTime.Offset);
            return DateTime.SpecifyKind(colombo.DateTime, DateTimeKind.Unspecified);
        }

        if (DateTime.TryParse(text, out var parsed))
            return AppTime.NormalizeStored(parsed);

        throw new JsonException($"Invalid date value: {text}");
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(AppTime.ToOffset(value).ToString("yyyy-MM-dd'T'HH:mm:ss.fffzzz"));
    }
}

public sealed class AppNullableDateTimeJsonConverter : JsonConverter<DateTime?>
{
    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
            return null;

        return new AppDateTimeJsonConverter().Read(ref reader, typeof(DateTime), options);
    }

    public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
    {
        if (!value.HasValue)
        {
            writer.WriteNullValue();
            return;
        }

        new AppDateTimeJsonConverter().Write(writer, value.Value, options);
    }
}
