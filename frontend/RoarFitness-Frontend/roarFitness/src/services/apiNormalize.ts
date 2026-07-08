import type { PaymentResponse } from '../types/api'

export function normalizePaymentResponse(raw: Record<string, unknown>): PaymentResponse {
  return {
    paymentReference: String(raw.paymentReference ?? raw.PaymentReference ?? ''),
    checkoutUrl: String(raw.checkoutUrl ?? raw.CheckoutUrl ?? ''),
    merchantId: String(raw.merchantId ?? raw.MerchantId ?? ''),
  }
}
