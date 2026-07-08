import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import {
  formatAppMonthYearFromParts,
  formatAppTime,
  getAppToday,
  getColomboDayOfWeek,
  getDaysInColomboMonth,
  isSameColomboDay,
} from '../../lib/formatters'
import type { MemberAttendanceEntry } from '../../types/api'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

interface PortalAttendanceCalendarProps {
  title: string
  description: string
  loadEntries: (year: number, month: number) => Promise<MemberAttendanceEntry[]>
  emptyDayMessage?: string
}

export function PortalAttendanceCalendar({
  title,
  description,
  loadEntries,
  emptyDayMessage = 'No gym visits recorded on this day.',
}: PortalAttendanceCalendarProps) {
  const today = getAppToday()
  const [calendarMonth, setCalendarMonth] = useState({ year: today.year, month: today.month })
  const [entries, setEntries] = useState<MemberAttendanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(today.day)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      setLoading(true)
      void loadEntries(calendarMonth.year, calendarMonth.month)
        .then((next) => {
          if (!cancelled) setEntries(next)
        })
        .catch(() => {
          if (!cancelled) setEntries([])
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    load()

    const handleFocus = () => {
      load()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      cancelled = true
      window.removeEventListener('focus', handleFocus)
    }
  }, [calendarMonth.year, calendarMonth.month, loadEntries])

  const entriesByDay = useMemo(() => {
    const map = new Map<number, MemberAttendanceEntry[]>()
    const daysInMonth = getDaysInColomboMonth(calendarMonth.year, calendarMonth.month)

    for (const entry of entries) {
      for (let day = 1; day <= daysInMonth; day++) {
        if (isSameColomboDay(entry.loggedAt, calendarMonth.year, calendarMonth.month, day)) {
          const list = map.get(day) ?? []
          list.push(entry)
          map.set(day, list)
          break
        }
      }
    }
    return map
  }, [entries, calendarMonth.year, calendarMonth.month])

  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth
    const startOffset = getColomboDayOfWeek(year, month, 1)
    const daysInMonth = getDaysInColomboMonth(year, month)
    const cells: Array<{ day: number | null; entries: MemberAttendanceEntry[] }> = []

    for (let i = 0; i < startOffset; i++) cells.push({ day: null, entries: [] })
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, entries: entriesByDay.get(day) ?? [] })
    }
    return cells
  }, [calendarMonth, entriesByDay])

  const selectedEntries = selectedDay ? entriesByDay.get(selectedDay) ?? [] : []
  const attendanceDays = entriesByDay.size

  const goToPreviousMonth = () => {
    setCalendarMonth((current) => {
      if (current.month === 1) return { year: current.year - 1, month: 12 }
      return { year: current.year, month: current.month - 1 }
    })
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    setCalendarMonth((current) => {
      if (current.month === 12) return { year: current.year + 1, month: 1 }
      return { year: current.year, month: current.month + 1 }
    })
    setSelectedDay(null)
  }

  const isToday = (day: number) =>
    day === today.day &&
    calendarMonth.year === today.year &&
    calendarMonth.month === today.month

  const resolvedDescription = description
    .replace('{days}', String(attendanceDays))
    .replace('{daysLabel}', attendanceDays === 1 ? '' : 's')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-portal-ink">{title}</h2>
        <p className="mt-1 text-sm text-portal-muted">{resolvedDescription}</p>
      </div>

      <div className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5">
        {loading ? (
          <p className="py-8 text-center text-sm text-portal-muted">Loading attendance…</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-portal-line text-portal-ink transition hover:bg-portal-canvas"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <p className="text-sm font-semibold text-portal-ink">
                {formatAppMonthYearFromParts(calendarMonth.year, calendarMonth.month)}
              </p>
              <button
                type="button"
                onClick={goToNextMonth}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-portal-line text-portal-ink transition hover:bg-portal-canvas"
                aria-label="Next month"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-1">
              {WEEKDAY_LABELS.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-portal-muted"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((cell, index) => {
                const hasGranted = cell.entries.some((entry) => entry.accessGranted)
                const hasDenied = cell.entries.some((entry) => !entry.accessGranted)
                const isSelected = cell.day !== null && selectedDay === cell.day

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={!cell.day}
                    onClick={() => cell.day && setSelectedDay(cell.day)}
                    className={`flex min-h-[4.5rem] flex-col items-center rounded-lg border p-1.5 text-sm transition disabled:invisible ${
                      isSelected
                        ? 'border-portal-ink bg-portal-accent-soft'
                        : isToday(cell.day ?? 0)
                          ? 'border-sky-200 bg-sky-50/60'
                          : 'border-transparent hover:border-portal-line hover:bg-portal-canvas'
                    }`}
                  >
                    {cell.day && (
                      <>
                        <span className="font-medium text-portal-ink">{cell.day}</span>
                        {cell.entries.length > 0 && (
                          <span
                            className={`mt-1 rounded px-1 text-[9px] font-semibold ${
                              hasGranted && !hasDenied
                                ? 'bg-emerald-100 text-emerald-700'
                                : hasDenied && !hasGranted
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {cell.entries.length}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 border-t border-portal-line pt-5">
              {selectedDay ? (
                selectedEntries.length > 0 ? (
                  <>
                    <h3 className="text-sm font-semibold text-portal-ink">
                      Entries on {selectedDay}{' '}
                      {formatAppMonthYearFromParts(calendarMonth.year, calendarMonth.month)}
                    </h3>
                    <ul className="mt-4 divide-y divide-portal-line">
                      {selectedEntries.map((entry) => (
                        <li
                          key={entry.attendanceLogId}
                          className="flex flex-wrap items-center gap-3 py-3 first:pt-0"
                        >
                          <span className="text-sm font-medium text-portal-ink">
                            {formatAppTime(entry.loggedAt)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              entry.accessGranted
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {entry.accessGranted ? 'Granted' : 'Denied'}
                          </span>
                          {!entry.accessGranted && entry.validationMessage && (
                            <span className="text-xs text-portal-muted">
                              {entry.validationMessage}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-portal-muted">{emptyDayMessage}</p>
                )
              ) : (
                <p className="text-sm text-portal-muted">Select a day to view entry times.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
