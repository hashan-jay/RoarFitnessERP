import { useCallback } from 'react'

import { PortalAttendanceCalendar } from '../portal/PortalAttendanceCalendar'
import { attendanceService } from '../../services'

export function MemberAttendanceCalendar() {
  const loadEntries = useCallback(
    (year: number, month: number) => attendanceService.getMyLogs(year, month),
    [],
  )

  return (
    <div className="space-y-6">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Attendance</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Gym attendance
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          Track your gym visits and fingerprint entry history.
        </p>
      </header>

      <PortalAttendanceCalendar
        title="Your gym visits"
        description="Track your gym visits ({days} day{daysLabel} this month)."
        loadEntries={loadEntries}
      />
    </div>
  )
}
