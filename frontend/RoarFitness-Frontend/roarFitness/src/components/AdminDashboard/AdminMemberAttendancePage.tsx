import { useEffect, useMemo, useState } from 'react'

import { formatAppDate, formatAppDateTime, getAppTodayInputValue } from '../../lib/formatters'
import { attendanceService, type AdminAttendanceFilter } from '../../services/attendanceService'
import { usePortalToast } from '../PortalToast/PortalToast'
import type { AdminAttendanceLog } from '../../types/api'

const FILTER_TABS: { id: AdminAttendanceFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'members', label: 'Members Attendance' },
  { id: 'instructors', label: 'Instructor Attendance' },
]

export function AdminMemberAttendancePage() {
  const toast = usePortalToast()
  const [filterDate, setFilterDate] = useState(getAppTodayInputValue)
  const [activeFilter, setActiveFilter] = useState<AdminAttendanceFilter>('all')
  const [logs, setLogs] = useState<AdminAttendanceLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!filterDate) return
    setLoading(true)
    attendanceService
      .getAdminLogsByDate(filterDate, activeFilter)
      .then(setLogs)
      .catch(() => {
        setLogs([])
        toast.error('Unable to load attendance for the selected date.')
      })
      .finally(() => setLoading(false))
  }, [filterDate, activeFilter])

  const grantedCount = logs.filter((log) => log.accessGranted).length
  const deniedCount = logs.length - grantedCount

  const emptyMessage = useMemo(() => {
    if (activeFilter === 'members') return 'No member attendance records for this date.'
    if (activeFilter === 'instructors') return 'No instructor attendance records for this date.'
    return 'No attendance records for this date.'
  }, [activeFilter])

  return (
    <div className="space-y-6">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Attendance</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Gym attendance
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          View member and instructor fingerprint entry scans by date.
        </p>
      </header>

      <div className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5">
        <label htmlFor="attendance-date" className="block text-xs font-medium text-portal-muted">
          Filter by date
        </label>
        <input
          id="attendance-date"
          type="date"
          className="mt-2 w-full max-w-xs rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink"
          value={filterDate}
          onChange={(event) => setFilterDate(event.target.value)}
        />
        {filterDate && (
          <p className="mt-2 text-xs text-portal-muted">
            Showing entries for {formatAppDate(`${filterDate}T12:00:00+05:30`)}.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const active = activeFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'border-portal-ink bg-portal-ink text-white'
                  : 'border-portal-line bg-portal-card text-portal-ink hover:bg-portal-canvas'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Total entries" value={String(logs.length)} />
        <StatTile label="Granted" value={String(grantedCount)} />
        <StatTile label="Denied" value={String(deniedCount)} />
      </div>

      <div className="portal-widget-3d overflow-hidden rounded-xl border border-portal-line bg-portal-card">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-portal-muted">Loading attendance…</p>
        ) : logs.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-portal-muted">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-portal-line bg-portal-canvas text-xs uppercase tracking-wide text-portal-muted">
                <tr>
                  {activeFilter === 'all' ? <th className="px-4 py-3">Type</th> : null}
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Date &amp; time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-portal-line">
                {logs.map((log) => (
                  <tr key={log.attendanceLogId}>
                    {activeFilter === 'all' ? (
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            log.personType === 'Instructor'
                              ? 'bg-violet-50 text-violet-700'
                              : log.personType === 'Member'
                                ? 'bg-sky-50 text-sky-700'
                                : 'bg-portal-canvas text-portal-muted'
                          }`}
                        >
                          {log.personType}
                        </span>
                      </td>
                    ) : null}
                    <td className="px-4 py-3 font-mono text-xs">
                      {log.identificationNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3">{log.personName}</td>
                    <td className="px-4 py-3">{formatAppDateTime(log.loggedAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          log.accessGranted
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {log.accessGranted ? 'Granted' : 'Denied'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-portal-muted">{log.validationMessage ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="portal-widget-3d rounded-xl border border-portal-line bg-gradient-to-br from-white via-sky-50/70 to-blue-50/50 px-4 py-4">
      <p className="text-xs font-medium text-portal-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-portal-ink">{value}</p>
    </div>
  )
}
