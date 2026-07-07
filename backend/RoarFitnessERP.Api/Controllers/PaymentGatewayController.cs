using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Controllers;

/// <summary>Payment Gateway API — PayHere integration for membership and session payments.</summary>
[ApiController]
[Route("api/payment-gateway")]
[Produces("application/json")]
public class PaymentGatewayController(IPaymentGatewayService paymentGateway, AppDbContext db) : ControllerBase
{    /// <summary>Initialize a PayHere checkout session for membership payment.</summary>
    [HttpPost("membership/init")]
    [ProducesResponseType(typeof(PaymentInitResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaymentInitResponse>> InitMembershipPayment(
        [FromBody] PaymentInitRequest request,
        [FromQuery] int memberId,
        [FromQuery] int packageId)
    {
        var result = await paymentGateway.InitMembershipPaymentAsync(request, memberId, packageId);
        return Ok(result);
    }

    /// <summary>Initialize membership renewal checkout for the logged-in member.</summary>
    [Authorize(Roles = "Member")]
    [HttpPost("membership/renew/init")]
    [ProducesResponseType(typeof(PaymentInitResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PaymentInitResponse>> InitMembershipRenewal(
        [FromBody] PaymentInitRequest request,
        [FromQuery] int packageId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var member = await db.Members.FirstOrDefaultAsync(m => m.UserId == userId);
        if (member is null)
            return BadRequest(new { message = "Member profile not found." });
        if (member.IsTerminated)
            return BadRequest(new { message = "Terminated accounts cannot renew online. Contact the admin desk." });

        var result = await paymentGateway.InitMembershipRenewalPaymentAsync(request, member.MemberId, packageId);
        return Ok(result);
    }

    /// <summary>Confirm membership payment and activate the member account.</summary>
    [HttpPost("membership/confirm")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> ConfirmMembershipPayment(
        [FromBody] PaymentConfirmRequest request,
        [FromQuery] int packageId)
    {
        var ok = await paymentGateway.ConfirmMembershipPaymentAsync(request, packageId);
        return ok
            ? Ok(new { message = "Payment confirmed. Membership activated." })
            : NotFound(new { message = "Payment not found." });
    }

    /// <summary>PayHere IPN webhook — called by PayHere after payment completion.</summary>
    [ApiExplorerSettings(IgnoreApi = true)]
    [HttpPost("webhook/payhere")]
    [Consumes("application/x-www-form-urlencoded", "multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> PayHereWebhook([FromForm] IFormCollection form)
    {
        var ok = await paymentGateway.ProcessPayHereWebhookAsync(form);
        return ok ? Ok() : NotFound();
    }

    /// <summary>Initialize payment for special session enrollment.</summary>
    [Authorize(Roles = "Member")]
    [HttpPost("session/init")]
    [ProducesResponseType(typeof(PaymentInitResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PaymentInitResponse>> InitSessionPayment([FromQuery] int sessionId)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await paymentGateway.InitSessionPaymentAsync(sessionId, userId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Confirm special session payment and enroll the member.</summary>
    [HttpPost("session/confirm")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> ConfirmSessionPayment(
        [FromBody] PaymentConfirmRequest request,
        [FromQuery] int sessionId)
    {
        var ok = await paymentGateway.ConfirmSessionPaymentAsync(request, sessionId);
        return ok
            ? Ok(new { message = "Payment confirmed. You are enrolled in the session." })
            : NotFound(new { message = "Payment not found or enrollment failed." });
    }
}

