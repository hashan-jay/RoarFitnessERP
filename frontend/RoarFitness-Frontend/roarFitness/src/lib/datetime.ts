/** Sri Lanka display timezone (Asia/Colombo) used across all portals, bills, and transactions. */
export const APP_TIME_ZONE = 'Asia/Colombo'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

const monthYearFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIME_ZONE,
  month: 'long',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

const clockTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function parseDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

function getColomboDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = Number(parts.find((part) => part.type === 'year')?.value ?? 0)
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? 0)
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? 0)
  return { year, month, day }
}

export function getColomboDayOfWeek(year: number, month: number, day: number): number {
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00+05:30`
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIME_ZONE,
    weekday: 'short',
  }).format(new Date(iso))
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return map[weekday] ?? 0
}

export function getDaysInColomboMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function formatAppMonthYearFromParts(year: number, month: number): string {
  const iso = `${year}-${String(month).padStart(2, '0')}-01T12:00:00+05:30`
  return formatAppMonthYear(iso)
}

export function getAppToday() {
  return getColomboDateParts(new Date())
}

export function getAppTodayInputValue(): string {
  const { year, month, day } = getAppToday()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function isSameColomboDay(iso: string, year: number, month: number, day: number): boolean {
  const parts = getColomboDateParts(parseDate(iso))
  return parts.year === year && parts.month === month && parts.day === day
}

export function formatAppDate(value: string | Date): string {
  return dateFormatter.format(parseDate(value))
}

export function formatAppTime(value: string | Date): string {
  return timeFormatter.format(parseDate(value))
}

export function formatAppDateTime(value: string | Date): string {
  return dateTimeFormatter.format(parseDate(value))
}

export function formatAppClock(value: string | Date = new Date()): string {
  return clockTimeFormatter.format(parseDate(value))
}

export function formatAppClockDate(value: string | Date = new Date()): string {
  return dateFormatter.format(parseDate(value))
}

export function formatAppMonthYear(value: string | Date): string {
  return monthYearFormatter.format(parseDate(value))
}

export function formatSessionRange(start: string, end: string): string {
  return `${formatAppDate(start)} ${formatAppTime(start)} – ${formatAppTime(end)}`
}

export function toDateInputValue(value?: string | null): string {
  if (!value) return ''
  const { year, month, day } = getColomboDateParts(parseDate(value))
  if (!year || !month || !day) return ''
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function calculateAgeFromDateOfBirth(value?: string | null): number | null {
  if (!value) return null

  const dob = getColomboDateParts(parseDate(value))
  const today = getColomboDateParts(new Date())
  if (!dob.year || !dob.month || !dob.day) return null

  let age = today.year - dob.year
  const hadBirthday =
    today.month > dob.month || (today.month === dob.month && today.day >= dob.day)
  if (!hadBirthday) age -= 1

  return age >= 0 ? age : null
}

export function isAdultFromDateOfBirth(value?: string | null): boolean {
  const age = calculateAgeFromDateOfBirth(value)
  return age !== null && age >= 18
}
