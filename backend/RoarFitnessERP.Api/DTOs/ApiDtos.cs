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
    DateTime? DateOfBirth,
    string? Gender = null,
    string? AddressLine1 = null,
    string? City = null,
    string? Country = null,
    string? EmergencyContactName = null,
    string? EmergencyContactPhone = null,
    string? Bio = null,
    int? YearsExperience = null,
    string? Qualification1 = null,
    string? Qualification2 = null,
    string? Speciality1 = null,
    string? Speciality2 = null,
    string? Speciality3 = null);

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

public record MemberAttendanceEntryDto(
    long AttendanceLogId,
    DateTime LoggedAt,
    bool AccessGranted,
    string? ValidationMessage);

public record AdminMemberAttendanceLogDto(
    long AttendanceLogId,
    DateTime LoggedAt,
    bool AccessGranted,
    string? ValidationMessage,
    int MemberId,
    string MemberIdentificationNumber,
    string MemberName);

public record AdminAttendanceLogDto(
    long AttendanceLogId,
    DateTime LoggedAt,
    bool AccessGranted,
    string? ValidationMessage,
    string PersonType,
    string? IdentificationNumber,
    string PersonName);

public record ActivateFingerprintRequest(int MemberId, string FingerprintTemplateId);
public record ActivateInstructorFingerprintRequest(int InstructorId, string FingerprintTemplateId);

public record EnrolledFingerprintDto(
    string FingerprintTemplateId,
    string PersonName,
    string PersonType,
    int? MemberId,
    int? InstructorId,
    string IdentificationNumber,
    bool HasActiveMembership);

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
    decimal TotalMembershipInGymCashRevenue,
    decimal TotalMembershipInGymCardRevenue,
    decimal TotalMembershipGatewayRevenue,
    decimal TotalPosCashRevenue,
    decimal TotalPosCardRevenue,
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
    decimal Total,
    decimal MembershipInGymCash,
    decimal MembershipInGymCard,
    decimal MembershipGateway,
    decimal PosCash,
    decimal PosCard,
    decimal SessionGateway);

public record MonthlyReportDto(
    int Year,
    int Month,
    string MonthLabel,
    decimal MembershipInGymCashRevenue,
    decimal MembershipInGymCardRevenue,
    decimal MembershipGatewayRevenue,
    decimal PosCashRevenue,
    decimal PosCardRevenue,
    decimal SessionGatewayRevenue,
    decimal TotalRevenue,
    IReadOnlyList<DailyRevenueDto> DailyRevenue,
    IReadOnlyList<SoldItemReportDto> SoldItems,
    IReadOnlyList<RecentTransactionDto> RecentTransactions);

public record MemberRenewSearchItemDto(
    int MemberId,
    string IdentificationNumber,
    string FullName,
    string? Phone,
    string? NicNumber,
    bool HasActiveMembership,
    DateTime? CurrentMembershipEndDate,
    DateTime? MembershipExpiredDate,
    DateTime? QueuedMembershipStartDate,
    bool IsFingerprintActivated);

public record AdminMembershipRenewRequest(int PackageId, string PaymentMethod);

public record MembershipRenewBillDto(
    string BillReference,
    string PaymentReference,
    string MemberName,
    string IdentificationNumber,
    string? Phone,
    string? NicNumber,
    string PackageName,
    int DurationDays,
    decimal AmountLKR,
    string PaymentMethod,
    DateTime SaleDate,
    DateTime MembershipStartDate,
    DateTime MembershipEndDate);

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
    bool IsFingerprintActivated,
    DateTime? FingerprintActivatedAt,
    bool HasActiveMembership,
    DateTime? MembershipStartDate,
    DateTime? MembershipEndDate,
    string? ActivePackageName,
    string? QueuedPackageName,
    DateTime? QueuedMembershipStartDate,
    DateTime? QueuedMembershipEndDate);

public record AdminMemberListItemDto(
    int MemberId,
    string IdentificationNumber,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string? Phone,
    string? NicNumber,
    string? EmergencyContactName,
    string? EmergencyContactPhone,
    bool IsFingerprintActivated,
    bool IsAccountActive,
    bool IsTerminated,
    DateTime? TerminatedAt,
    bool HasActiveMembership,
    DateTime? MembershipStartDate,
    DateTime? MembershipEndDate,
    string? ActivePackageName,
    DateTime? DateOfBirth,
    string? Gender,
    string? AddressLine1,
    string? City,
    string? Country);

public record AdminUpdateMemberAccountRequest(
    string FirstName,
    string LastName,
    string Email,
    string? NicNumber,
    string? Password,
    bool MemberPermissionConfirmed);

public record AdminInstructorListItemDto(
    int InstructorId,
    string IdentificationNumber,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string? Phone,
    string? NicNumber,
    DateTime? DateOfBirth,
    string? Specialization,
    string? AddressLine1,
    string? Country,
    int YearsExperience,
    string? Qualification1,
    string? Qualification2,
    string? Speciality1,
    string? Speciality2,
    string? Speciality3,
    string? ProfilePhotoUrl,
    bool IsFingerprintActivated,
    bool IsAccountActive,
    bool IsTerminated,
    DateTime? TerminatedAt,
    DateTime? HireDate);

public record AdminUpdateInstructorAccountRequest(
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? NicNumber,
    DateTime? DateOfBirth,
    string? Specialization,
    string? AddressLine1,
    string? Country,
    int YearsExperience,
    string? Qualification1,
    string? Qualification2,
    string? Speciality1,
    string? Speciality2,
    string? Speciality3,
    string? Password,
    bool InstructorPermissionConfirmed);

public record PublicInstructorDto(
    int InstructorId,
    string FullName,
    string Role,
    int YearsExperience,
    string? Qualification1,
    string? Qualification2,
    string? Speciality1,
    string? Speciality2,
    string? Speciality3,
    string? PhotoUrl);

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
    string? Bio,
    string? AddressLine1,
    string? City,
    string? Country,
    int YearsExperience,
    string? Qualification1,
    string? Qualification2,
    string? Speciality1,
    string? Speciality2,
    string? Speciality3,
    string? ProfilePhotoUrl,
    DateTime? HireDate,
    bool IsFingerprintActivated);

public record UpdateProfileRequest(
    string? Phone,
    string? AddressLine1,
    string? City,
    string? Country,
    string? EmergencyContactName,
    string? EmergencyContactPhone,
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
public record ContactRequest(string FullName, string Email, string? Phone, string? Subject, string Message);

public record VisitorInquiryDto(
    int InquiryId,
    string FullName,
    string Email,
    string? Phone,
    string Message,
    DateTime SubmittedAt);
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

public record PlanInstructorOptionDto(
    int InstructorId,
    string FullName,
    string? Specialization);

public record MemberPlanRequestDto(
    int RequestId,
    int MemberId,
    string MemberName,
    string MemberIdentificationNumber,
    int InstructorId,
    string InstructorName,
    string PlanCategory,
    string? MemberNote,
    string Status,
    DateTime CreatedAt,
    DateTime? ApprovedAt,
    int? PlanId);

public record CreateMemberPlanRequest(
    int InstructorId,
    string PlanCategory,
    string? MemberNote);

public record ApproveMemberPlanRequest(
    string Description,
    string? Notes);

public record MemberFitnessPlanDto(
    int PlanId,
    int? RequestId,
    int MemberId,
    string MemberName,
    string MemberIdentificationNumber,
    int InstructorId,
    string InstructorName,
    string PlanCategory,
    string Description,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record MemberFitnessPlanSummaryDto(
    int PlanId,
    int MemberId,
    string MemberName,
    string MemberIdentificationNumber,
    string InstructorName,
    string PlanCategory,
    DateTime UpdatedAt);

public record PublicGeneralClassDto(
    int GeneralClassId,
    string Title,
    string Category,
    string Description,
    int InstructorId,
    string InstructorName,
    string InstructorRole,
    string? InstructorPhotoUrl,
    int Weekday,
    string TimeRange,
    string Duration,
    string Studio);

public record PublicVipSessionDto(
    int SessionId,
    string Title,
    string Description,
    DateTime StartDateTime,
    DateTime EndDateTime,
    decimal FeePerPersonLKR,
    int MaxParticipants,
    int EnrolledCount,
    int SpotsRemaining,
    string InstructorName,
    int InstructorId);

public record AdminGeneralClassDto(
    int GeneralClassId,
    string Title,
    string Category,
    string Description,
    int InstructorId,
    string InstructorName,
    string InstructorRole,
    string? InstructorPhotoUrl,
    int Weekday,
    string TimeRange,
    string Duration,
    string Studio,
    bool IsActive,
    DateTime UpdatedAt);

public record CreateGeneralClassRequest(
    string Title,
    string Category,
    string Description,
    int InstructorId,
    int Weekday,
    string TimeRange,
    string Duration,
    string Studio);

public record UpdateGeneralClassRequest(
    string Title,
    string Category,
    string Description,
    int InstructorId,
    int Weekday,
    string TimeRange,
    string Duration,
    string Studio,
    bool IsActive);
