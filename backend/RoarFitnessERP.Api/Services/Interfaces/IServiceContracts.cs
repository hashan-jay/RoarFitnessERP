using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;

namespace RoarFitnessERP.Api.Services.Interfaces;

/// <summary>Login outcome distinguishing invalid credentials from pending activation.</summary>
public record AuthLoginResult(LoginResponse? Response, bool IsPendingActivation);

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
    Task ActivateMembershipAfterPaymentAsync(int memberId, int packageId, Payment payment);
    Task<MemberProfileDto?> GetProfileAsync(int userId);
    Task<InstructorProfileDto?> GetInstructorProfileAsync(int userId);
    Task<bool> UpdateMemberProfileAsync(int userId, UpdateProfileRequest request);
    Task<bool> UpdateInstructorProfileAsync(int userId, UpdateProfileRequest request);
    Task<string?> UploadMemberProfilePhotoAsync(int userId, IFormFile file, IWebHostEnvironment env);
    Task<string?> UploadInstructorProfilePhotoAsync(int userId, IFormFile file, IWebHostEnvironment env);
    Task<IReadOnlyList<PackageDto>> GetPackagesAsync();
    Task<IReadOnlyList<PackageDto>> GetAllPackagesAdminAsync();
    Task<IReadOnlyList<PackageTypeDto>> GetPackageTypesAsync();
    Task<PackageDto?> CreatePackageAsync(CreatePackageRequest request);
    Task<PackageDto?> UpdatePackageAsync(int packageId, UpdatePackageRequest request);
    Task<bool> DeletePackageAsync(int packageId);
    Task<IReadOnlyList<object>> ListMembersAsync();
    Task<IReadOnlyList<object>> ListInstructorsAsync();
}

/// <summary>PayHere checkout initialization, confirmation, and webhook handling.</summary>
public interface IPaymentGatewayService
{
    Task<PaymentInitResponse> InitMembershipPaymentAsync(PaymentInitRequest request, int? memberId, int packageId);
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
}

/// <summary>Instructor session requests, admin review, and member enrollment.</summary>
public interface ISpecialSessionService
{
    Task<SpecialSessionDto?> CreateRequestAsync(int userId, CreateSpecialSessionRequest request);
    Task<IReadOnlyList<SpecialSessionDto>> GetInstructorSessionsAsync(int userId);
    Task<IReadOnlyList<SpecialSessionDto>> GetAdminSessionsAsync(string? status = null);
    Task<IReadOnlyList<SpecialSessionDto>> GetAcceptedCalendarSessionsAsync();
    Task<SpecialSessionDto?> GetSessionDetailAsync(int sessionId);
    Task<SpecialSessionDto?> AcceptSessionAsync(int sessionId, int adminUserId);
    Task<SpecialSessionDto?> RejectSessionAsync(int sessionId, int adminUserId, ReviewSpecialSessionRequest request);
    Task<IReadOnlyList<SpecialSessionDto>> GetAvailableSessionsForMemberAsync(int userId);
    Task<IReadOnlyList<SpecialSessionDto>> GetMemberEnrollmentsAsync(int userId);
    Task<(int memberId, decimal amount)?> PrepareEnrollmentPaymentAsync(int userId, int sessionId);
    Task<bool> CompleteEnrollmentAfterPaymentAsync(int memberId, int sessionId, Payment payment);
    Task<int?> GetMemberIdForUserAsync(int userId);
}

/// <summary>Personalized workout and meal plans managed by instructors for members.</summary>
public interface IMemberPlanService
{
    Task<IReadOnlyList<MemberPlanMemberOptionDto>> GetMembersForPlanningAsync();
    Task<IReadOnlyList<MemberFitnessPlanSummaryDto>> GetInstructorPlansAsync(int userId);
    Task<MemberFitnessPlanDto?> CreatePlanAsync(int userId, CreateMemberFitnessPlanRequest request);
    Task<MemberFitnessPlanDto?> UpdatePlanAsync(int userId, int planId, UpdateMemberFitnessPlanRequest request);
    Task<bool> DeletePlanAsync(int userId, int planId);
    Task<MemberFitnessPlanDto?> GetPlanForInstructorAsync(int userId, int planId);
    Task<IReadOnlyList<MemberFitnessPlanSummaryDto>> GetMemberPlansAsync(int userId);
    Task<MemberFitnessPlanDto?> GetPlanForMemberAsync(int userId, int planId);
}
