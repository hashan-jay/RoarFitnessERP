using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using RoarFitnessERP.Api.Models;
using RoarFitnessERP.Api.Services;

namespace RoarFitnessERP.Api.Data;

/// <summary>Entity Framework Core context for the Roar Fitness ERP SQL Server database.</summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<MembershipPackageType> MembershipPackageTypes => Set<MembershipPackageType>();
    public DbSet<MembershipPackage> MembershipPackages => Set<MembershipPackage>();
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Instructor> Instructors => Set<Instructor>();
    public DbSet<Membership> Memberships => Set<Membership>();
    public DbSet<PaymentMethod> PaymentMethods => Set<PaymentMethod>();
    public DbSet<PaymentStatus> PaymentStatuses => Set<PaymentStatus>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<MembershipPayment> MembershipPayments => Set<MembershipPayment>();
    public DbSet<AttendanceLog> AttendanceLogs => Set<AttendanceLog>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<InventoryAdjustment> InventoryAdjustments => Set<InventoryAdjustment>();
    public DbSet<OrderStatus> OrderStatuses => Set<OrderStatus>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Trainer> Trainers => Set<Trainer>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<SpecialSession> SpecialSessions => Set<SpecialSession>();
    public DbSet<SpecialSessionEnrollment> SpecialSessionEnrollments => Set<SpecialSessionEnrollment>();
    public DbSet<MemberFitnessPlan> MemberFitnessPlans => Set<MemberFitnessPlan>();
    public DbSet<MemberPlanRequest> MemberPlanRequests => Set<MemberPlanRequest>();
    public DbSet<GeneralClass> GeneralClasses => Set<GeneralClass>();

    /// <summary>Creates the database if needed, applies schema migrations, and seeds reference data.</summary>
    public async Task InitializeAsync()
    {
        await EnsureDatabaseAsync();
        await SeedAsync();
        await EnsureExpiredTestMembersAsync();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await AssignIdentificationNumbersAsync(cancellationToken);
        return await base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureIdentityKeys(modelBuilder);

        modelBuilder.Entity<UserRole>()
            .HasIndex(ur => new { ur.UserId, ur.RoleId })
            .IsUnique();

        modelBuilder.Entity<Member>()
            .Property(m => m.IdentificationNumber)
            .HasMaxLength(15)
            .IsRequired();

        modelBuilder.Entity<Instructor>()
            .Property(i => i.IdentificationNumber)
            .HasMaxLength(12)
            .IsRequired();

        modelBuilder.Entity<Member>()
            .HasOne(m => m.User)
            .WithOne(u => u.Member)
            .HasForeignKey<Member>(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Instructor>()
            .HasOne(i => i.User)
            .WithOne(u => u.Instructor)
            .HasForeignKey<Instructor>(i => i.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Member>()
            .HasIndex(m => m.IdentificationNumber)
            .IsUnique();

        modelBuilder.Entity<Instructor>()
            .HasIndex(i => i.IdentificationNumber)
            .IsUnique();

        modelBuilder.Entity<Payment>()
            .HasIndex(p => p.PaymentReference)
            .IsUnique();

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.OrderReference)
            .IsUnique();

        modelBuilder.Entity<Product>()
            .HasIndex(p => p.SKU)
            .IsUnique();

        modelBuilder.Entity<InventoryItem>()
            .HasOne(i => i.Product)
            .WithOne(p => p.Inventory)
            .HasForeignKey<InventoryItem>(i => i.ProductId);

        modelBuilder.Entity<InventoryAdjustment>()
            .HasOne(a => a.AdjustedByUser)
            .WithMany()
            .HasForeignKey(a => a.AdjustedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.ProcessedByUser)
            .WithMany()
            .HasForeignKey(o => o.ProcessedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MembershipPayment>()
            .HasOne(mp => mp.Payment)
            .WithMany()
            .HasForeignKey(mp => mp.PaymentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MembershipPayment>()
            .HasOne(mp => mp.Membership)
            .WithMany()
            .HasForeignKey(mp => mp.MembershipId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MembershipPayment>()
            .HasOne(mp => mp.Package)
            .WithMany()
            .HasForeignKey(mp => mp.PackageId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Member)
            .WithMany()
            .HasForeignKey(p => p.MemberId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AttendanceLog>()
            .ToTable(t => t.HasCheckConstraint(
                "CK_AttendanceLogs_Person",
                "NOT ([MemberId] IS NOT NULL AND [InstructorId] IS NOT NULL)"));

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Payment)
            .WithMany()
            .HasForeignKey(o => o.PaymentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SpecialSessionEnrollment>()
            .HasIndex(e => new { e.SessionId, e.MemberId })
            .IsUnique();

        modelBuilder.Entity<SpecialSessionEnrollment>()
            .HasOne(e => e.Session)
            .WithMany(s => s.Enrollments)
            .HasForeignKey(e => e.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SpecialSessionEnrollment>()
            .HasOne(e => e.Member)
            .WithMany()
            .HasForeignKey(e => e.MemberId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SpecialSessionEnrollment>()
            .HasOne(e => e.Payment)
            .WithMany()
            .HasForeignKey(e => e.PaymentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SpecialSession>()
            .HasOne(s => s.ReviewedByUser)
            .WithMany()
            .HasForeignKey(s => s.ReviewedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MemberFitnessPlan>()
            .HasOne(p => p.Member)
            .WithMany()
            .HasForeignKey(p => p.MemberId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MemberFitnessPlan>()
            .HasOne(p => p.Instructor)
            .WithMany()
            .HasForeignKey(p => p.InstructorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MemberFitnessPlan>()
            .HasOne(p => p.Request)
            .WithOne(r => r.Plan)
            .HasForeignKey<MemberFitnessPlan>(p => p.RequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MemberFitnessPlan>()
            .HasIndex(p => new { p.MemberId, p.UpdatedAt });

        modelBuilder.Entity<MemberPlanRequest>()
            .HasOne(r => r.Member)
            .WithMany()
            .HasForeignKey(r => r.MemberId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MemberPlanRequest>()
            .HasOne(r => r.Instructor)
            .WithMany()
            .HasForeignKey(r => r.InstructorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MemberPlanRequest>()
            .HasIndex(r => new { r.InstructorId, r.Status });

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties().Where(p => p.ClrType == typeof(decimal)))
            {
                property.SetPrecision(12);
                property.SetScale(2);
            }
        }
    }

    private static void ConfigureIdentityKeys(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>(e =>
        {
            e.HasKey(x => x.RoleId);
            e.Property(x => x.RoleId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(x => x.UserId);
            e.Property(x => x.UserId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<UserRole>(e =>
        {
            e.HasKey(x => x.UserRoleId);
            e.Property(x => x.UserRoleId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<MembershipPackageType>(e =>
        {
            e.HasKey(x => x.PackageTypeId);
            e.Property(x => x.PackageTypeId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<MembershipPackage>(e =>
        {
            e.HasKey(x => x.PackageId);
            e.Property(x => x.PackageId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<Member>(e =>
        {
            e.HasKey(x => x.MemberId);
            e.Property(x => x.MemberId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<Instructor>(e =>
        {
            e.HasKey(x => x.InstructorId);
            e.Property(x => x.InstructorId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<Membership>(e =>
        {
            e.HasKey(x => x.MembershipId);
            e.Property(x => x.MembershipId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<PaymentMethod>(e =>
        {
            e.HasKey(x => x.PaymentMethodId);
            e.Property(x => x.PaymentMethodId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<PaymentStatus>(e =>
        {
            e.HasKey(x => x.PaymentStatusId);
            e.Property(x => x.PaymentStatusId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<Payment>(e =>
        {
            e.HasKey(x => x.PaymentId);
            e.Property(x => x.PaymentId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<MembershipPayment>(e =>
        {
            e.HasKey(x => x.MembershipPaymentId);
            e.Property(x => x.MembershipPaymentId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<AttendanceLog>(e =>
        {
            e.HasKey(x => x.AttendanceLogId);
            e.Property(x => x.AttendanceLogId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<ProductCategory>(e =>
        {
            e.HasKey(x => x.CategoryId);
            e.Property(x => x.CategoryId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<Product>(e =>
        {
            e.HasKey(x => x.ProductId);
            e.Property(x => x.ProductId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<InventoryItem>(e =>
        {
            e.HasKey(x => x.InventoryItemId);
            e.Property(x => x.InventoryItemId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<InventoryAdjustment>(e =>
        {
            e.HasKey(x => x.AdjustmentId);
            e.Property(x => x.AdjustmentId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<OrderStatus>(e =>
        {
            e.HasKey(x => x.OrderStatusId);
            e.Property(x => x.OrderStatusId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<Order>(e =>
        {
            e.HasKey(x => x.OrderId);
            e.Property(x => x.OrderId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.HasKey(x => x.OrderItemId);
            e.Property(x => x.OrderItemId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<Trainer>(e =>
        {
            e.HasKey(x => x.TrainerId);
            e.Property(x => x.TrainerId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<ContactMessage>(e =>
        {
            e.HasKey(x => x.ContactMessageId);
            e.Property(x => x.ContactMessageId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<SpecialSession>(e =>
        {
            e.HasKey(x => x.SessionId);
            e.Property(x => x.SessionId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<SpecialSessionEnrollment>(e =>
        {
            e.HasKey(x => x.EnrollmentId);
            e.Property(x => x.EnrollmentId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<MemberFitnessPlan>(e =>
        {
            e.HasKey(x => x.PlanId);
            e.Property(x => x.PlanId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<MemberPlanRequest>(e =>
        {
            e.HasKey(x => x.RequestId);
            e.Property(x => x.RequestId).UseIdentityColumn(1, 1);
        });
        modelBuilder.Entity<GeneralClass>(e =>
        {
            e.ToTable("generalClasses");
            e.HasKey(x => x.GeneralClassId);
            e.Property(x => x.GeneralClassId).UseIdentityColumn(1, 1);
            e.HasOne(x => x.Instructor)
                .WithMany()
                .HasForeignKey(x => x.InstructorId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private async Task AssignIdentificationNumbersAsync(CancellationToken cancellationToken)
    {
        var newMembers = ChangeTracker.Entries<Member>()
            .Where(e => e.State == EntityState.Added && string.IsNullOrWhiteSpace(e.Entity.IdentificationNumber))
            .Select(e => e.Entity)
            .ToList();

        if (newMembers.Count > 0)
        {
            var nextSequence = await GetNextMemberSequenceAsync(cancellationToken);
            foreach (var member in newMembers)
            {
                member.IdentificationNumber = FormatMemberIdentificationNumber(nextSequence++);
            }
        }

        var newInstructors = ChangeTracker.Entries<Instructor>()
            .Where(e => e.State == EntityState.Added && string.IsNullOrWhiteSpace(e.Entity.IdentificationNumber))
            .Select(e => e.Entity)
            .ToList();

        if (newInstructors.Count > 0)
        {
            var nextSequence = await GetNextInstructorSequenceAsync(cancellationToken);
            foreach (var instructor in newInstructors)
            {
                instructor.IdentificationNumber = FormatInstructorIdentificationNumber(nextSequence++);
            }
        }
    }

    private async Task<int> GetNextMemberSequenceAsync(CancellationToken cancellationToken)
    {
        var existingNumbers = await Members
            .AsNoTracking()
            .Select(m => m.IdentificationNumber)
            .ToListAsync(cancellationToken);

        return existingNumbers
            .Select(ParseMemberSequence)
            .DefaultIfEmpty(0)
            .Max() + 1;
    }

    private async Task<int> GetNextInstructorSequenceAsync(CancellationToken cancellationToken)
    {
        var existingNumbers = await Instructors
            .AsNoTracking()
            .Select(i => i.IdentificationNumber)
            .ToListAsync(cancellationToken);

        return existingNumbers
            .Select(ParseInstructorSequence)
            .DefaultIfEmpty(0)
            .Max() + 1;
    }

    public static string FormatMemberIdentificationNumber(int sequence) =>
        $"RFMEM{sequence:D7}";

    public static string FormatInstructorIdentificationNumber(int sequence) =>
        $"RFINS{sequence:D4}";

    private static int ParseMemberSequence(string value)
    {
        if (value.StartsWith("RFMEM", StringComparison.OrdinalIgnoreCase) &&
            int.TryParse(value[5..], out var sequence))
            return sequence;

        return 0;
    }

    private static int ParseInstructorSequence(string value)
    {
        if (value.StartsWith("RFINS", StringComparison.OrdinalIgnoreCase) &&
            int.TryParse(value[5..], out var sequence))
            return sequence;

        return 0;
    }

    /// <summary>Verifies SQL Server connectivity, creates or upgrades the schema, and runs incremental patches.</summary>
    private async Task EnsureDatabaseAsync()
    {
        var connectionString = Database.GetConnectionString()
            ?? throw new InvalidOperationException("Database connection string is not configured.");

        if (!await CanConnectToServerAsync(connectionString))
        {
            throw new InvalidOperationException(
                "Cannot connect to SQL Server. Verify SQL Server Express is running and the connection string in appsettings is correct.");
        }

        if (!await DatabaseExistsAsync(connectionString))
        {
            await CreateDatabaseAsync(connectionString);
            SqlConnection.ClearAllPools();
            await Database.EnsureCreatedAsync();
            return;
        }

        if (await UsesLegacySchemaAsync())
        {
            await RecreateDatabaseAsync(connectionString);
            return;
        }

        if (!await CoreSchemaExistsAsync())
        {
            await RecreateDatabaseAsync(connectionString);
            return;
        }

        await EnsureSessionSchemaAsync();
        await EnsureMemberPlanSchemaAsync();
        await EnsureMemberPlanRequestSchemaAsync();
        await EnsureOrderBillSchemaAsync();
        await EnsureProductSchemaAsync();
        await EnsureInstructorPublicProfileSchemaAsync();
        await EnsureMemberTerminationSchemaAsync();
        await EnsureInstructorTerminationSchemaAsync();
        await EnsureProductCategoriesAsync();
        await EnsurePackageSchemaAsync();
        await EnsureProductsAsync();
        await EnsureContactMessagesSchemaAsync();
        await EnsureGeneralClassesSchemaAsync();
    }

    /// <summary>Creates ContactMessages table on older databases without dropping existing data.</summary>
    private async Task EnsureContactMessagesSchemaAsync()
    {
        await Database.ExecuteSqlRawAsync("""
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ContactMessages')
            BEGIN
                CREATE TABLE [ContactMessages] (
                    [ContactMessageId] int NOT NULL IDENTITY,
                    [FullName] nvarchar(150) NOT NULL,
                    [Email] nvarchar(256) NOT NULL,
                    [Phone] nvarchar(20) NULL,
                    [Subject] nvarchar(200) NOT NULL CONSTRAINT [DF_ContactMessages_Subject] DEFAULT 'Website inquiry',
                    [Message] nvarchar(2000) NOT NULL,
                    [IsRead] bit NOT NULL CONSTRAINT [DF_ContactMessages_IsRead] DEFAULT 0,
                    [SubmittedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_ContactMessages] PRIMARY KEY ([ContactMessageId])
                );
            END
            """);
    }

    private async Task EnsureGeneralClassesSchemaAsync()
    {
        await Database.ExecuteSqlRawAsync("""
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'generalClasses')
            BEGIN
                CREATE TABLE [generalClasses] (
                    [GeneralClassId] int NOT NULL IDENTITY,
                    [Title] nvarchar(150) NOT NULL,
                    [Category] nvarchar(50) NOT NULL,
                    [Description] nvarchar(2000) NOT NULL,
                    [InstructorId] int NOT NULL,
                    [Weekday] int NOT NULL,
                    [TimeRange] nvarchar(50) NOT NULL,
                    [Duration] nvarchar(30) NOT NULL,
                    [Studio] nvarchar(120) NOT NULL,
                    [IsActive] bit NOT NULL CONSTRAINT [DF_generalClasses_IsActive] DEFAULT 1,
                    [CreatedAt] datetime2 NOT NULL,
                    [UpdatedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_generalClasses] PRIMARY KEY ([GeneralClassId]),
                    CONSTRAINT [FK_generalClasses_Instructors_InstructorId] FOREIGN KEY ([InstructorId]) REFERENCES [Instructors] ([InstructorId])
                );
            END
            ELSE
            BEGIN
                IF COL_LENGTH('generalClasses', 'Title') IS NULL AND COL_LENGTH('generalClasses', 'ClassName') IS NOT NULL
                    EXEC sp_rename 'generalClasses.ClassName', 'Title', 'COLUMN';
                IF COL_LENGTH('generalClasses', 'Category') IS NULL AND COL_LENGTH('generalClasses', 'ClassType') IS NOT NULL
                    EXEC sp_rename 'generalClasses.ClassType', 'Category', 'COLUMN';
                IF COL_LENGTH('generalClasses', 'ClassId') IS NOT NULL
                    ALTER TABLE [generalClasses] DROP COLUMN [ClassId];
            END
            """);

        if (!await GeneralClasses.AnyAsync())
            await SeedGeneralClassesIfEmptyAsync();
        else
            await EnsureZumbaGeneralClassesAsync();
    }

    private async Task SeedGeneralClassesIfEmptyAsync()
    {
        var instructors = await Instructors
            .Include(i => i.User)
            .Where(i => !i.IsTerminated)
            .ToListAsync();

        if (instructors.Count == 0)
            return;

        var assignedCounts = instructors.ToDictionary(i => i.InstructorId, _ => 0);
        var now = AppTime.Now();

        foreach (var slot in GeneralClassSeedData.DefaultSlots)
        {
            var instructor = PickInstructorForClass(instructors, slot.ClassKey, assignedCounts);
            assignedCounts[instructor.InstructorId]++;

            GeneralClasses.Add(new GeneralClass
            {
                Title = slot.Title,
                Category = slot.Category,
                Description = slot.Description,
                InstructorId = instructor.InstructorId,
                Weekday = slot.Weekday,
                TimeRange = slot.TimeRange,
                Duration = slot.Duration,
                Studio = slot.Studio,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            });
        }

        foreach (var instructor in instructors.Where(i => assignedCounts[i.InstructorId] == 0))
        {
            GeneralClasses.Add(new GeneralClass
            {
                Title = "Cardio Classes",
                Category = "Cardio",
                Description = "High-energy sessions designed to boost endurance, burn calories, and improve cardiovascular health.",
                InstructorId = instructor.InstructorId,
                Weekday = 1,
                TimeRange = "09:00 - 09:45",
                Duration = "45 min",
                Studio = "Cardio Hall",
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            });
        }

        await SaveChangesAsync();
    }

    /// <summary>Adds default Zumba classes when none exist yet (safe for existing databases).</summary>
    private async Task EnsureZumbaGeneralClassesAsync()
    {
        if (await GeneralClasses.AnyAsync(gc => gc.Category == "Zumba"))
            return;

        var instructors = await Instructors
            .Where(i => !i.IsTerminated)
            .ToListAsync();

        if (instructors.Count == 0)
            return;

        var assignedCounts = instructors.ToDictionary(i => i.InstructorId, _ => 0);
        var now = AppTime.Now();
        var zumbaSlots = GeneralClassSeedData.DefaultSlots
            .Where(slot => slot.ClassKey == "zumba")
            .ToList();

        foreach (var slot in zumbaSlots)
        {
            var instructor = PickInstructorForClass(instructors, slot.ClassKey, assignedCounts);
            assignedCounts[instructor.InstructorId]++;

            GeneralClasses.Add(new GeneralClass
            {
                Title = slot.Title,
                Category = slot.Category,
                Description = slot.Description,
                InstructorId = instructor.InstructorId,
                Weekday = slot.Weekday,
                TimeRange = slot.TimeRange,
                Duration = slot.Duration,
                Studio = slot.Studio,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            });
        }

        await SaveChangesAsync();
    }

    private static Instructor PickInstructorForClass(
        IReadOnlyList<Instructor> instructors,
        string classKey,
        IReadOnlyDictionary<int, int> assignedCounts)
    {
        var keywords = GeneralClassSeedData.SkillKeywords.TryGetValue(classKey, out var values)
            ? values
            : [];

        return instructors
            .Select(instructor =>
            {
                var haystack = string.Join(
                    ' ',
                    instructor.Specialization,
                    instructor.Speciality1,
                    instructor.Speciality2,
                    instructor.Speciality3).ToLowerInvariant();
                var score = keywords.Count(keyword => haystack.Contains(keyword, StringComparison.OrdinalIgnoreCase));
                return new { instructor, score };
            })
            .OrderByDescending(row => row.score)
            .ThenBy(row => assignedCounts.TryGetValue(row.instructor.InstructorId, out var count) ? count : 0)
            .ThenBy(row => row.instructor.InstructorId)
            .First()
            .instructor;
    }

    /// <summary>Adds public website profile fields for instructors.</summary>
    private async Task EnsureInstructorPublicProfileSchemaAsync()
    {
        await Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('Instructors', 'YearsExperience') IS NULL
                ALTER TABLE Instructors ADD YearsExperience INT NOT NULL CONSTRAINT DF_Instructors_YearsExperience DEFAULT 0;
            IF COL_LENGTH('Instructors', 'Qualification1') IS NULL
                ALTER TABLE Instructors ADD Qualification1 NVARCHAR(120) NULL;
            IF COL_LENGTH('Instructors', 'Qualification2') IS NULL
                ALTER TABLE Instructors ADD Qualification2 NVARCHAR(120) NULL;
            IF COL_LENGTH('Instructors', 'Speciality1') IS NULL
                ALTER TABLE Instructors ADD Speciality1 NVARCHAR(120) NULL;
            IF COL_LENGTH('Instructors', 'Speciality2') IS NULL
                ALTER TABLE Instructors ADD Speciality2 NVARCHAR(120) NULL;
            IF COL_LENGTH('Instructors', 'Speciality3') IS NULL
                ALTER TABLE Instructors ADD Speciality3 NVARCHAR(120) NULL;
            IF COL_LENGTH('Instructors', 'ProfilePhotoUrl') IS NULL
                ALTER TABLE Instructors ADD ProfilePhotoUrl NVARCHAR(500) NULL;
            """);
    }

    /// <summary>Adds member termination columns for admin lifecycle management.</summary>
    private async Task EnsureMemberTerminationSchemaAsync()
    {
        await Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('Members', 'IsTerminated') IS NULL
                ALTER TABLE Members ADD IsTerminated BIT NOT NULL CONSTRAINT DF_Members_IsTerminated DEFAULT 0;
            IF COL_LENGTH('Members', 'TerminatedAt') IS NULL
                ALTER TABLE Members ADD TerminatedAt DATETIME2 NULL;
            """);
    }

    /// <summary>Adds instructor termination and profile columns for admin lifecycle management.</summary>
    private async Task EnsureInstructorTerminationSchemaAsync()
    {
        await Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('Instructors', 'IsTerminated') IS NULL
                ALTER TABLE Instructors ADD IsTerminated BIT NOT NULL CONSTRAINT DF_Instructors_IsTerminated DEFAULT 0;
            IF COL_LENGTH('Instructors', 'TerminatedAt') IS NULL
                ALTER TABLE Instructors ADD TerminatedAt DATETIME2 NULL;
            IF COL_LENGTH('Instructors', 'Bio') IS NULL
                ALTER TABLE Instructors ADD Bio NVARCHAR(MAX) NULL;
            """);
    }

    /// <summary>Adds missing product columns (ImageUrl, IsActive) on existing databases.</summary>
    private async Task EnsureProductSchemaAsync()
    {
        await Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('Products', 'ImageUrl') IS NULL
                ALTER TABLE Products ADD ImageUrl NVARCHAR(500) NULL;
            IF COL_LENGTH('Products', 'IsActive') IS NULL
                ALTER TABLE Products ADD IsActive BIT NOT NULL CONSTRAINT DF_Products_IsActive DEFAULT 1;
            IF COL_LENGTH('Products', 'IsAvailableOnline') IS NOT NULL
            BEGIN
                UPDATE Products SET IsAvailableOnline = 1 WHERE IsAvailableOnline IS NULL;
            END
            IF COL_LENGTH('Products', 'IsAvailableOnline') IS NULL
                ALTER TABLE Products ADD IsAvailableOnline BIT NOT NULL CONSTRAINT DF_Products_IsAvailableOnline DEFAULT 1;
            """);
    }

    /// <summary>Adds missing membership package columns (Amenities, IsFeatured) on existing databases.</summary>
    private async Task EnsurePackageSchemaAsync()
    {
        await Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('MembershipPackages', 'Amenities') IS NULL
                ALTER TABLE MembershipPackages ADD Amenities NVARCHAR(MAX) NULL;
            IF COL_LENGTH('MembershipPackages', 'IsFeatured') IS NULL
                ALTER TABLE MembershipPackages ADD IsFeatured BIT NOT NULL CONSTRAINT DF_MembershipPackages_IsFeatured DEFAULT 0;
            """);
    }

    /// <summary>Seeds default shop products when the catalog is empty.</summary>
    private async Task EnsureProductsAsync()
    {
        if (await Products.AnyAsync()) return;
        if (!await ProductCategories.AnyAsync())
        {
            ProductCategories.AddRange(
                new ProductCategory { CategoryName = "Supplements", Description = "Protein, pre-workout, vitamins" },
                new ProductCategory { CategoryName = "Merchandise", Description = "Gym apparel and accessories" });
            await SaveChangesAsync();
        }

        Products.AddRange(
            new Product { CategoryId = 1, SKU = "SUP-WHEY-1KG", ProductName = "Roar Whey Protein 1kg", Description = "Premium whey isolate", UnitPriceLKR = 12500, Inventory = new InventoryItem { QuantityOnHand = 50, ReorderLevel = 10 } },
            new Product { CategoryId = 1, SKU = "SUP-PRE-300G", ProductName = "Roar Pre-Workout 300g", Description = "Energy and focus blend", UnitPriceLKR = 6500, Inventory = new InventoryItem { QuantityOnHand = 30, ReorderLevel = 8 } },
            new Product { CategoryId = 2, SKU = "MER-TSHIRT-M", ProductName = "Roar Fitness T-Shirt (M)", Description = "Black cotton tee with logo", UnitPriceLKR = 3500, Inventory = new InventoryItem { QuantityOnHand = 40, ReorderLevel = 10 } },
            new Product { CategoryId = 2, SKU = "MER-HOODIE-L", ProductName = "Roar Hoodie (L)", Description = "Premium black hoodie", UnitPriceLKR = 7500, Inventory = new InventoryItem { QuantityOnHand = 25, ReorderLevel = 5 } });
        await SaveChangesAsync();
    }

    /// <summary>Adds the BillReference column to Orders for POS receipt tracking.</summary>
    private async Task EnsureOrderBillSchemaAsync()
    {
        await Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('Orders', 'BillReference') IS NULL
                ALTER TABLE Orders ADD BillReference NVARCHAR(30) NULL;
            """);
    }

    /// <summary>Seeds default product categories when none exist.</summary>
    private async Task EnsureProductCategoriesAsync()
    {
        if (!await ProductCategories.AnyAsync())
        {
            ProductCategories.AddRange(
                new ProductCategory { CategoryName = "Supplements", Description = "Protein, pre-workout, vitamins" },
                new ProductCategory { CategoryName = "Merchandise", Description = "Gym apparel and accessories" });
            await SaveChangesAsync();
        }
    }

    private static async Task<bool> CanConnectToServerAsync(string connectionString)
    {
        var masterBuilder = new SqlConnectionStringBuilder(connectionString) { InitialCatalog = "master" };
        try
        {
            await using var connection = new SqlConnection(masterBuilder.ConnectionString);
            await connection.OpenAsync();
            return true;
        }
        catch (SqlException)
        {
            return false;
        }
    }

    private static async Task<bool> DatabaseExistsAsync(string connectionString)
    {
        var builder = new SqlConnectionStringBuilder(connectionString);
        var databaseName = builder.InitialCatalog;
        if (string.IsNullOrWhiteSpace(databaseName))
            return false;

        var masterBuilder = new SqlConnectionStringBuilder(connectionString) { InitialCatalog = "master" };
        await using var connection = new SqlConnection(masterBuilder.ConnectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT CASE WHEN DB_ID(@databaseName) IS NULL THEN 0 ELSE 1 END";
        command.Parameters.Add(new SqlParameter("@databaseName", databaseName));
        var result = await command.ExecuteScalarAsync();
        return Convert.ToInt32(result) == 1;
    }

    private static async Task CreateDatabaseAsync(string connectionString)
    {
        var builder = new SqlConnectionStringBuilder(connectionString);
        var databaseName = builder.InitialCatalog
            ?? throw new InvalidOperationException("Connection string must specify a database name.");

        var masterBuilder = new SqlConnectionStringBuilder(connectionString) { InitialCatalog = "master" };
        await using var connection = new SqlConnection(masterBuilder.ConnectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandTimeout = 120;
        command.CommandText = $"""
            IF DB_ID(N'{databaseName.Replace("'", "''")}') IS NULL
            BEGIN
                CREATE DATABASE [{databaseName.Replace("]", "]]")}];
            END
            """;
        await command.ExecuteNonQueryAsync();
    }

    /// <summary>Creates SpecialSessions and SpecialSessionEnrollments tables when absent.</summary>
    private async Task EnsureSessionSchemaAsync()
    {
        if (await SessionSchemaExistsAsync())
            return;

        var connection = Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandTimeout = 120;
        command.CommandText = """
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SpecialSessions')
            BEGIN
                CREATE TABLE [SpecialSessions] (
                    [SessionId] int NOT NULL IDENTITY,
                    [InstructorId] int NOT NULL,
                    [Title] nvarchar(max) NOT NULL,
                    [Description] nvarchar(max) NOT NULL,
                    [StartDateTime] datetime2 NOT NULL,
                    [EndDateTime] datetime2 NOT NULL,
                    [FeePerPersonLKR] decimal(12,2) NOT NULL,
                    [MaxParticipants] int NOT NULL,
                    [Status] nvarchar(max) NOT NULL,
                    [RejectionReason] nvarchar(max) NULL,
                    [ReviewedByUserId] int NULL,
                    [ReviewedAt] datetime2 NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_SpecialSessions] PRIMARY KEY ([SessionId]),
                    CONSTRAINT [FK_SpecialSessions_Instructors_InstructorId] FOREIGN KEY ([InstructorId]) REFERENCES [Instructors] ([InstructorId]) ON DELETE CASCADE,
                    CONSTRAINT [FK_SpecialSessions_Users_ReviewedByUserId] FOREIGN KEY ([ReviewedByUserId]) REFERENCES [Users] ([UserId])
                );
            END

            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SpecialSessionEnrollments')
            BEGIN
                CREATE TABLE [SpecialSessionEnrollments] (
                    [EnrollmentId] int NOT NULL IDENTITY,
                    [SessionId] int NOT NULL,
                    [MemberId] int NOT NULL,
                    [PaymentId] int NOT NULL,
                    [EnrolledAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_SpecialSessionEnrollments] PRIMARY KEY ([EnrollmentId]),
                    CONSTRAINT [FK_SpecialSessionEnrollments_SpecialSessions_SessionId] FOREIGN KEY ([SessionId]) REFERENCES [SpecialSessions] ([SessionId]) ON DELETE CASCADE,
                    CONSTRAINT [FK_SpecialSessionEnrollments_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([MemberId]),
                    CONSTRAINT [FK_SpecialSessionEnrollments_Payments_PaymentId] FOREIGN KEY ([PaymentId]) REFERENCES [Payments] ([PaymentId])
                );
                CREATE UNIQUE INDEX [IX_SpecialSessionEnrollments_SessionId_MemberId] ON [SpecialSessionEnrollments] ([SessionId], [MemberId]);
            END
            """;
        await command.ExecuteNonQueryAsync();
    }

    /// <summary>Creates or migrates the MemberFitnessPlans table.</summary>
    private async Task EnsureMemberPlanSchemaAsync()
    {
        var connection = Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();

        await ExecuteSchemaCommandAsync(connection, """
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'MemberFitnessPlans')
            BEGIN
                CREATE TABLE [MemberFitnessPlans] (
                    [PlanId] int NOT NULL IDENTITY,
                    [RequestId] int NULL,
                    [MemberId] int NOT NULL,
                    [InstructorId] int NOT NULL,
                    [PlanCategory] nvarchar(50) NOT NULL,
                    [Description] nvarchar(max) NOT NULL,
                    [Notes] nvarchar(max) NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [UpdatedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_MemberFitnessPlans] PRIMARY KEY ([PlanId]),
                    CONSTRAINT [FK_MemberFitnessPlans_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([MemberId]),
                    CONSTRAINT [FK_MemberFitnessPlans_Instructors_InstructorId] FOREIGN KEY ([InstructorId]) REFERENCES [Instructors] ([InstructorId])
                );
                CREATE INDEX [IX_MemberFitnessPlans_MemberId_UpdatedAt] ON [MemberFitnessPlans] ([MemberId], [UpdatedAt]);
            END
            """);

        await ExecuteSchemaCommandAsync(connection, """
            IF COL_LENGTH('MemberFitnessPlans', 'Title') IS NOT NULL
            BEGIN
                IF COL_LENGTH('MemberFitnessPlans', 'PlanCategory') IS NULL
                    ALTER TABLE [MemberFitnessPlans] ADD [PlanCategory] nvarchar(50) NOT NULL CONSTRAINT [DF_MemberFitnessPlans_PlanCategory] DEFAULT 'Workout';
                IF COL_LENGTH('MemberFitnessPlans', 'Goal') IS NULL
                    ALTER TABLE [MemberFitnessPlans] ADD [Goal] nvarchar(50) NOT NULL CONSTRAINT [DF_MemberFitnessPlans_Goal] DEFAULT 'Fat Loss';
                IF COL_LENGTH('MemberFitnessPlans', 'Description') IS NULL
                    ALTER TABLE [MemberFitnessPlans] ADD [Description] nvarchar(max) NOT NULL CONSTRAINT [DF_MemberFitnessPlans_Description] DEFAULT '';
                IF COL_LENGTH('MemberFitnessPlans', 'RequestId') IS NULL
                    ALTER TABLE [MemberFitnessPlans] ADD [RequestId] int NULL;
            END
            """);

        await ExecuteSchemaCommandAsync(connection, """
            IF COL_LENGTH('MemberFitnessPlans', 'WorkoutPlan') IS NOT NULL
               AND COL_LENGTH('MemberFitnessPlans', 'Description') IS NOT NULL
                EXEC(N'
                    UPDATE [MemberFitnessPlans]
                    SET [Description] = CASE
                        WHEN [WorkoutPlan] IS NOT NULL AND LTRIM(RTRIM([WorkoutPlan])) <> '''' THEN [WorkoutPlan]
                        ELSE ISNULL([MealPlan], '''')
                    END
                    WHERE [Description] = '''';
                ');
            """);

        await ExecuteSchemaCommandAsync(connection, """
            IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_MemberFitnessPlans_PlanCategory')
                ALTER TABLE [MemberFitnessPlans] DROP CONSTRAINT [DF_MemberFitnessPlans_PlanCategory];
            IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_MemberFitnessPlans_Goal')
                ALTER TABLE [MemberFitnessPlans] DROP CONSTRAINT [DF_MemberFitnessPlans_Goal];
            IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_MemberFitnessPlans_Description')
                ALTER TABLE [MemberFitnessPlans] DROP CONSTRAINT [DF_MemberFitnessPlans_Description];

            IF COL_LENGTH('MemberFitnessPlans', 'Title') IS NOT NULL
                EXEC('ALTER TABLE [MemberFitnessPlans] DROP COLUMN [Title]');
            IF COL_LENGTH('MemberFitnessPlans', 'FitnessGoal') IS NOT NULL
                EXEC('ALTER TABLE [MemberFitnessPlans] DROP COLUMN [FitnessGoal]');
            IF COL_LENGTH('MemberFitnessPlans', 'WorkoutPlan') IS NOT NULL
                EXEC('ALTER TABLE [MemberFitnessPlans] DROP COLUMN [WorkoutPlan]');
            IF COL_LENGTH('MemberFitnessPlans', 'MealPlan') IS NOT NULL
                EXEC('ALTER TABLE [MemberFitnessPlans] DROP COLUMN [MealPlan]');
            IF COL_LENGTH('MemberFitnessPlans', 'Goal') IS NOT NULL
            BEGIN
                IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_MemberFitnessPlans_Goal')
                    ALTER TABLE [MemberFitnessPlans] DROP CONSTRAINT [DF_MemberFitnessPlans_Goal];
                ALTER TABLE [MemberFitnessPlans] DROP COLUMN [Goal];
            END
            """);
    }

    private static async Task ExecuteSchemaCommandAsync(System.Data.Common.DbConnection connection, string sql)
    {
        await using var command = connection.CreateCommand();
        command.CommandTimeout = 120;
        command.CommandText = sql;
        await command.ExecuteNonQueryAsync();
    }

    /// <summary>Creates the MemberPlanRequests table and links it to approved plans.</summary>
    private async Task EnsureMemberPlanRequestSchemaAsync()
    {
        var connection = Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandTimeout = 120;
        command.CommandText = """
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'MemberPlanRequests')
            BEGIN
                CREATE TABLE [MemberPlanRequests] (
                    [RequestId] int NOT NULL IDENTITY,
                    [MemberId] int NOT NULL,
                    [InstructorId] int NOT NULL,
                    [PlanCategory] nvarchar(50) NOT NULL,
                    [MemberNote] nvarchar(max) NULL,
                    [Status] nvarchar(50) NOT NULL CONSTRAINT [DF_MemberPlanRequests_Status] DEFAULT 'Pending',
                    [PlanId] int NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [ApprovedAt] datetime2 NULL,
                    CONSTRAINT [PK_MemberPlanRequests] PRIMARY KEY ([RequestId]),
                    CONSTRAINT [FK_MemberPlanRequests_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([MemberId]),
                    CONSTRAINT [FK_MemberPlanRequests_Instructors_InstructorId] FOREIGN KEY ([InstructorId]) REFERENCES [Instructors] ([InstructorId]),
                    CONSTRAINT [FK_MemberPlanRequests_MemberFitnessPlans_PlanId] FOREIGN KEY ([PlanId]) REFERENCES [MemberFitnessPlans] ([PlanId])
                );
                CREATE INDEX [IX_MemberPlanRequests_InstructorId_Status] ON [MemberPlanRequests] ([InstructorId], [Status]);
            END

            IF COL_LENGTH('MemberPlanRequests', 'MemberNote') IS NULL
                ALTER TABLE [MemberPlanRequests] ADD [MemberNote] nvarchar(max) NULL;

            IF COL_LENGTH('MemberPlanRequests', 'Goal') IS NOT NULL
            BEGIN
                EXEC(N'
                    UPDATE [MemberPlanRequests]
                    SET [MemberNote] = [Goal]
                    WHERE ([MemberNote] IS NULL OR LTRIM(RTRIM([MemberNote])) = '''')
                      AND [Goal] IS NOT NULL
                      AND LTRIM(RTRIM([Goal])) <> '''';
                ');
                ALTER TABLE [MemberPlanRequests] DROP COLUMN [Goal];
            END

            IF NOT EXISTS (
                SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_MemberFitnessPlans_MemberPlanRequests_RequestId'
            ) AND COL_LENGTH('MemberFitnessPlans', 'RequestId') IS NOT NULL
            BEGIN
                ALTER TABLE [MemberFitnessPlans]
                ADD CONSTRAINT [FK_MemberFitnessPlans_MemberPlanRequests_RequestId]
                FOREIGN KEY ([RequestId]) REFERENCES [MemberPlanRequests] ([RequestId]);
            END
            """;
        await command.ExecuteNonQueryAsync();
    }

    private async Task<bool> MemberPlanSchemaExistsAsync()
    {
        var connection = Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT CASE
                WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_NAME = 'MemberFitnessPlans'
                ) THEN 1
                ELSE 0
            END
            """;

        var result = await command.ExecuteScalarAsync();
        return Convert.ToInt32(result) == 1;
    }

    private async Task<bool> CoreSchemaExistsAsync()
    {
        var connection = Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT CASE
                WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
                 AND EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Instructors')
                 AND EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Members')
                THEN 1
                ELSE 0
            END
            """;

        var result = await command.ExecuteScalarAsync();
        return Convert.ToInt32(result) == 1;
    }

    private async Task<bool> SessionSchemaExistsAsync()
    {
        var connection = Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT CASE
                WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_NAME = 'SpecialSessions'
                ) AND EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_NAME = 'SpecialSessionEnrollments'
                ) THEN 1
                ELSE 0
            END
            """;

        var result = await command.ExecuteScalarAsync();
        return Convert.ToInt32(result) == 1;
    }

    private async Task RecreateDatabaseAsync(string connectionString)
    {
        var builder = new SqlConnectionStringBuilder(connectionString);
        var databaseName = builder.InitialCatalog
            ?? throw new InvalidOperationException("Connection string must specify a database name.");

        await Database.CloseConnectionAsync();

        var escapedDb = databaseName.Replace("]", "]]");
        var escapedDbLiteral = databaseName.Replace("'", "''");
        var masterBuilder = new SqlConnectionStringBuilder(connectionString) { InitialCatalog = "master" };

        await using (var masterConnection = new SqlConnection(masterBuilder.ConnectionString))
        {
            await masterConnection.OpenAsync();
            await using var dropCommand = masterConnection.CreateCommand();
            dropCommand.CommandTimeout = 120;
            dropCommand.CommandText = $"""
                IF DB_ID(N'{escapedDbLiteral}') IS NOT NULL
                BEGIN
                    ALTER DATABASE [{escapedDb}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                    DROP DATABASE [{escapedDb}];
                END
                """;
            await dropCommand.ExecuteNonQueryAsync();
        }

        SqlConnection.ClearAllPools();
        await Task.Delay(750);

        await CreateDatabaseAsync(connectionString);
        SqlConnection.ClearAllPools();
        await Task.Delay(250);

        await Database.CloseConnectionAsync();
        await Database.EnsureCreatedAsync();
    }

    private async Task<bool> UsesLegacySchemaAsync()
    {
        var connection = Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT CASE
                WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'Members' AND COLUMN_NAME = 'MemberCode'
                ) THEN 1
                WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'Instructors' AND COLUMN_NAME = 'EmployeeCode'
                ) THEN 1
                WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_NAME = 'Members'
                ) AND NOT EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'Members' AND COLUMN_NAME = 'IdentificationNumber'
                ) THEN 1
                WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_NAME = 'Instructors'
                ) AND NOT EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'Instructors' AND COLUMN_NAME = 'IdentificationNumber'
                ) THEN 1
                WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_NAME = 'AttendanceEventTypes'
                ) THEN 1
                WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'AttendanceLogs' AND COLUMN_NAME = 'EventTypeId'
                ) THEN 1
                WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'AttendanceLogs' AND COLUMN_NAME = 'IsValidEntry'
                ) THEN 1
                WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_NAME = 'Amenities'
                ) THEN 1
                WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_NAME = 'Members'
                ) AND NOT EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'Members' AND COLUMN_NAME = 'NicNumber'
                ) THEN 1
                WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_NAME = 'Instructors'
                ) AND NOT EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'Instructors' AND COLUMN_NAME = 'DateOfBirth'
                ) THEN 1
                ELSE 0
            END
            """;

        var result = await command.ExecuteScalarAsync();
        return Convert.ToInt32(result) == 1;
    }

    private async Task SeedAsync()
    {
        if (await Roles.AnyAsync()) return;

        Roles.AddRange(
            new Role { RoleName = "Admin", Description = "System administrator" },
            new Role { RoleName = "Member", Description = "Gym member" },
            new Role { RoleName = "Instructor", Description = "Gym instructor" });

        MembershipPackageTypes.AddRange(
            new MembershipPackageType { TypeName = "Monthly", Description = "1 month membership" },
            new MembershipPackageType { TypeName = "Quarterly", Description = "3 month membership" },
            new MembershipPackageType { TypeName = "Annual", Description = "12 month membership" });

        PaymentMethods.AddRange(
            new PaymentMethod { MethodName = "PayHere" },
            new PaymentMethod { MethodName = "Cash" },
            new PaymentMethod { MethodName = "Card" });

        PaymentStatuses.AddRange(
            new PaymentStatus { StatusName = "Pending" },
            new PaymentStatus { StatusName = "Completed" },
            new PaymentStatus { StatusName = "Failed" },
            new PaymentStatus { StatusName = "Refunded" });

        OrderStatuses.AddRange(
            new OrderStatus { StatusName = "PendingPayment" },
            new OrderStatus { StatusName = "Paid" },
            new OrderStatus { StatusName = "ReadyForCollection" },
            new OrderStatus { StatusName = "Collected" },
            new OrderStatus { StatusName = "Cancelled" });

        ProductCategories.AddRange(
            new ProductCategory { CategoryName = "Supplements", Description = "Protein, pre-workout, vitamins" },
            new ProductCategory { CategoryName = "Merchandise", Description = "Gym apparel and accessories" });

        await SaveChangesAsync();

        MembershipPackages.AddRange(
            new MembershipPackage { PackageTypeId = 1, PackageName = "Starter Monthly", Description = "Full gym access, locker, basic orientation", Amenities = "Full gym access\nLocker facilities\nFingerprint entry\nBasic orientation", DurationDays = 30, PriceLKR = 8500 },
            new MembershipPackage { PackageTypeId = 2, PackageName = "Power Quarterly", Description = "Full access + 2 PT sessions/month", Amenities = "Full gym access\n2 PT sessions/month\nLocker facilities\nFingerprint entry", DurationDays = 90, PriceLKR = 22000, IsFeatured = true },
            new MembershipPackage { PackageTypeId = 3, PackageName = "Roar Annual Elite", Description = "Unlimited access + nutrition consult + merch discount", Amenities = "Unlimited gym access\nNutrition consultation\nMerchandise discount\nPriority class booking\nFingerprint entry", DurationDays = 365, PriceLKR = 75000 });

        var adminUser = new User
        {
            Email = "admin@roarfitness.lk",
            PasswordHash = AuthenticationService.HashPassword("Admin@123"),
            FirstName = "System",
            LastName = "Administrator",
            Phone = "+94771234567",
            IsActive = true
        };
        adminUser.UserRoles.Add(new UserRole { RoleId = 1 });
        Users.Add(adminUser);

        Trainers.AddRange(
            new Trainer { FullName = "Dilshan Perera", Title = "Head Coach", Bio = "15 years strength & conditioning experience.", Specializations = "Strength, HIIT", DisplayOrder = 1 },
            new Trainer { FullName = "Amaya Fernando", Title = "Yoga & Mobility", Bio = "Certified yoga instructor focused on recovery.", Specializations = "Yoga, Mobility", DisplayOrder = 2 },
            new Trainer { FullName = "Ravindu Silva", Title = "Boxing Coach", Bio = "Former national amateur boxer.", Specializations = "Boxing, Cardio", DisplayOrder = 3 });

        await SaveChangesAsync();

        Products.AddRange(
            new Product { CategoryId = 1, SKU = "SUP-WHEY-1KG", ProductName = "Roar Whey Protein 1kg", Description = "Premium whey isolate", UnitPriceLKR = 12500 },
            new Product { CategoryId = 1, SKU = "SUP-PRE-300G", ProductName = "Roar Pre-Workout 300g", Description = "Energy and focus blend", UnitPriceLKR = 6500 },
            new Product { CategoryId = 2, SKU = "MER-TSHIRT-M", ProductName = "Roar Fitness T-Shirt (M)", Description = "Black cotton tee with logo", UnitPriceLKR = 3500 },
            new Product { CategoryId = 2, SKU = "MER-HOODIE-L", ProductName = "Roar Hoodie (L)", Description = "Premium black hoodie", UnitPriceLKR = 7500 });

        await SaveChangesAsync();

        InventoryItems.AddRange(
            new InventoryItem { ProductId = 1, QuantityOnHand = 50, ReorderLevel = 10 },
            new InventoryItem { ProductId = 2, QuantityOnHand = 30, ReorderLevel = 8 },
            new InventoryItem { ProductId = 3, QuantityOnHand = 40, ReorderLevel = 10 },
            new InventoryItem { ProductId = 4, QuantityOnHand = 25, ReorderLevel = 5 });

        await SaveChangesAsync();
    }

    /// <summary>
    /// Ensures 25 inactive members with expired memberships exist for portal/admin testing.
    /// Idempotent: only inserts missing @expired-test.roarfitness.lk accounts; never updates existing data.
    /// </summary>
    private async Task EnsureExpiredTestMembersAsync()
    {
        const int targetCount = 25;
        const string markerDomain = "@expired-test.roarfitness.lk";

        var existingCount = await Users.CountAsync(u => u.Email.EndsWith(markerDomain));
        if (existingCount >= targetCount)
            return;

        var memberRole = await Roles.FirstOrDefaultAsync(r => r.RoleName == "Member");
        if (memberRole is null)
            return;

        var packages = await MembershipPackages.Where(p => p.IsActive).OrderBy(p => p.PackageId).ToListAsync();
        if (packages.Count == 0)
            return;

        var today = ProfileHelper.GetAppToday();
        var random = new Random(20260623);
        var toAdd = targetCount - existingCount;

        var existingEmails = await Users
            .Where(u => u.Email.EndsWith(markerDomain))
            .Select(u => u.Email)
            .ToListAsync();
        var emailSet = existingEmails.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var firstNames = new[]
        {
            "Kasun", "Nimali", "Tharindu", "Ayeshi", "Ravindu", "Dilshan", "Sachini", "Imesh", "Harsha", "Malini",
            "Pasindu", "Chathuri", "Nuwan", "Sanduni", "Lahiru", "Ishara", "Kavindu", "Dinithi", "Supun", "Amaya",
            "Vihanga", "Yasith", "Tharushi", "Buddhika", "Shanika", "Gayan", "Piumi", "Rashmi", "Akila", "Dinesh",
        };
        var lastNames = new[]
        {
            "Wickramasinghe", "Jayawardena", "Silva", "Fernando", "Perera", "Ratnayake", "Bandara", "Karunaratne",
            "Gunasekara", "Mendis", "Weerasinghe", "Dissanayake", "Abeysekera", "Rajapaksa", "Ekanayake", "Peiris",
            "Amarasinghe", "Senanayake", "Wijesuriya", "Herath",
        };
        var cities = new[]
        {
            ("Colombo", "Colombo"), ("Nugegoda", "Nugegoda"), ("Dehiwala", "Dehiwala"), ("Kandy", "Kandy"),
            ("Negombo", "Negombo"), ("Gampaha", "Gampaha"), ("Moratuwa", "Moratuwa"), ("Mount Lavinia", "Dehiwala"),
            ("Panadura", "Panadura"), ("Kelaniya", "Kelaniya"),
        };

        var created = 0;
        var attempts = 0;
        var maxAttempts = toAdd * 20;

        while (created < toAdd && attempts < maxAttempts)
        {
            attempts++;

            var firstName = firstNames[random.Next(firstNames.Length)];
            var lastName = lastNames[random.Next(lastNames.Length)];
            var suffix = random.Next(1000, 99999);
            var email = $"{firstName}.{lastName}.{suffix}{markerDomain}".ToLowerInvariant();
            if (!emailSet.Add(email))
                continue;

            var (city, cityLabel) = cities[random.Next(cities.Length)];
            var gender = random.Next(2) == 0 ? "Male" : "Female";
            var birthYear = random.Next(1990, 2004);
            var birthMonth = random.Next(1, 13);
            var birthDay = random.Next(1, 28);
            var dateOfBirth = new DateTime(birthYear, birthMonth, birthDay);
            var nicNumber = $"9{random.Next(10000000, 99999999)}V";
            var phone = $"+9477{random.Next(1000000, 9999999)}";
            var daysExpired = random.Next(3, 365);
            var endDate = today.AddDays(-daysExpired);
            var package = packages[random.Next(packages.Count)];
            var startDate = endDate.AddDays(-package.DurationDays);
            var isFingerprintActivated = random.Next(100) < 65;

            var user = new User
            {
                Email = email,
                PasswordHash = AuthenticationService.HashPassword("Member@123"),
                FirstName = firstName,
                LastName = lastName,
                Phone = phone,
                IsActive = true,
            };
            user.UserRoles.Add(new UserRole { Role = memberRole });

            var member = new Member
            {
                User = user,
                NicNumber = nicNumber,
                DateOfBirth = dateOfBirth,
                Gender = gender,
                AddressLine1 = $"{random.Next(1, 180)} Main Road, {cityLabel}",
                City = city,
                Country = "Sri Lanka",
                EmergencyContactName = $"{firstNames[random.Next(firstNames.Length)]} {lastName}",
                EmergencyContactPhone = $"+9476{random.Next(1000000, 9999999)}",
                IsFingerprintActivated = isFingerprintActivated,
                FingerprintActivatedAt = isFingerprintActivated ? endDate.AddDays(-random.Next(5, 40)) : null,
            };

            Users.Add(user);
            Members.Add(member);
            await SaveChangesAsync();

            Memberships.Add(new Membership
            {
                MemberId = member.MemberId,
                PackageId = package.PackageId,
                StartDate = startDate,
                EndDate = endDate,
                IsActive = false,
            });
            await SaveChangesAsync();

            created++;
        }
    }
}
