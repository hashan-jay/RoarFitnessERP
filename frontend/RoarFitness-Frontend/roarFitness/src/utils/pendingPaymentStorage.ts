const PENDING_PAYMENT_KEY = 'roar_pending_payment'

export type PendingPaymentKind = 'membership-renewal' | 'session'

export interface PendingPayment {
  kind: PendingPaymentKind
  paymentReference: string
  amountLKR: number
  title: string
  description: string
  cardholderName: string
  returnPath: string
  returnLabel: string
  packageId?: number
  sessionId?: number
}

function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function savePendingPayment(data: PendingPayment): void {
  sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(data))
}

export function getPendingPayment(): PendingPayment | null {
  return readJson<PendingPayment>(PENDING_PAYMENT_KEY)
}

export function clearPendingPayment(): void {
  sessionStorage.removeItem(PENDING_PAYMENT_KEY)
}
