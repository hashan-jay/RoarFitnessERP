/**
 * Response normalizers for payment and order API payloads.
 */
import type { Order, PaymentResponse } from '../types';

export function normalizeOrder(raw: Record<string, unknown>): Order {
  const itemsRaw = (raw.items ?? raw.Items ?? []) as Record<string, unknown>[];
  return {
    orderId: Number(raw.orderId ?? raw.OrderId ?? 0),
    orderReference: String(raw.orderReference ?? raw.OrderReference ?? ''),
    status: String(raw.status ?? raw.Status ?? raw.orderStatus ?? 'Paid'),
    totalLKR: Number(raw.totalLKR ?? raw.TotalLKR ?? 0),
    orderChannel: raw.orderChannel ? String(raw.orderChannel) : raw.OrderChannel ? String(raw.OrderChannel) : undefined,
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? new Date().toISOString()),
    billReference: raw.billReference ? String(raw.billReference) : raw.BillReference ? String(raw.BillReference) : undefined,
    items: itemsRaw.map((item) => ({
      productName: String(item.productName ?? item.ProductName ?? ''),
      quantity: Number(item.quantity ?? item.Quantity ?? 0),
      unitPriceLKR: Number(item.unitPriceLKR ?? item.UnitPriceLKR ?? 0),
      lineTotalLKR: Number(item.lineTotalLKR ?? item.LineTotalLKR ?? item.lineTotal ?? 0),
    })),
  };
}

export function normalizePaymentResponse(raw: Record<string, unknown>): PaymentResponse {
  return {
    paymentReference: String(raw.paymentReference ?? raw.PaymentReference ?? ''),
    checkoutUrl: String(raw.checkoutUrl ?? raw.CheckoutUrl ?? ''),
    merchantId: String(raw.merchantId ?? raw.MerchantId ?? ''),
  };
}
