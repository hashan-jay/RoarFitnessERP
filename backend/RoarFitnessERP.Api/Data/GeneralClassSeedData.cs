namespace RoarFitnessERP.Api.Data;

/// <summary>Initial general-class rows when the table is first created (empty DB only).</summary>
internal static class GeneralClassSeedData
{
    internal sealed record Slot(
        string Title,
        string Category,
        string Description,
        int Weekday,
        string TimeRange,
        string Duration,
        string Studio,
        string ClassKey);

    internal static readonly IReadOnlyList<Slot> DefaultSlots =
    [
        new("Strength Training", "Strength", "Build lean muscle and functional power with structured programs using free weights, machines, and progressive overload techniques.", 1, "06:00 - 07:00", "60 min", "Strength Floor", "strength"),
        new("Yoga", "Yoga", "Restore balance and flexibility through mindful movement, controlled breathing, and flows that support recovery and mental clarity.", 1, "07:30 - 08:30", "60 min", "Zen Room", "yoga"),
        new("Cardio Classes", "Cardio", "High-energy sessions designed to boost endurance, burn calories, and improve cardiovascular health.", 1, "17:00 - 17:45", "45 min", "Cardio Hall", "cardio"),
        new("CrossFit", "CrossFit", "Varied, high-intensity functional training that combines strength, conditioning, and team-driven motivation.", 1, "18:30 - 19:30", "60 min", "Box Arena", "crossfit"),
        new("CrossFit", "CrossFit", "Varied, high-intensity functional training that combines strength, conditioning, and team-driven motivation.", 2, "06:15 - 07:15", "60 min", "Box Arena", "crossfit"),
        new("Cardio Classes", "Cardio", "High-energy sessions designed to boost endurance, burn calories, and improve cardiovascular health.", 2, "08:00 - 08:45", "45 min", "Cardio Hall", "cardio"),
        new("Pilates", "Pilates", "Strengthen your core, improve posture, and enhance body control with precise, low-impact movements.", 2, "17:30 - 18:15", "45 min", "Studio B", "pilates"),
        new("Strength Training", "Strength", "Build lean muscle and functional power with structured programs using free weights, machines, and progressive overload techniques.", 2, "18:45 - 19:45", "60 min", "Studio A", "strength"),
        new("Strength Training", "Strength", "Build lean muscle and functional power with structured programs using free weights, machines, and progressive overload techniques.", 3, "06:00 - 07:00", "60 min", "Strength Floor", "strength"),
        new("Yoga", "Yoga", "Restore balance and flexibility through mindful movement, controlled breathing, and flows that support recovery and mental clarity.", 3, "07:15 - 08:00", "45 min", "Zen Room", "yoga"),
        new("Cardio Classes", "Cardio", "High-energy sessions designed to boost endurance, burn calories, and improve cardiovascular health.", 3, "17:15 - 18:00", "45 min", "Performance Zone", "cardio"),
        new("Pilates", "Pilates", "Strengthen your core, improve posture, and enhance body control with precise, low-impact movements.", 3, "19:00 - 19:50", "50 min", "Studio B", "pilates"),
        new("CrossFit", "CrossFit", "Varied, high-intensity functional training that combines strength, conditioning, and team-driven motivation.", 4, "06:15 - 07:00", "45 min", "Box Arena", "crossfit"),
        new("Cardio Classes", "Cardio", "High-energy sessions designed to boost endurance, burn calories, and improve cardiovascular health.", 4, "08:00 - 08:50", "50 min", "Cardio Hall", "cardio"),
        new("Yoga", "Yoga", "Restore balance and flexibility through mindful movement, controlled breathing, and flows that support recovery and mental clarity.", 4, "17:00 - 17:45", "45 min", "Zen Room", "yoga"),
        new("Strength Training", "Strength", "Build lean muscle and functional power with structured programs using free weights, machines, and progressive overload techniques.", 4, "18:30 - 19:30", "60 min", "Studio A", "strength"),
        new("Strength Training", "Strength", "Build lean muscle and functional power with structured programs using free weights, machines, and progressive overload techniques.", 5, "06:00 - 06:50", "50 min", "Strength Floor", "strength"),
        new("Pilates", "Pilates", "Strengthen your core, improve posture, and enhance body control with precise, low-impact movements.", 5, "07:30 - 08:20", "50 min", "Studio B", "pilates"),
        new("Cardio Classes", "Cardio", "High-energy sessions designed to boost endurance, burn calories, and improve cardiovascular health.", 5, "17:15 - 18:00", "45 min", "Cardio Hall", "cardio"),
        new("CrossFit", "CrossFit", "Varied, high-intensity functional training that combines strength, conditioning, and team-driven motivation.", 5, "18:00 - 19:00", "60 min", "Box Arena", "crossfit"),
        new("CrossFit", "CrossFit", "Varied, high-intensity functional training that combines strength, conditioning, and team-driven motivation.", 6, "07:00 - 08:00", "60 min", "Box Arena", "crossfit"),
        new("Cardio Classes", "Cardio", "High-energy sessions designed to boost endurance, burn calories, and improve cardiovascular health.", 6, "08:15 - 09:00", "45 min", "Cardio Hall", "cardio"),
        new("Yoga", "Yoga", "Restore balance and flexibility through mindful movement, controlled breathing, and flows that support recovery and mental clarity.", 6, "09:30 - 10:15", "45 min", "Zen Room", "yoga"),
        new("Strength Training", "Strength", "Build lean muscle and functional power with structured programs using free weights, machines, and progressive overload techniques.", 6, "10:30 - 11:30", "60 min", "Studio A", "strength"),
        new("Zumba", "Zumba", "Dance-fitness sessions blending Latin rhythms and cardio intervals — high energy, easy to follow, and built for all fitness levels.", 2, "12:00 - 13:00", "60 min", "Studio A", "zumba"),
        new("Zumba", "Zumba", "Dance-fitness sessions blending Latin rhythms and cardio intervals — high energy, easy to follow, and built for all fitness levels.", 4, "16:00 - 17:00", "60 min", "Cardio Hall", "zumba"),
        new("Zumba", "Zumba", "Dance-fitness sessions blending Latin rhythms and cardio intervals — high energy, easy to follow, and built for all fitness levels.", 6, "11:00 - 12:00", "60 min", "Studio B", "zumba"),
    ];

    internal static readonly IReadOnlyDictionary<string, string[]> SkillKeywords =
        new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
        {
            ["cardio"] = ["cardio", "hiit", "conditioning", "weight loss", "endurance"],
            ["strength"] = ["strength", "powerlifting", "muscle", "lifting"],
            ["yoga"] = ["yoga", "mobility", "flexibility", "mindful"],
            ["pilates"] = ["pilates", "core", "posture"],
            ["crossfit"] = ["crossfit", "functional", "conditioning", "hiit"],
            ["zumba"] = ["zumba", "dance", "cardio", "hiit", "group"],
            ["barre"] = ["barre", "pilates", "core", "flexibility"],
        };
}
