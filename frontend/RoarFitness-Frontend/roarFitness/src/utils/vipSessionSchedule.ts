import { classCardio } from '../assets/images/classes'
import { trainerChristian } from '../assets/images/trainers'
import type { ResolvedScheduleSlot } from '../components/ClassesPage/scheduleCatalog'
import { formatAppTime } from '../lib/datetime'
import type { PublicVipSession } from '../types/api'

function formatTimeRange(startDateTime: string, endDateTime: string): string {
  return `${formatAppTime(startDateTime)} - ${formatAppTime(endDateTime)}`
}

function durationLabel(startDateTime: string, endDateTime: string): string {
  const start = new Date(startDateTime)
  const end = new Date(endDateTime)
  const minutes = Math.round((end.getTime() - start.getTime()) / 60_000)
  if (minutes <= 0) return '60 min'
  return `${minutes} min`
}

export function mapVipSessionToScheduleSlot(session: PublicVipSession): ResolvedScheduleSlot {
  return {
    id: `vip-${session.sessionId}`,
    classId: 'vip',
    trainerId: String(session.instructorId),
    className: session.title,
    classType: 'VIP Session',
    description: session.description,
    classImage: classCardio,
    instructorName: session.instructorName,
    instructorRole: 'Instructor',
    instructorImage: trainerChristian,
    time: formatTimeRange(session.startDateTime, session.endDateTime),
    duration: durationLabel(session.startDateTime, session.endDateTime),
    studio: 'VIP Session',
    isVipSession: true,
    feePerPersonLKR: session.feePerPersonLKR,
    spotsRemaining: session.spotsRemaining,
    maxParticipants: session.maxParticipants,
  }
}
