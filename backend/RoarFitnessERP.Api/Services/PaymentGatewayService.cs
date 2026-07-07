using Microsoft.EntityFrameworkCore;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Services;

/// <summary>PayHere payment initialization, confirmation, and IPN webhook processing.</summary>
public class PaymentGatewayService(
    AppDbContext db,
    IConfiguration config,
    IMembershipService membershipService,
    ISpecialSessionService sessionService) : IPaymentGatewayService
{
    public async Task<PaymentInitResponse> InitMembershipPaymentAsync(PaymentInitRequest request, int? memberId, int packageId)
    {
        var method = await db.PaymentMethods.FirstAsync(m => m.MethodName == "PayHere");
        var status = await db.PaymentStatuses.FirstAsync(s => s.StatusName == "Pending");

        var payment = new Payment
        {
            PaymentReference = GenerateReference("PAY"),
            MemberId = memberId,
            PaymentMethodId = method.PaymentMethodId,
            PaymentStatusId = status.PaymentStatusId,
            AmountLKR = request.AmountLKR,
            PaymentPurpose = "Membership"
        };

        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        return BuildCheckoutResponse(payment.PaymentReference, request.AmountLKR, "Roar Membership", packageId, memberId);
    }

    public async Task<PaymentInitResponse> InitMembershipRenewalPaymentAsync(PaymentInitRequest request, int memberId, int packageId)
    {
        var method = await db.PaymentMethods.FirstAsync(m => m.MethodName == "PayHere");
        var status = await db.PaymentStatuses.FirstAsync(s => s.StatusName == "Pending");

        var payment = new Payment
        {
            PaymentReference = GenerateReference("PAY"),
            MemberId = memberId,
            PaymentMethodId = method.PaymentMethodId,
            PaymentStatusId = status.PaymentStatusId,
            AmountLKR = request.AmountLKR,
            PaymentPurpose = "Membership"
        };

        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        return BuildCheckoutResponse(
            payment.PaymentReference,
            request.AmountLKR,
            "Roar Membership Renewal",
            packageId,
            memberId,
            purpose: "renew");
    }

    public async Task<PaymentInitResponse> InitSessionPaymentAsync(int sessionId, int userId)
    {
        var prepared = await sessionService.PrepareEnrollmentPaymentAsync(userId, sessionId);
        if (prepared is null)
            throw new InvalidOperationException("Member not found.");

        var (memberId, amount) = prepared.Value;
        var method = await db.PaymentMethods.FirstAsync(m => m.MethodName == "PayHere");
        var status = await db.PaymentStatuses.FirstAsync(s => s.StatusName == "Pending");

        var payment = new Payment
        {
            PaymentReference = GenerateReference("PAY"),
            MemberId = memberId,
            PaymentMethodId = method.PaymentMethodId,
            PaymentStatusId = status.PaymentStatusId,
            AmountLKR = amount,
            PaymentPurpose = "SpecialSession"
        };

        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        return BuildCheckoutResponse(
            payment.PaymentReference,
            amount,
            "Roar Special Session",
            sessionId,
            memberId,
            purpose: "session");
    }

    public async Task<bool> ConfirmSessionPaymentAsync(PaymentConfirmRequest request, int sessionId)
    {
        var payment = await db.Payments.FirstOrDefaultAsync(p => p.PaymentReference == request.PaymentReference);
        if (payment is null || !payment.MemberId.HasValue)
            return false;

        await CompletePaymentAsync(payment, request.GatewayTransactionId);
        return await sessionService.CompleteEnrollmentAfterPaymentAsync(
            payment.MemberId.Value,
            sessionId,
            payment);
    }

    public async Task<bool> ConfirmMembershipPaymentAsync(PaymentConfirmRequest request, int packageId)
    {
        var payment = await db.Payments.FirstOrDefaultAsync(p => p.PaymentReference == request.PaymentReference);
        if (payment is null) return false;

        await CompletePaymentAsync(payment, request.GatewayTransactionId);

        if (payment.MemberId.HasValue)
            await membershipService.ActivateMembershipAfterPaymentAsync(payment.MemberId.Value, packageId, payment);

        return true;
    }

    /// <summary>
    /// PayHere server-to-server callback — idempotent completion via PaymentReference (order_id).
    /// custom_1 carries packageId or sessionId depending on PaymentPurpose.
    /// </summary>
    public async Task<bool> ProcessPayHereWebhookAsync(IFormCollection form)
    {
        var orderId = form["order_id"].ToString();
        var payment = await db.Payments.FirstOrDefaultAsync(p => p.PaymentReference == orderId);
        if (payment is null) return false;

        var packageId = int.TryParse(form["custom_1"], out var pid) ? pid : 0;

        await CompletePaymentAsync(payment, form["payment_id"].ToString());

        if (payment.PaymentPurpose == "Membership" && payment.MemberId.HasValue && packageId > 0)
            await membershipService.ActivateMembershipAfterPaymentAsync(payment.MemberId.Value, packageId, payment);
        else if (payment.PaymentPurpose == "SpecialSession" && payment.MemberId.HasValue && packageId > 0)
            await sessionService.CompleteEnrollmentAfterPaymentAsync(payment.MemberId.Value, packageId, payment);

        return true;
    }

    /// <summary>Marks payment Completed and triggers membership or session enrollment side effects.</summary>
    private async Task CompletePaymentAsync(Payment payment, string gatewayTransactionId)
    {
        var completed = await db.PaymentStatuses.FirstAsync(s => s.StatusName == "Completed");
        payment.PaymentStatusId = completed.PaymentStatusId;
        payment.GatewayTransactionId = gatewayTransactionId;
        payment.PaidAt = AppTime.Now();
        await db.SaveChangesAsync();
    }

    private PaymentInitResponse BuildCheckoutResponse(
        string reference,
        decimal amount,
        string itemName,
        int contextId,
        int? memberId = null,
        string? purpose = null)
    {
        if (config.GetValue<bool>("Payment:UseMockGateway"))
        {
            var baseUrl = config["Payment:MockCheckoutBaseUrl"] ?? "http://localhost:5173/payment/mock";
            var query = new List<string>
            {
                $"ref={Uri.EscapeDataString(reference)}",
                $"amount={amount:F2}",
                $"item={Uri.EscapeDataString(itemName)}"
            };

            if (purpose == "session")
            {
                query.Add($"sessionId={contextId}");
                query.Add("purpose=session");
            }
            else if (purpose == "renew")
            {
                query.Add($"packageId={contextId}");
                query.Add("purpose=renew");
            }
            else
            {
                query.Add($"packageId={contextId}");
            }

            if (memberId.HasValue)
                query.Add($"memberId={memberId.Value}");

            return new PaymentInitResponse(reference, $"{baseUrl}?{string.Join('&', query)}", "MOCK");
        }

        var merchantId = config["PayHere:MerchantId"] ?? "1212345";
        var payHereItem = itemName.Replace(' ', '+');
        var checkoutUrl = $"{config["PayHere:SandboxUrl"]}?merchant_id={merchantId}&order_id={reference}&amount={amount:F2}&currency=LKR&items={payHereItem}&custom_1={contextId}";
        return new PaymentInitResponse(reference, checkoutUrl, merchantId);
    }

    private static string GenerateReference(string prefix) =>
        $"{prefix}-{Guid.NewGuid():N}"[..20].ToUpperInvariant();
}

