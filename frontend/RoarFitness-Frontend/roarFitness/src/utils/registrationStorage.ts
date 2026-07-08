import type { RegisterFormValues } from '../components/Register/registerValidation'

const PENDING_KEY = 'roar_pending_registration'

/**
 * Checkout handoff between registration form and payment page.
 * Stored in sessionStorage so a refresh mid-checkout can resume PayHere/mock flow.
 */
export interface PendingRegistration {
  planId: string
  packageId: number
  memberId: number
  paymentReference: string
  checkoutUrl?: string
  planName: string
  planDescription: string
  planPeriod: string
  amountLKR: number
  values: RegisterFormValues
}

function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key) ?? localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeSession<T>(key: string, value: T): void {
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function savePendingRegistration(data: PendingRegistration): void {
  writeSession(PENDING_KEY, data)
}

export function getPendingRegistration(): PendingRegistration | null {
  return readJson<PendingRegistration>(PENDING_KEY)
}

export function clearPendingRegistration(): void {
  sessionStorage.removeItem(PENDING_KEY)
}

/*
 * LEGACY — mock member accounts in localStorage before JWT auth + backend Members table.
 * Login and profile now use authService.me(). Not imported anywhere.
 *
const MEMBERS_KEY = 'roar_registered_members'

export interface StoredMember {
  email: string
  password: string
  firstName: string
  lastName: string
  planId: string
  planName: string
}

export function getRegisteredMembers(): StoredMember[] { ... }
export function saveRegisteredMember(member: StoredMember): void { ... }
export function findRegisteredMember(email: string, password: string): StoredMember | null { ... }
export function findMemberByEmail(email: string): StoredMember | null { ... }
export function createMember(member: StoredMember): StoredMember { ... }
export function updateMember(...): StoredMember { ... }
export function deleteMember(email: string): void { ... }
 */
