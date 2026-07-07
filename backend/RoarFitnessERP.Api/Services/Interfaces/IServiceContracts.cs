using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;

namespace RoarFitnessERP.Api.Services.Interfaces;

/// <summary>Login outcome distinguishing invalid credentials from pending activation or termination.</summary>
public record AuthLoginResult(LoginResponse? Response, bool IsPendingActivation, bool IsTerminated = false);

/// <summary>Authenticates users and issues JWT bearer tokens.</summary>
public interface IAuthenticationService
{
    Task<AuthLoginResult> LoginAsync(LoginRequest request);
    Task<User?> GetUserWithRolesAsync(int userId);
    string GenerateToken(User user, IEnumerable<string> roles);
}

/// <summary>Member and instructor registration, profiles, and package management.</summary>
public interface IMembershipService
{
    Task<(User user, Member member)?> RegisterOnlineAsync(RegisterMemberRequest request);
    Task<(User user, Member member)?> CreateMemberByAdminAsync(CreateUserByAdminRequest request);
    Task<(User user, Instructor instructor)?> CreateInstructorByAdminAsync(CreateUserByAdminRequest request);
    Task<Membership> ActivateMembershipAfterPaymentAsync(int memberId, int packageId, Payment payment);
    Task<MemberProfileDto?> GetProfileAsync(int userId);
    Task<InstructorProfileDto?> GetInstructorProfileAsync(int userId);
    Task<bool> UpdateMemberProfileAsync(int userId, UpdateProfileRequest request);
    Task<bool> UpdateInstructorProfileAsync(int userId, UpdateProfileRequest request);
    Task<IReadOnlyList<PackageDto>> GetPackagesAsync();
    Task<IReadOnlyList<PackageDto>> GetAllPackagesAdminAsync();
    Task<IReadOnlyList<PackageTypeDto>> GetPackageTypesAsync();
    Task<PackageDto?> CreatePackageAsync(CreatePackageRequest request);
    Task<PackageDto?> UpdatePackageAsync(int packageId, UpdatePackageRequest request);
    Task<bool> DeletePackageAsync(int packageId);
    Task<IReadOnlyList<AdminMemberListItemDto>> ListMembersForAdminAsync(string? section = null);
    Task<bool> UpdateMemberAccountByAdminAsync(int memberId, AdminUpdateMemberAccountRequest request);
    Task<bool> TerminateMemberAsync(int memberId);
    Task<bool> ReinstateMemberAsync(int memberId);
    Task<IReadOnlyList<MemberRenewSearchItemDto>> SearchMembersForRenewalAsync(string query);
    Task<MembershipRenewBillDto?> RenewMembershipInGymAsync(int memberId, AdminMembershipRenewRequest request);
    Task<IReadOnlyList<AdminInstructorListItemDto>> ListInstructorsForAdminAsync(string? section = null);
    Task<bool> UpdateInstructorAccountByAdminAsync(int instructorId, AdminUpdateInstructorAccountRequest request);
    Task<bool> TerminateInstructorAsync(int instructorId);
    Task<bool> ReinstateInstructorAsync(int instructorId);
    Task<IReadOnlyList<PublicInstructorDto>> GetPublicInstructorsAsync();
    Task<string?> UploadInstructorPhotoAsync(int instructorId, IFormFile file);
}

/// <summary>PayHere checkout initialization, confirmation, and webhook handling.</summary>
public interface IPaymentGatewayService
{
    Task<PaymentInitResponse> InitMembershipPaymentAsync(PaymentInitRequest request, int? memberId, int packageId);
    Task<PaymentInitResponse> InitMembershipRenewalPaymentAsync(PaymentInitRequest request, int memberId, int packageId);
    Task<PaymentInitResponse> InitSessionPaymentAsync(int sessionId, int userId);
    Task<bool> ConfirmMembershipPaymentAsync(PaymentConfirmRequest request, int packageId);
    Task<bool> ConfirmSessionPaymentAsync(PaymentConfirmRequest request, int sessionId);
    Task<bool> ProcessPayHereWebhookAsync(IFormCollection form);
}

/// <summary>Fingerprint scan validation, activation, and attendance log queries.</summary>
public interface IAttendanceService
{
    Task<FingerprintScanResponse> ProcessScanAsync(FingerprintScanRequest request);
    Task<bool> ActivateMemberFingerprintAsync(ActivateFingerprintRequest request);
    Task<bool> ActivateInstructorFingerprintAsync(ActivateInstructorFingerprintRequest request);
    Task<IReadOnlyList<AttendanceLogDto>> GetTodayLogsAsync();
    Task<IReadOnlyList<AdminMemberAttendanceLogDto>> GetMemberLogsByDateAsync(DateTime colomboDate);
    Task<IReadOnlyList<AdminAttendanceLogDto>> GetAdminLogsByDateAsync(DateTime colomboDate, string filter);
    Task<IReadOnlyList<MemberAttendanceEntryDto>> GetMemberLogsForMonthAsync(int userId, int year, int month);
    Task<IReadOnlyList<MemberAttendanceEntryDto>> GetInstructorLogsForMonthAsync(int userId, int year, int month);
    Task<IReadOnlyList<MemberAttendanceEntryDto>> GetPersonLogsForMonthAsync(int userId, int year, int month);
    Task<IReadOnlyList<EnrolledFingerprintDto>> GetEnrolledFingerprintsAsync();
}

/// <summary>Product catalog CRUD and audited stock adjustments.</summary>
public interface IInventoryService
{
    Task<IReadOnlyList<ProductDto>> GetAllAsync();
    Task<IReadOnlyList<ProductCategoryDto>> GetCategoriesAsync();
    Task<ProductDto?> CreateProductAsync(int userId, CreateProductRequest request);
    Task<ProductDto?> UpdateProductAsync(int productId, UpdateProductRequest request);
    Task<bool> DeleteProductAsync(int productId);
    Task<bool> ClearStockAsync(int userId, int productId, ClearStockRequest request);
    Task<bool> AdjustAsync(int userId, InventoryAdjustRequest request);
}

/// <summary>In-gym point-of-sale transactions with immediate payment.</summary>
public interface IPosService
{
    Task<PosSaleResponse?> CreateInGymSaleAsync(PosSaleRequest request, int processedByUserId);
}

/// <summary>Revenue summaries, monthly reports, and sold-item analytics.</summary>
public interface IReportService
{
    Task<ReportSummaryDto> GetSummaryAsync();
    Task<MonthlyReportDto> GetMonthlyReportAsync(int year, int month);
}

/// <summary>Public website content: trainer profiles and contact submissions.</summary>
public interface IPublicContentService
{
    Task<IReadOnlyList<TrainerDto>> GetTrainersAsync();
    Task SubmitContactAsync(ContactRequest request);
    Task<IReadOnlyList<VisitorInquiryDto>> GetVisitorInquiriesAsync();
}

/// <summary>Instructor session requests, admin review, and member enrollment.</summary>
public interface ISpecialSessionService
{
    Task<SpecialSessionDto?> CreateRequestAsync(int userId, CreateSpecialSessionRequest request);
    Task<IReadOnlyList<SpecialSessionDto>> GetInstructorSessionsAsync(int userId);
    Task<IReadOnlyList<SpecialSessionDto>> GetAdminSessionsAsync(string? status = null);
    Task<IReadOnlyList<SpecialSessionDto>> GetAcceptedCalendarSessionsAsync();
    Task<IReadOnlyList<PublicVipSessionDto>> GetPublicAcceptedSessionsForDateAsync(DateTime colomboDate);
    Task<SpecialSessionDto?> GetSessionDetailAsync(int sessionId);
    Task<SpecialSessionDto?> AcceptSessionAsync(int sessionId, int adminUserId);
    Task<SpecialSessionDto?> RejectSessionAsync(int sessionId, int adminUserId, ReviewSpecialSessionRequest request);
    Task<IReadOnlyList<SpecialSessionDto>> GetAvailableSessionsForMemberAsync(int userId);
    Task<IReadOnlyList<SpecialSessionDto>> GetMemberEnrollmentsAsync(int userId);
    Task<(int memberId, decimal amount)?> PrepareEnrollmentPaymentAsync(int userId, int sessionId);
    Task<bool> CompleteEnrollmentAfterPaymentAsync(int memberId, int sessionId, Payment payment);
    Task<int?> GetMemberIdForUserAsync(int userId);
}

/// <summary>Member plan requests and instructor-approved workout/meal plans.</summary>
public interface IMemberPlanService
{
    Task<IReadOnlyList<PlanInstructorOptionDto>> GetInstructorsForPlanningAsync();
    Task<MemberPlanRequestDto?> CreatePlanRequestAsync(int userId, CreateMemberPlanRequest request);
    Task<IReadOnlyList<MemberPlanRequestDto>> GetMemberPendingRequestsAsync(int userId);
    Task<IReadOnlyList<MemberPlanRequestDto>> GetPendingRequestsAsync(int userId);
    Task<MemberFitnessPlanDto?> ApprovePlanRequestAsync(int userId, int requestId, ApproveMemberPlanRequest request);
    Task<IReadOnlyList<MemberFitnessPlanSummaryDto>> GetMemberPlansAsync(int userId);
    Task<IReadOnlyList<MemberFitnessPlanSummaryDto>> GetInstructorPlansAsync(int userId);
    Task<MemberFitnessPlanDto?> GetPlanForMemberAsync(int userId, int planId);
    Task<MemberFitnessPlanDto?> GetPlanForInstructorAsync(int userId, int planId);
}

public interface IGeneralClassService
{
    Task<IReadOnlyList<PublicGeneralClassDto>> GetPublicAsync();
    Task<IReadOnlyList<PublicGeneralClassDto>> GetForInstructorAsync(int userId);
    Task<IReadOnlyList<AdminGeneralClassDto>> GetAdminListAsync();
    Task<AdminGeneralClassDto?> CreateAsync(CreateGeneralClassRequest request);
    Task<AdminGeneralClassDto?> UpdateAsync(int generalClassId, UpdateGeneralClassRequest request);
    Task<bool> DeleteAsync(int generalClassId);
}
