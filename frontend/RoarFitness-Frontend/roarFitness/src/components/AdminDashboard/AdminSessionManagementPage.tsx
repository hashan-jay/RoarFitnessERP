import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { FITNESS_CLASSES } from '../Classes/constants'
import {
  adminTabToApiStatus,
  mapSpecialSessionToRequest,
} from '../../adapters/sessionAdapter'
import { sessionService } from '../../services'
import { usePortalToast } from '../PortalToast/PortalToast'
import { formatAppMonthYearFromParts } from '../../lib/formatters'
import {
  formatLkr,
  formatSessionDate,
  type SessionRequest,
  type SessionRequestStatus,
} from '../../utils/sessionRequests'

type SessionTab = 'pending' | 'approved' | 'rejected' | 'calendar'

const TABS: { id: SessionTab; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'calendar', label: 'Calendar' },
]

export function AdminSessionManagementPage() {
  const toast = usePortalToast()
  const [sessions, setSessions] = useState<SessionRequest[]>([])
  const [tab, setTab] = useState<SessionTab>('pending')
  const [loading, setLoading] = useState(true)
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const loadSessions = async (activeTab: SessionTab) => {
    setLoading(true)
    try {
      if (activeTab === 'calendar') {
        const approved = await sessionService.getAdminSessions('Accepted')
        setSessions(approved.map(mapSpecialSessionToRequest))
      } else {
        const data = await sessionService.getAdminSessions(adminTabToApiStatus(activeTab))
        setSessions(data.map(mapSpecialSessionToRequest))
      }
    } catch {
      toast.error('Could not load sessions.')
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSessions(tab)
  }, [tab])

  const filtered = useMemo(() => {
    if (tab === 'calendar') return []
    return sessions.filter((session) => session.status === tab)
  }, [sessions, tab])

  const setStatus = async (session: SessionRequest, status: SessionRequestStatus) => {
    try {
      const sessionId = Number(session.id)
      if (status === 'approved') {
        await sessionService.acceptSession(sessionId)
      } else {
        await sessionService.rejectSession(sessionId, {})
      }
      await loadSessions(tab)
      toast.success(
        status === 'approved'
          ? `"${session.title}" approved and published.`
          : `"${session.title}" rejected.`,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update session.')
    }
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">VIP</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          VIP Sessions
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          Review instructor requests, manage schedules, and view enrollments.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((entry) => {
          const active = tab === entry.id
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-portal-ink text-white'
                  : 'border border-portal-line bg-portal-card text-portal-ink hover:bg-portal-canvas'
              }`}
            >
              {entry.label}
            </button>
          )
        })}
      </div>

      {tab === 'calendar' ? (
        <SessionCalendar
          sessions={sessions.filter((session) => session.status === 'approved')}
          monthCursor={monthCursor}
          onPrevious={() =>
            setMonthCursor(
              (current) =>
                new Date(current.getFullYear(), current.getMonth() - 1, 1),
            )
          }
          onNext={() =>
            setMonthCursor(
              (current) =>
                new Date(current.getFullYear(), current.getMonth() + 1, 1),
            )
          }
        />
      ) : loading ? (
        <div className="portal-widget-3d rounded-xl border border-dashed border-portal-line bg-portal-card px-5 py-12 text-center">
          <p className="text-sm font-medium text-portal-ink">Loading sessions…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="portal-widget-3d rounded-xl border border-dashed border-portal-line bg-portal-card px-5 py-12 text-center">
          <p className="text-sm font-medium text-portal-ink">
            No {tab} sessions
          </p>
          <p className="mt-1 text-sm text-portal-muted">
            Instructor requests will appear here for review.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onApprove={
                tab === 'pending'
                  ? () => {
                      void setStatus(session, 'approved')
                    }
                  : undefined
              }
              onReject={
                tab === 'pending'
                  ? () => {
                      void setStatus(session, 'rejected')
                    }
                  : undefined
              }
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function SessionCard({
  session,
  onApprove,
  onReject,
}: {
  session: SessionRequest
  onApprove?: () => void
  onReject?: () => void
}) {
  const classType =
    FITNESS_CLASSES.find((entry) => entry.id === session.classTypeId)?.title ??
    session.classTypeId

  return (
    <li className="portal-widget-3d rounded-xl border border-portal-line bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <StatusPill status={session.status} />
        <p className="text-sm font-semibold text-sky-600">
          {formatLkr(session.priceLkr)}
        </p>
      </div>
      <h3 className="mt-3 text-base font-semibold text-portal-ink">{session.title}</h3>
      <p className="mt-1 text-sm text-portal-muted">
        {session.instructorName} · {classType} · {session.studio}
      </p>
      <p className="mt-2 text-sm text-portal-muted">{session.description}</p>
      <p className="mt-3 text-sm text-portal-ink">
        {formatSessionDate(session.date)} · {session.startTime} - {session.endTime}
      </p>
      <p className="mt-1 text-sm text-portal-muted">Capacity {session.capacity}</p>

      {onApprove && onReject && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onApprove}
            className="rounded-lg bg-portal-ink px-3.5 py-2 text-sm font-medium text-white transition hover:bg-black"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={onReject}
            className="rounded-lg border border-portal-line px-3.5 py-2 text-sm font-medium text-portal-ink transition hover:bg-portal-canvas"
          >
            Reject
          </button>
        </div>
      )}
    </li>
  )
}

function StatusPill({ status }: { status: SessionRequestStatus }) {
  const styles: Record<SessionRequestStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
  }

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${styles[status]}`}
    >
      {status === 'approved' ? 'accepted' : status}
    </span>
  )
}

function SessionCalendar({
  sessions,
  monthCursor,
  onPrevious,
  onNext,
}: {
  sessions: SessionRequest[]
  monthCursor: Date
  onPrevious: () => void
  onNext: () => void
}) {
  const year = monthCursor.getFullYear()
  const month = monthCursor.getMonth()
  const monthLabel = formatAppMonthYearFromParts(year, month + 1)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  while (cells.length % 7 !== 0) cells.push(null)

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, SessionRequest[]>()
    for (const session of sessions) {
      const list = map.get(session.date) ?? []
      list.push(session)
      map.set(session.date, list)
    }
    return map
  }, [sessions])

  return (
    <div className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrevious}
          className="inline-flex items-center gap-1 rounded-lg border border-portal-line bg-white px-3 py-2 text-sm font-medium text-portal-ink transition hover:bg-portal-canvas"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </button>
        <p className="text-sm font-semibold text-portal-ink sm:text-base">
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1 rounded-lg border border-portal-line bg-white px-3 py-2 text-sm font-medium text-portal-ink transition hover:bg-portal-canvas"
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-portal-line bg-portal-line">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-portal-canvas px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-portal-muted sm:text-xs"
          >
            {day}
          </div>
        ))}

        {cells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="min-h-20 bg-white sm:min-h-24" />
          }

          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const daySessions = sessionsByDay.get(dateKey) ?? []

          return (
            <div
              key={dateKey}
              className="min-h-20 bg-white p-1.5 sm:min-h-24 sm:p-2"
            >
              <p className="text-xs font-medium text-portal-muted">{day}</p>
              <ul className="mt-1 space-y-1">
                {daySessions.map((session) => (
                  <li
                    key={session.id}
                    className="truncate rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-800"
                    title={`${session.title} · ${session.startTime}`}
                  >
                    {session.title}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
