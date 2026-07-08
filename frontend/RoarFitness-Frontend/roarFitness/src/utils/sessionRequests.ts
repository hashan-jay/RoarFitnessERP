import { formatAppDate } from '../lib/datetime'

/** UI status for VIP/special sessions — mirrors backend SpecialSessionStatus. */
export type SessionRequestStatus = 'pending' | 'approved' | 'rejected'

/** View-model shape shared by admin/instructor VIP pages (mapped from API via sessionAdapter). */
export interface SessionRequest {
  id: string
  title: string
  classTypeId: string
  description: string
  date: string
  startTime: string
  endTime: string
  studio: string
  capacity: number
  priceLkr: number
  instructorEmail: string
  instructorName: string
  status: SessionRequestStatus
  createdAt: string
  reviewedAt?: string
}

/*
 * LEGACY — localStorage CRUD for VIP sessions before the backend API existed.
 * Replaced by sessionService + SpecialSessionService. Not imported anywhere.
 *
const SESSIONS_KEY = 'roar_session_requests'

function readAll(): SessionRequest[] { ... }
function writeAll(sessions: SessionRequest[]): void { ... }
export function getAllSessionRequests(): SessionRequest[] { ... }
export function getInstructorSessionRequests(email: string): SessionRequest[] { ... }
export function getApprovedSessions(): SessionRequest[] { ... }
export function getApprovedSessionsForDate(dateKey: string): SessionRequest[] { ... }
export function createSessionRequest(...): SessionRequest { ... }
export function updateSessionRequestStatus(...): SessionRequest | null { ... }
export function sessionRequestToScheduleSlot(session: SessionRequest): ResolvedScheduleSlot { ... }
 */

/** Human-readable date for VIP session cards (Asia/Colombo). */
export function formatSessionDate(dateKey: string): string {
  return formatAppDate(`${dateKey}T12:00:00+05:30`)
}

/** Consistent LKR currency display across portal pages. */
export function formatLkr(amount: number): string {
  return `LKR ${amount.toLocaleString('en-LK')}`
}
