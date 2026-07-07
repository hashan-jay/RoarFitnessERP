using Microsoft.EntityFrameworkCore;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Services;

public class GeneralClassService(AppDbContext db) : IGeneralClassService
{
    public async Task<IReadOnlyList<PublicGeneralClassDto>> GetPublicAsync()
    {
        var rows = await LoadJoinedRowsAsync(activeOnly: true);
        return rows
            .OrderBy(row => row.generalClass.Weekday)
            .ThenBy(row => row.generalClass.TimeRange)
            .Select(MapPublic)
            .ToList();
    }

    public async Task<IReadOnlyList<PublicGeneralClassDto>> GetForInstructorAsync(int userId)
    {
        var instructorId = await db.Instructors
            .Where(i => i.UserId == userId && !i.IsTerminated)
            .Select(i => (int?)i.InstructorId)
            .FirstOrDefaultAsync();

        if (instructorId is null)
            return [];

        var rows = await LoadJoinedRowsAsync(activeOnly: true, instructorId: instructorId.Value);
        return rows
            .OrderBy(row => row.generalClass.Weekday)
            .ThenBy(row => row.generalClass.TimeRange)
            .Select(MapPublic)
            .ToList();
    }

    public async Task<IReadOnlyList<AdminGeneralClassDto>> GetAdminListAsync()
    {
        var rows = await LoadJoinedRowsAsync(activeOnly: false);
        return rows
            .OrderBy(row => row.generalClass.Weekday)
            .ThenBy(row => row.generalClass.TimeRange)
            .Select(MapAdmin)
            .ToList();
    }

    public async Task<AdminGeneralClassDto?> CreateAsync(CreateGeneralClassRequest request)
    {
        if (!await InstructorExistsAsync(request.InstructorId))
            throw new InvalidOperationException("Selected instructor was not found.");

        ValidateWeekday(request.Weekday);

        var entity = new GeneralClass
        {
            Title = request.Title.Trim(),
            Category = request.Category.Trim(),
            Description = request.Description.Trim(),
            InstructorId = request.InstructorId,
            Weekday = request.Weekday,
            TimeRange = request.TimeRange.Trim(),
            Duration = request.Duration.Trim(),
            Studio = request.Studio.Trim(),
            IsActive = true,
            CreatedAt = AppTime.Now(),
            UpdatedAt = AppTime.Now(),
        };

        db.GeneralClasses.Add(entity);
        await db.SaveChangesAsync();
        return await GetAdminByIdAsync(entity.GeneralClassId);
    }

    public async Task<AdminGeneralClassDto?> UpdateAsync(int generalClassId, UpdateGeneralClassRequest request)
    {
        var entity = await db.GeneralClasses.FirstOrDefaultAsync(row => row.GeneralClassId == generalClassId);
        if (entity is null)
            return null;

        if (!await InstructorExistsAsync(request.InstructorId))
            throw new InvalidOperationException("Selected instructor was not found.");

        ValidateWeekday(request.Weekday);

        entity.Title = request.Title.Trim();
        entity.Category = request.Category.Trim();
        entity.Description = request.Description.Trim();
        entity.InstructorId = request.InstructorId;
        entity.Weekday = request.Weekday;
        entity.TimeRange = request.TimeRange.Trim();
        entity.Duration = request.Duration.Trim();
        entity.Studio = request.Studio.Trim();
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = AppTime.Now();

        await db.SaveChangesAsync();
        return await GetAdminByIdAsync(generalClassId);
    }

    public async Task<bool> DeleteAsync(int generalClassId)
    {
        var entity = await db.GeneralClasses.FirstOrDefaultAsync(row => row.GeneralClassId == generalClassId);
        if (entity is null)
            return false;

        entity.IsActive = false;
        entity.UpdatedAt = AppTime.Now();
        await db.SaveChangesAsync();
        return true;
    }

    private async Task<AdminGeneralClassDto?> GetAdminByIdAsync(int generalClassId)
    {
        var rows = await LoadJoinedRowsAsync(activeOnly: false, generalClassId);
        return rows.Select(MapAdmin).FirstOrDefault();
    }

    private async Task<List<GeneralClassRow>> LoadJoinedRowsAsync(
        bool activeOnly,
        int? generalClassId = null,
        int? instructorId = null)
    {
        var query =
            from generalClass in db.GeneralClasses.AsNoTracking()
            join instructor in db.Instructors.AsNoTracking()
                on generalClass.InstructorId equals instructor.InstructorId
            join user in db.Users.AsNoTracking()
                on instructor.UserId equals user.UserId
            select new { generalClass, instructor, user };

        if (generalClassId is int id)
            query = query.Where(row => row.generalClass.GeneralClassId == id);

        if (instructorId is int instructorFilter)
            query = query.Where(row => row.generalClass.InstructorId == instructorFilter);

        if (activeOnly)
            query = query.Where(row => row.generalClass.IsActive);

        var rows = await query.ToListAsync();

        return rows.Select(row => new GeneralClassRow
        {
            generalClass = row.generalClass,
            fullName = $"{row.user.FirstName} {row.user.LastName}".Trim(),
            role = string.IsNullOrWhiteSpace(row.instructor.Specialization)
                ? "Fitness Coach"
                : row.instructor.Specialization.Trim(),
            photoUrl = row.instructor.ProfilePhotoUrl,
        }).ToList();
    }

    private static void ValidateWeekday(int weekday)
    {
        if (weekday is < 0 or > 6)
            throw new InvalidOperationException("Weekday must be between 0 (Sunday) and 6 (Saturday).");
    }

    private Task<bool> InstructorExistsAsync(int instructorId) =>
        db.Instructors.AnyAsync(i => i.InstructorId == instructorId && !i.IsTerminated);

    private static PublicGeneralClassDto MapPublic(GeneralClassRow row) =>
        new(
            row.generalClass.GeneralClassId,
            row.generalClass.Title,
            row.generalClass.Category,
            row.generalClass.Description,
            row.generalClass.InstructorId,
            row.fullName,
            row.role,
            row.photoUrl,
            row.generalClass.Weekday,
            row.generalClass.TimeRange,
            row.generalClass.Duration,
            row.generalClass.Studio);

    private static AdminGeneralClassDto MapAdmin(GeneralClassRow row) =>
        new(
            row.generalClass.GeneralClassId,
            row.generalClass.Title,
            row.generalClass.Category,
            row.generalClass.Description,
            row.generalClass.InstructorId,
            row.fullName,
            row.role,
            row.photoUrl,
            row.generalClass.Weekday,
            row.generalClass.TimeRange,
            row.generalClass.Duration,
            row.generalClass.Studio,
            row.generalClass.IsActive,
            row.generalClass.UpdatedAt);

    private sealed class GeneralClassRow
    {
        public GeneralClass generalClass { get; init; } = null!;
        public string fullName { get; init; } = string.Empty;
        public string role { get; init; } = string.Empty;
        public string? photoUrl { get; init; }
    }
}
