-- Roar Fitness ERP - Normalized SQL Server Schema
-- Run against a new database: RoarFitnessERP

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'RoarFitnessERPDB')
BEGIN
    CREATE DATABASE RoarFitnessERPDB;
END
GO

USE RoarFitnessERPDB;
GO

-- ============ LOOKUP / REFERENCE TABLES ============

CREATE TABLE Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(200) NULL
);

CREATE TABLE MembershipPackageTypes (
    PackageTypeId INT IDENTITY(1,1) PRIMARY KEY,
    TypeName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL
);

CREATE TABLE PaymentMethods (
    PaymentMethodId INT IDENTITY(1,1) PRIMARY KEY,
    MethodName NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE PaymentStatuses (
    PaymentStatusId INT IDENTITY(1,1) PRIMARY KEY,
    StatusName NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE OrderStatuses (
    OrderStatusId INT IDENTITY(1,1) PRIMARY KEY,
    StatusName NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE ProductCategories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL
);

-- ============ CORE AUTH (single Users table, role via junction) ============

CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL
);

CREATE TABLE UserRoles (
    UserRoleId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL REFERENCES Users(UserId) ON DELETE CASCADE,
    RoleId INT NOT NULL REFERENCES Roles(RoleId),
    AssignedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_UserRoles_User_Role UNIQUE (UserId, RoleId)
);

-- ============ MEMBERSHIP ============

CREATE TABLE MembershipPackages (
    PackageId INT IDENTITY(1,1) PRIMARY KEY,
    PackageTypeId INT NOT NULL REFERENCES MembershipPackageTypes(PackageTypeId),
    PackageName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(1000) NULL,
    DurationDays INT NOT NULL,
    PriceLKR DECIMAL(12,2) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Members (
    MemberId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL UNIQUE REFERENCES Users(UserId) ON DELETE CASCADE,
    IdentificationNumber NVARCHAR(15) NOT NULL UNIQUE,
    NicNumber NVARCHAR(20) NULL,
    DateOfBirth DATE NULL,
    Gender NVARCHAR(20) NULL,
    AddressLine1 NVARCHAR(200) NULL,
    City NVARCHAR(100) NULL DEFAULT N'Colombo',
    Country NVARCHAR(100) NULL DEFAULT N'Sri Lanka',
    EmergencyContactName NVARCHAR(100) NULL,
    EmergencyContactPhone NVARCHAR(20) NULL,
    FingerprintTemplateId NVARCHAR(200) NULL,
    IsFingerprintActivated BIT NOT NULL DEFAULT 0,
    FingerprintActivatedAt DATETIME2 NULL,
    JoinedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Instructors (
    InstructorId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL UNIQUE REFERENCES Users(UserId) ON DELETE CASCADE,
    IdentificationNumber NVARCHAR(12) NOT NULL UNIQUE,
    NicNumber NVARCHAR(20) NULL,
    DateOfBirth DATE NULL,
    AddressLine1 NVARCHAR(200) NULL,
    City NVARCHAR(100) NULL DEFAULT N'Colombo',
    Country NVARCHAR(100) NULL DEFAULT N'Sri Lanka',
    Specialization NVARCHAR(200) NULL,
    HireDate DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    FingerprintTemplateId NVARCHAR(200) NULL,
    IsFingerprintActivated BIT NOT NULL DEFAULT 0
);

CREATE TABLE Memberships (
    MembershipId INT IDENTITY(1,1) PRIMARY KEY,
    MemberId INT NOT NULL REFERENCES Members(MemberId),
    PackageId INT NOT NULL REFERENCES MembershipPackages(PackageId),
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- ============ PAYMENTS (membership + POS unified) ============

CREATE TABLE Payments (
    PaymentId INT IDENTITY(1,1) PRIMARY KEY,
    PaymentReference NVARCHAR(50) NOT NULL UNIQUE,
    MemberId INT NULL REFERENCES Members(MemberId),
    PaymentMethodId INT NOT NULL REFERENCES PaymentMethods(PaymentMethodId),
    PaymentStatusId INT NOT NULL REFERENCES PaymentStatuses(PaymentStatusId),
    AmountLKR DECIMAL(12,2) NOT NULL,
    Currency NVARCHAR(3) NOT NULL DEFAULT N'LKR',
    GatewayTransactionId NVARCHAR(200) NULL,
    PaymentPurpose NVARCHAR(50) NOT NULL, -- Membership, Merchandise, POS
    PaidAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE MembershipPayments (
    MembershipPaymentId INT IDENTITY(1,1) PRIMARY KEY,
    PaymentId INT NOT NULL UNIQUE REFERENCES Payments(PaymentId) ON DELETE CASCADE,
    MembershipId INT NOT NULL REFERENCES Memberships(MembershipId),
    PackageId INT NOT NULL REFERENCES MembershipPackages(PackageId)
);

-- ============ ATTENDANCE / FINGERPRINT (entry-only gate validation) ============

CREATE TABLE AttendanceLogs (
    AttendanceLogId BIGINT IDENTITY(1,1) PRIMARY KEY,
    MemberId INT NULL REFERENCES Members(MemberId),
    InstructorId INT NULL REFERENCES Instructors(InstructorId),
    FingerprintTemplateId NVARCHAR(200) NOT NULL,
    ScannerDeviceId NVARCHAR(100) NULL,
    AccessGranted BIT NOT NULL DEFAULT 0,
    ValidationMessage NVARCHAR(500) NULL,
    LoggedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_AttendanceLogs_Person CHECK (
        NOT (MemberId IS NOT NULL AND InstructorId IS NOT NULL)
    )
);

-- ============ INVENTORY & MERCHANDISE ============

CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL REFERENCES ProductCategories(CategoryId),
    SKU NVARCHAR(50) NOT NULL UNIQUE,
    ProductName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    UnitPriceLKR DECIMAL(12,2) NOT NULL,
    IsAvailableOnline BIT NOT NULL DEFAULT 1,
    IsActive BIT NOT NULL DEFAULT 1,
    ImageUrl NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE InventoryItems (
    InventoryItemId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL UNIQUE REFERENCES Products(ProductId) ON DELETE CASCADE,
    QuantityOnHand INT NOT NULL DEFAULT 0,
    ReorderLevel INT NOT NULL DEFAULT 5,
    LastRestockedAt DATETIME2 NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE InventoryAdjustments (
    AdjustmentId INT IDENTITY(1,1) PRIMARY KEY,
    InventoryItemId INT NOT NULL REFERENCES InventoryItems(InventoryItemId),
    AdjustedByUserId INT NOT NULL REFERENCES Users(UserId),
    QuantityChange INT NOT NULL,
    Reason NVARCHAR(500) NOT NULL,
    AdjustedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- ============ ORDERS (Click & Collect + POS) ============

CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    OrderReference NVARCHAR(50) NOT NULL UNIQUE,
    MemberId INT NULL REFERENCES Members(MemberId),
    OrderStatusId INT NOT NULL REFERENCES OrderStatuses(OrderStatusId),
    OrderChannel NVARCHAR(30) NOT NULL, -- OnlineClickCollect, InGymPOS
    SubtotalLKR DECIMAL(12,2) NOT NULL,
    TotalLKR DECIMAL(12,2) NOT NULL,
    PaymentId INT NULL REFERENCES Payments(PaymentId),
    ProcessedByUserId INT NULL REFERENCES Users(UserId),
    Notes NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CollectedAt DATETIME2 NULL
);

CREATE TABLE OrderItems (
    OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL REFERENCES Orders(OrderId) ON DELETE CASCADE,
    ProductId INT NOT NULL REFERENCES Products(ProductId),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPriceLKR DECIMAL(12,2) NOT NULL,
    LineTotalLKR AS (Quantity * UnitPriceLKR) PERSISTED
);

-- ============ PUBLIC WEBSITE CONTENT ============

CREATE TABLE Trainers (
    TrainerId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Title NVARCHAR(100) NULL,
    Bio NVARCHAR(2000) NULL,
    Specializations NVARCHAR(500) NULL,
    PhotoUrl NVARCHAR(500) NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE ContactMessages (
    ContactMessageId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(256) NOT NULL,
    Phone NVARCHAR(20) NULL,
    Subject NVARCHAR(200) NOT NULL,
    Message NVARCHAR(2000) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    SubmittedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE SpecialSessions (
    SessionId INT IDENTITY(1,1) PRIMARY KEY,
    InstructorId INT NOT NULL REFERENCES Instructors(InstructorId) ON DELETE CASCADE,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000) NOT NULL,
    StartDateTime DATETIME2 NOT NULL,
    EndDateTime DATETIME2 NOT NULL,
    FeePerPersonLKR DECIMAL(12,2) NOT NULL,
    MaxParticipants INT NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    RejectionReason NVARCHAR(1000) NULL,
    ReviewedByUserId INT NULL REFERENCES Users(UserId),
    ReviewedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE SpecialSessionEnrollments (
    EnrollmentId INT IDENTITY(1,1) PRIMARY KEY,
    SessionId INT NOT NULL REFERENCES SpecialSessions(SessionId) ON DELETE CASCADE,
    MemberId INT NOT NULL REFERENCES Members(MemberId),
    PaymentId INT NOT NULL REFERENCES Payments(PaymentId),
    EnrolledAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_SpecialSessionEnrollments_Session_Member UNIQUE (SessionId, MemberId)
);

CREATE TABLE MemberFitnessPlans (
    PlanId INT IDENTITY(1,1) PRIMARY KEY,
    RequestId INT NULL,
    MemberId INT NOT NULL REFERENCES Members(MemberId),
    InstructorId INT NOT NULL REFERENCES Instructors(InstructorId),
    PlanCategory NVARCHAR(50) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_MemberFitnessPlans_MemberId_UpdatedAt ON MemberFitnessPlans(MemberId, UpdatedAt);

CREATE TABLE MemberPlanRequests (
    RequestId INT IDENTITY(1,1) PRIMARY KEY,
    MemberId INT NOT NULL REFERENCES Members(MemberId),
    InstructorId INT NOT NULL REFERENCES Instructors(InstructorId),
    PlanCategory NVARCHAR(50) NOT NULL,
    MemberNote NVARCHAR(MAX) NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    PlanId INT NULL REFERENCES MemberFitnessPlans(PlanId),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ApprovedAt DATETIME2 NULL
);
CREATE INDEX IX_MemberPlanRequests_InstructorId_Status ON MemberPlanRequests(InstructorId, Status);

ALTER TABLE MemberFitnessPlans
    ADD CONSTRAINT FK_MemberFitnessPlans_MemberPlanRequests_RequestId
    FOREIGN KEY (RequestId) REFERENCES MemberPlanRequests(RequestId);

-- ============ INDEXES ============

CREATE INDEX IX_Memberships_MemberId ON Memberships(MemberId);
CREATE INDEX IX_Payments_MemberId ON Payments(MemberId);
CREATE INDEX IX_AttendanceLogs_LoggedAt ON AttendanceLogs(LoggedAt);
CREATE INDEX IX_AttendanceLogs_MemberId ON AttendanceLogs(MemberId);
CREATE INDEX IX_Orders_MemberId ON Orders(MemberId);
CREATE INDEX IX_Orders_OrderReference ON Orders(OrderReference);
GO
