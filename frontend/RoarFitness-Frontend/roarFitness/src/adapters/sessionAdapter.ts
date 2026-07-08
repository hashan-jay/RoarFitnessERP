import type { SpecialSession } from '../types/api'
import { formatAppTime } from '../lib/formatters'
import type { SessionRequest, SessionRequestStatus } from '../utils/sessionRequests'

function mapSessionStatus(status: string): SessionRequestStatus {
  const normalized = status.toLowerCase()
  if (normalized === 'accepted' || normalized === 'approved') return 'approved'
  if (normalized === 'rejected') return 'rejected'
  return 'pending'
}

function formatTime(iso: string): string {
  return formatAppTime(iso)
}
export function mapSpecialSessionToRequest(session: SpecialSession): SessionRequest {
  const start = new Date(session.startDateTime)

  return {
    id: String(session.sessionId),
    title: session.title,
    classTypeId: 'special',
    description: session.description,
    date: start.toISOString().slice(0, 10),
    startTime: formatTime(session.startDateTime),
    endTime: formatTime(session.endDateTime),
    studio: 'Special session',
    capacity: session.maxParticipants,
    priceLkr: session.feePerPersonLKR,
    instructorEmail: '',
    instructorName: session.instructorName,
    status: mapSessionStatus(session.status),
    createdAt: session.startDateTime,
  }
}

export function adminTabToApiStatus(tab: 'pending' | 'approved' | 'rejected'): string {
  if (tab === 'approved') return 'Accepted'
  if (tab === 'rejected') return 'Rejected'
  return 'Pending'
}
