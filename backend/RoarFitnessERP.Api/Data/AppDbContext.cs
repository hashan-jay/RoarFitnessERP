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

    /// <summary>Creates the database if needed, applies schema migrations, and seeds reference data.</summary>
    public async Task InitializeAsync()
    {
        await EnsureDatabaseAsync();
        await SeedAsync();
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
            .HasIndex(p => new { p.MemberId, p.UpdatedAt });

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
        await EnsureOrderBillSchemaAsync();
        await EnsureProductSchemaAsync();
        await EnsureProfilePhotoSchemaAsync();
        await EnsureProductCategoriesAsync();
        await EnsurePackageSchemaAsync();
        await EnsureProductsAsync();
    }

    /// <summary>Adds missing product columns (ImageUrl, IsActive) on existing databases.</summary>
    private async Task EnsureProfilePhotoSchemaAsync()
    {
        await Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('Members', 'ProfilePhotoUrl') IS NULL
                ALTER TABLE Members ADD ProfilePhotoUrl NVARCHAR(500) NULL;
            IF COL_LENGTH('Instructors', 'ProfilePhotoUrl') IS NULL
                ALTER TABLE Instructors ADD ProfilePhotoUrl NVARCHAR(500) NULL;
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

    /// <summary>Creates the MemberFitnessPlans table when absent.</summary>
    private async Task EnsureMemberPlanSchemaAsync()
    {
        if (await MemberPlanSchemaExistsAsync())
            return;

        var connection = Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandTimeout = 120;
        command.CommandText = """
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'MemberFitnessPlans')
            BEGIN
                CREATE TABLE [MemberFitnessPlans] (
                    [PlanId] int NOT NULL IDENTITY,
                    [MemberId] int NOT NULL,
                    [InstructorId] int NOT NULL,
                    [Title] nvarchar(max) NOT NULL,
                    [FitnessGoal] nvarchar(max) NOT NULL,
                    [WorkoutPlan] nvarchar(max) NOT NULL,
                    [MealPlan] nvarchar(max) NOT NULL,
                    [Notes] nvarchar(max) NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [UpdatedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_MemberFitnessPlans] PRIMARY KEY ([PlanId]),
                    CONSTRAINT [FK_MemberFitnessPlans_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([MemberId]),
                    CONSTRAINT [FK_MemberFitnessPlans_Instructors_InstructorId] FOREIGN KEY ([InstructorId]) REFERENCES [Instructors] ([InstructorId])
                );
                CREATE INDEX [IX_MemberFitnessPlans_MemberId_UpdatedAt] ON [MemberFitnessPlans] ([MemberId], [UpdatedAt]);
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
}
