import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Users, X } from 'lucide-react'

import { formatSessionRange } from '../../lib/formatters'
import { attendanceService, sessionService } from '../../services'
import type { SpecialSession } from '../../types/api'
import {
  getMemberAttendance,
  setMemberAttendance,
  type AttendanceStatus,
} from '../../utils/attendanceStorage'
import { PortalAttendanceCalendar } from '../portal/PortalAttendanceCalendar'
import { usePortalToast } from '../PortalToast/PortalToast'

export function InstructorAttendancePage() {
  const loadInstructorEntries = useCallback(
    (year: number, month: number) => attendanceService.getMyLogs(year, month),
    [],
  )

  return (
    <div className="space-y-10">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Attendance</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Attendance
        </h1>
        <p className="mt-2 max-w-xl text-sm text-portal-muted">
          View your gym entry history and mark attendance for members enrolled in your accepted VIP
          sessions.
        </p>
      </header>

      <PortalAttendanceCalendar
        title="My gym attendance"
        description="Track your staff gym visits ({days} day{daysLabel} this month)."
        loadEntries={loadInstructorEntries}
        emptyDayMessage="No staff gym visits recorded on this day."
      />

      <InstructorSessionMemberAttendance />
    </div>
  )
}

function InstructorSessionMemberAttendance() {
  const toast = usePortalToast()
  const [sessions, setSessions] = useState<SpecialSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [attendanceTick, setAttendanceTick] = useState(0)

  useEffect(() => {
    setLoading(true)
    sessionService
      .getInstructorSessions()
      .then((data) => {
        const accepted = data.filter((session) => session.status === 'Accepted')
        setSessions(accepted)
        setSelectedId((current) => current ?? accepted[0]?.sessionId ?? null)
      })
      .catch(() => {
        setSessions([])
        toast.error('Could not load VIP sessions.')
      })
      .finally(() => setLoading(false))
  }, [])

  const selectedSession = useMemo(
    () => sessions.find((session) => session.sessionId === selectedId) ?? sessions[0] ?? null,
    [sessions, selectedId, attendanceTick],
  )

  const enrollments = selectedSession?.enrollments ?? []
  const sessionKey = selectedSession ? String(selectedSession.sessionId) : ''

  const markAttendance = (memberEmail: string, status: AttendanceStatus) => {
    if (!selectedSession) return
    setMemberAttendance(sessionKey, memberEmail, status)
    setAttendanceTick((value) => value + 1)
  }

  return (
    <section className="space-y-4 border-t border-portal-line pt-8">
      <div>
        <h2 className="text-base font-semibold text-portal-ink">Members attendance — VIP sessions</h2>
        <p className="mt-1 text-sm text-portal-muted">
          Select an accepted VIP session to review enrolled members and mark present or absent.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-portal-muted">Loading VIP sessions…</p>
      ) : sessions.length === 0 ? (
        <div className="portal-widget-3d rounded-xl border border-dashed border-portal-line bg-portal-card px-5 py-12 text-center">
          <p className="text-sm font-medium text-portal-ink">No accepted VIP sessions yet</p>
          <p className="mt-1 text-sm text-portal-muted">
            Accepted sessions you conduct will appear here for member attendance.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-portal-muted">
              Your VIP sessions
            </h3>
            <ul className="mt-3 space-y-3">
              {sessions.map((session) => {
                const enrolledCount = session.enrollments?.length ?? session.enrolledCount
                const isSelected = selectedSession?.sessionId === session.sessionId

                return (
                  <li key={session.sessionId}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(session.sessionId)}
                      className={`portal-widget-3d w-full rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-portal-ink bg-portal-accent-soft'
                          : 'border-portal-line bg-portal-card hover:border-portal-ink/30'
                      }`}
                    >
                      <p className="text-sm font-semibold text-portal-ink">{session.title}</p>
                      <p className="mt-1 text-xs text-portal-muted">
                        {formatSessionRange(session.startDateTime, session.endDateTime)}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-portal-ink">
                        <Users className="size-3.5" aria-hidden="true" />
                        {enrolledCount} enrolled
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="portal-widget-3d rounded-xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/40 to-blue-50/30 p-5 sm:p-6">
            {selectedSession ? (
              <SessionAttendancePanel
                session={selectedSession}
                enrollments={enrollments}
                sessionKey={sessionKey}
                onMark={markAttendance}
              />
            ) : (
              <p className="text-sm text-portal-muted">Select a VIP session to continue.</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function SessionAttendancePanel({
  session,
  enrollments,
  sessionKey,
  onMark,
}: {
  session: SpecialSession
  enrollments: NonNullable<SpecialSession['enrollments']>
  sessionKey: string
  onMark: (memberEmail: string, status: AttendanceStatus) => void
}) {
  const presentCount = enrollments.filter(
    (entry) => getMemberAttendance(sessionKey, entry.email) === 'present',
  ).length
  const absentCount = enrollments.filter(
    (entry) => getMemberAttendance(sessionKey, entry.email) === 'absent',
  ).length

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-sky-700">
        Selected VIP session
      </p>
      <h3 className="mt-1 text-lg font-semibold text-portal-ink">{session.title}</h3>
      <p className="mt-2 text-sm text-portal-ink">
        {formatSessionRange(session.startDateTime, session.endDateTime)}
      </p>
      <p className="mt-3 text-xs text-portal-muted">
        {enrollments.length} enrolled · {presentCount} present · {absentCount} absent
      </p>

      <h4 className="mt-6 text-sm font-semibold text-portal-ink">Enrolled members</h4>

      {enrollments.length === 0 ? (
        <p className="mt-3 text-sm text-portal-muted">
          No members have enrolled in this session yet.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-portal-line rounded-lg border border-portal-line bg-white">
          {enrollments.map((entry) => {
            const status = getMemberAttendance(sessionKey, entry.email)

            return (
              <li
                key={entry.memberId}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-portal-ink">{entry.memberName}</p>
                  <p className="text-xs text-portal-muted">{entry.email}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <AttendanceButton
                    active={status === 'present'}
                    label="Present"
                    icon={Check}
                    activeClass="bg-emerald-600 text-white"
                    onClick={() =>
                      onMark(entry.email, status === 'present' ? 'unmarked' : 'present')
                    }
                  />
                  <AttendanceButton
                    active={status === 'absent'}
                    label="Absent"
                    icon={X}
                    activeClass="bg-rose-600 text-white"
                    onClick={() =>
                      onMark(entry.email, status === 'absent' ? 'unmarked' : 'absent')
                    }
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function AttendanceButton({
  active,
  label,
  icon: Icon,
  activeClass,
  onClick,
}: {
  active: boolean
  label: string
  icon: typeof Check
  activeClass: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? activeClass
          : 'border-portal-line bg-portal-canvas text-portal-ink hover:border-portal-ink/30'
      }`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </button>
  )
}
