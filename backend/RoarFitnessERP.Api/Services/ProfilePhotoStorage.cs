using Microsoft.AspNetCore.Http;

namespace RoarFitnessERP.Api.Services;

/// <summary>Saves profile photo uploads to wwwroot/uploads/profiles.</summary>
public static class ProfilePhotoStorage
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/octet-stream"
    };

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    public static async Task<string?> SaveAsync(IFormFile file, string fileStem, IWebHostEnvironment env)
    {
        if (file.Length <= 0 || file.Length > 5 * 1024 * 1024)
            return null;

        var extension = NormalizeExtension(file.FileName, file.ContentType);
        if (extension is null)
            return null;

        if (!IsAllowedUpload(file.ContentType, extension))
            return null;

        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var uploadsDir = Path.Combine(webRoot, "uploads", "profiles");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{fileStem}{extension}";
        var fullPath = Path.Combine(uploadsDir, fileName);

        await using var stream = File.Create(fullPath);
        await file.CopyToAsync(stream);

        return $"/uploads/profiles/{fileName}";
    }

    private static bool IsAllowedUpload(string? contentType, string extension)
    {
        if (!string.IsNullOrWhiteSpace(contentType) && AllowedContentTypes.Contains(contentType))
            return true;

        return AllowedExtensions.Contains(extension);
    }

    private static string? NormalizeExtension(string fileName, string? contentType)
    {
        var extension = Path.GetExtension(fileName);
        if (!string.IsNullOrWhiteSpace(extension))
        {
            extension = extension.ToLowerInvariant();
            if (extension == ".jpeg") extension = ".jpg";
            if (AllowedExtensions.Contains(extension))
                return extension;
        }

        return contentType switch
        {
            "image/png" => ".png",
            "image/webp" => ".webp",
            "image/jpeg" or "image/jpg" => ".jpg",
            _ => null
        };
    }
}
