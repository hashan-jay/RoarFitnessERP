namespace RoarFitnessERP.Api.DTOs;

/// <summary>Request and response records exchanged between API controllers and services.</summary>

// --- Authentication and registration ---
public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string Email, string FullName, IReadOnlyList<string> Roles, int UserId);

public record RegisterMemberRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? Phone,
    int PackageId,
    string? NicNumber,
    DateTime? DateOfBirth,
    string? Gender,
    string? AddressLine1,
    string? City,
    string? EmergencyContactName,
    string? EmergencyContactPhone);

// --- Payment gateway DTOs ---
public record PaymentInitRequest(decimal AmountLKR, string? Email);
public record PaymentInitResponse(string PaymentReference, string CheckoutUrl, string MerchantId);

public record CreateUserByAdminRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? Phone,
    string Role,
    int? PackageId,
    string? Specialization,
    string? NicNumber,
    DateTime? DateOfBirth);

public record PaymentConfirmRequest(string PaymentReference, string GatewayTransactionId);

public record FingerprintScanRequest(string FingerprintTemplateId, string? ScannerDeviceId);

public record FingerprintScanResponse(
    bool AccessGranted,
    string Message,
    string? PersonName,
    string? PersonType,
    DateTime LoggedAt);

public record AttendanceLogDto(
    long AttendanceLogId,
    DateTime LoggedAt,
    bool AccessGranted,
    string? ValidationMessage,
    string? MemberName,
    string? InstructorName,
    string PersonType);

public record ActivateFingerprintRequest(int MemberId, string FingerprintTemplateId);
public record ActivateInstructorFingerprintRequest(int InstructorId, string FingerprintTemplateId);

public record ProductDto(
    int ProductId,
    string SKU,
    string ProductName,
    string? Description,
    decimal UnitPriceLKR,
    int QuantityOnHand,
    string CategoryName,
    int CategoryId = 0,
    int ReorderLevel = 5,
    bool IsActive = true,
    string? ImageUrl = null);

public record ProductCategoryDto(int CategoryId, string CategoryName);

public record CreateProductRequest(
    int CategoryId,
    string SKU,
    string ProductName,
    string? Description,
    decimal UnitPriceLKR,
    int InitialQuantity,
    int ReorderLevel,
    string? ImageUrl);

public record UpdateProductRequest(
    int CategoryId,
    string SKU,
    string ProductName,
    string? Description,
    decimal UnitPriceLKR,
    int ReorderLevel,
    bool IsActive,
    string? ImageUrl);

public record ClearStockRequest(string Reason);

// --- POS order DTOs ---
public record OrderDto(
    int OrderId,
    string OrderReference,
    string Status,
    decimal TotalLKR,
    string OrderChannel,
    DateTime CreatedAt,
    IReadOnlyList<OrderItemDto> Items,
    string? BillReference = null);

public record PosBillLineDto(
    string ProductName,
    string SKU,
    int Quantity,
    decimal UnitPriceLKR,
    decimal LineTotal);

public record PosBillDto(
    string BillReference,
    string OrderReference,
    string PaymentReference,
    string PaymentMethod,
    decimal SubtotalLKR,
    decimal TotalLKR,
    DateTime SaleDate,
    IReadOnlyList<PosBillLineDto> Items);

public record PosSaleResponse(OrderDto Order, PosBillDto Bill);

public record OrderLineRequest(int ProductId, int Quantity);

public record PosSaleRequest(IReadOnlyList<OrderLineRequest> Items, string PaymentMethod, int? MemberId);

public record OrderItemDto(string ProductName, int Quantity, decimal UnitPriceLKR, decimal LineTotal);

public record InventoryAdjustRequest(int ProductId, int QuantityChange, string Reason);

// --- Report DTOs ---
public record ReportSummaryDto(
    decimal TotalMembershipInGymRevenue,
    decimal TotalMembershipGatewayRevenue,
    decimal TotalPosRevenue,
    decimal TotalSessionGatewayRevenue,
    decimal TotalRevenue,
    decimal ThisMonthRevenue,
    int TotalMembers,
    int ActiveMembers,
    int LowStockItems,
    IReadOnlyList<DailyRevenueDto> DailyRevenue,
    IReadOnlyList<RecentTransactionDto> RecentTransactions);

public record RecentTransactionDto(
    int TransactionId,
    string Reference,
    string Category,
    string Description,
    decimal AmountLKR,
    DateTime TransactionDate,
    string Status);

public record DailyRevenueDto(
    DateTime Date,
    decimal MembershipInGym,
    decimal MembershipGateway,
    decimal Pos,
    decimal Session);

public record MonthlyReportDto(
    int Year,
    int Month,
    string MonthLabel,
    decimal MembershipInGymRevenue,
    decimal MembershipGatewayRevenue,
    decimal PosRevenue,
    decimal SessionGatewayRevenue,
    decimal TotalRevenue,
    IReadOnlyList<SoldItemReportDto> SoldItems,
    IReadOnlyList<RecentTransactionDto> RecentTransactions);

public record SoldItemReportDto(
    string ProductName,
    string SKU,
    int QuantitySold,
    decimal RevenueLKR,
    string Channel);

public record MemberProfileDto(
    int MemberId,
    string IdentificationNumber,
    string FullName,
    string Email,
    string? Phone,
    string? NicNumber,
    DateTime? DateOfBirth,
    int? Age,
    string? Gender,
    string? AddressLine1,
    string? City,
    string? Country,
    string? EmergencyContactName,
    string? EmergencyContactPhone,
    string? ProfilePhotoUrl,
    bool IsFingerprintActivated,
    DateTime? FingerprintActivatedAt,
    bool HasActiveMembership,
    DateTime? MembershipEndDate,
    string? ActivePackageName);

public record InstructorProfileDto(
    int InstructorId,
    string IdentificationNumber,
    string FullName,
    string Email,
    string? Phone,
    string? NicNumber,
    DateTime? DateOfBirth,
    int? Age,
    string? Specialization,
    string? AddressLine1,
    string? City,
    string? Country,
    string? EmergencyContactName,
    string? EmergencyContactPhone,
    string? ProfilePhotoUrl,
    bool IsFingerprintActivated);

public record UpdateProfileRequest(
    string? Phone,
    string? AddressLine1,
    string? City,
    string? Country,
    string? EmergencyContactName,
    string? EmergencyContactPhone,
    string? ProfilePhotoUrl,
    DateTime? DateOfBirth);

// --- Membership package DTOs ---
public record PackageDto(
    int PackageId,
    string PackageName,
    string? Description,
    int DurationDays,
    decimal PriceLKR,
    string TypeName,
    string? Amenities = null,
    bool IsActive = true,
    bool IsFeatured = false,
    int PackageTypeId = 0);

public record PackageTypeDto(int PackageTypeId, string TypeName, string? Description);

public record CreatePackageRequest(
    int PackageTypeId,
    string PackageName,
    string? Description,
    string? Amenities,
    int DurationDays,
    decimal PriceLKR,
    bool IsFeatured);

public record UpdatePackageRequest(
    int PackageTypeId,
    string PackageName,
    string? Description,
    string? Amenities,
    int DurationDays,
    decimal PriceLKR,
    bool IsFeatured,
    bool IsActive);

public record TrainerDto(int TrainerId, string FullName, string? Title, string? Bio, string? Specializations);
public record ContactRequest(string FullName, string Email, string? Phone, string Subject, string Message);

public record ProfilePhotoUploadResponse(string ProfilePhotoUrl);

public record CreateSpecialSessionRequest(
    string Title,
    string Description,
    DateTime StartDateTime,
    DateTime EndDateTime,
    decimal FeePerPersonLKR,
    int MaxParticipants);

public record ReviewSpecialSessionRequest(string? RejectionReason);

public record SpecialSessionEnrollmentDto(int MemberId, string MemberName, string Email, DateTime EnrolledAt);

public record SpecialSessionDto(
    int SessionId,
    string Title,
    string Description,
    DateTime StartDateTime,
    DateTime EndDateTime,
    decimal FeePerPersonLKR,
    int MaxParticipants,
    int EnrolledCount,
    int SpotsRemaining,
    string Status,
    string RuntimeStatus,
    bool HasTimeConflict,
    string InstructorName,
    int InstructorId,
    string? RejectionReason,
    DateTime CreatedAt,
    IReadOnlyList<SpecialSessionEnrollmentDto>? Enrollments);

public record MemberPlanMemberOptionDto(
    int MemberId,
    string IdentificationNumber,
    string FullName,
    string Email);

public record MemberFitnessPlanDto(
    int PlanId,
    int MemberId,
    string MemberName,
    string MemberIdentificationNumber,
    int InstructorId,
    string InstructorName,
    string Title,
    string FitnessGoal,
    string WorkoutPlan,
    string MealPlan,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record MemberFitnessPlanSummaryDto(
    int PlanId,
    int MemberId,
    string MemberName,
    string InstructorName,
    string Title,
    string FitnessGoal,
    DateTime UpdatedAt);

public record CreateMemberFitnessPlanRequest(
    int MemberId,
    string Title,
    string FitnessGoal,
    string WorkoutPlan,
    string MealPlan,
    string? Notes);

public record UpdateMemberFitnessPlanRequest(
    string Title,
    string FitnessGoal,
    string WorkoutPlan,
    string MealPlan,
    string? Notes);
