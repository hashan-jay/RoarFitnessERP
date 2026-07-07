using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace RoarFitnessERP.Api.Services;

/// <summary>Persists instructor profile photos under wwwroot/uploads/instructors.</summary>
public class InstructorPhotoStorage(IWebHostEnvironment environment)
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp",
    };

    public const int MaxFileSizeBytes = 5 * 1024 * 1024;
    private static readonly Size TargetSize = new(750, 900);

    public async Task<string?> SaveAsync(int instructorId, IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file.Length <= 0 || file.Length > MaxFileSizeBytes)
            return null;

        var extension = ResolveExtension(file);
        if (extension is null)
            return null;

        var uploadsRoot = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "uploads", "instructors");
        Directory.CreateDirectory(uploadsRoot);

        var fileName = $"instructor-{instructorId}-{AppTime.Now():yyyyMMddHHmmssfff}{extension}";
        var physicalPath = Path.Combine(uploadsRoot, fileName);

        await using var input = file.OpenReadStream();
        using var image = await Image.LoadAsync(input, cancellationToken);
        image.Mutate(ctx => ctx.Resize(new ResizeOptions
        {
            Mode = ResizeMode.Crop,
            Size = TargetSize,
            Position = AnchorPositionMode.Top,
        }));

        await using var output = File.Create(physicalPath);
        switch (extension)
        {
            case ".png":
                await image.SaveAsync(output, new PngEncoder(), cancellationToken);
                break;
            case ".webp":
                await image.SaveAsync(output, new WebpEncoder { Quality = 82 }, cancellationToken);
                break;
            default:
                await image.SaveAsync(output, new JpegEncoder { Quality = 82 }, cancellationToken);
                break;
        }

        return $"/uploads/instructors/{fileName}";
    }

    private static string? ResolveExtension(IFormFile file)
    {
        var extension = Path.GetExtension(file.FileName);
        if (!string.IsNullOrWhiteSpace(extension) && AllowedExtensions.Contains(extension))
            return extension.ToLowerInvariant();

        return file.ContentType?.ToLowerInvariant() switch
        {
            "image/jpeg" or "image/jpg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => null,
        };
    }

    public void DeleteIfExists(string? relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl) || !relativeUrl.StartsWith("/uploads/instructors/", StringComparison.OrdinalIgnoreCase))
            return;

        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var physicalPath = Path.Combine(webRoot, relativeUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(physicalPath))
            File.Delete(physicalPath);
    }
}
