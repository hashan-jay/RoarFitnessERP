/**
 * Payment gateway integration for membership and special-session checkout.
 */
import { api } from './apiClient';
import type { PaymentRequest } from '../types';
import { normalizePaymentResponse } from './apiNormalize';

export const paymentService = {
  initMembershipPayment: async (data: PaymentRequest, memberId: number, packageId: number) => {
    const raw = await api.post<Record<string, unknown>>(
      `/payment-gateway/membership/init?memberId=${memberId}&packageId=${packageId}`,
      data
    );
    return normalizePaymentResponse(raw);
  },

  confirmMembershipPayment: (
    paymentReference: string,
    gatewayTransactionId: string,
    packageId: number
  ) =>
    api.post<{ message: string }>(
      `/payment-gateway/membership/confirm?packageId=${packageId}`,
      { paymentReference, gatewayTransactionId }
    ),

  initSessionPayment: async (sessionId: number) => {
    const raw = await api.post<Record<string, unknown>>(
      `/payment-gateway/session/init?sessionId=${sessionId}`,
      {},
      true
    );
    return normalizePaymentResponse(raw);
  },

  confirmSessionPayment: (
    paymentReference: string,
    gatewayTransactionId: string,
    sessionId: number
  ) =>
    api.post<{ message: string }>(
      `/payment-gateway/session/confirm?sessionId=${sessionId}`,
      { paymentReference, gatewayTransactionId }
    ),
};
