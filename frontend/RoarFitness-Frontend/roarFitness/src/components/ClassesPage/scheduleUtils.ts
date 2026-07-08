import type { ResolvedScheduleSlot } from './scheduleCatalog'
import { resolveDaySchedule, WEEKLY_SCHEDULE_INPUT } from './scheduleCatalog'

export interface DayOption {
  key: string
  date: Date
}

export type ClassSession = ResolvedScheduleSlot

export function getDayKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function getWeekWindow(startDate: Date): DayOption[] {
  const base = startOfDay(startDate)

  return Array.from({ length: 7 }, (_, dayOffset) => {
    const date = new Date(base)
    date.setDate(base.getDate() + dayOffset)

    return {
      key: getDayKey(date),
      date,
    }
  })
}

export function shiftDate(date: Date, dayOffset: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + dayOffset)
  return startOfDay(next)
}

export function formatShortWeekday(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
}

export function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)
}

export function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function parseStartMinutes(timeRange: string): number {
  const start = timeRange.split('-')[0]?.trim() ?? ''
  const [hours, minutes] = start.split(':').map(Number)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
  return hours * 60 + minutes
}

export function getStartTime(timeRange: string): string {
  return timeRange.split('-')[0]?.trim() ?? timeRange
}

export function getDaySchedule(weekday: number): ClassSession[] {
  // Fallback path when general-classes API data is null (see ClassesPage loadGeneralClasses).
  const slots = WEEKLY_SCHEDULE_INPUT[weekday] ?? []

  return resolveDaySchedule(slots).sort(
    (left, right) => parseStartMinutes(left.time) - parseStartMinutes(right.time),
  )
}

export function filterSessions(
  sessions: ClassSession[],
  classTypeId: string,
  trainerId: string,
): ClassSession[] {
  return sessions.filter((session) => {
    if (session.isVipSession) return true

    const matchesType = classTypeId === 'all' || session.classId === classTypeId
    const matchesTrainer = trainerId === 'all' || session.trainerId === trainerId

    return matchesType && matchesTrainer
  })
}
