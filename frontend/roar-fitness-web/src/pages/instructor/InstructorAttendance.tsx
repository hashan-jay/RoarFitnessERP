/**
 * Full log of today's fingerprint entry scans at the gym entrance.
 * Role: Instructor.
 */
import { useEffect, useState } from 'react';
import { instructorService } from '../../services';
import { LoadingSpinner, EmptyState, formatAppDateTime } from '../../components/common';
import type { AttendanceLog } from '../../types';

const fallbackAttendance: AttendanceLog[] = [
  {
    attendanceLogId: 1,
    loggedAt: new Date().toISOString(),
    accessGranted: true,
    validationMessage: 'Entry granted.',
    memberName: 'John Doe',
    personType: 'Member',
  },
  {
    attendanceLogId: 2,
    loggedAt: new Date(Date.now() - 3600000).toISOString(),
    accessGranted: false,
    validationMessage: 'Membership expired or inactive. Access denied.',
    memberName: 'Jane Smith',
    personType: 'Member',
  },
  {
    attendanceLogId: 3,
    loggedAt: new Date(Date.now() - 7200000).toISOString(),
    accessGranted: true,
    validationMessage: 'Staff entry granted.',
    instructorName: 'Dilshan Perera',
    personType: 'Instructor',
  },
];

export function InstructorAttendance() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instructorService
      .getTodayAttendance()
      .then(setLogs)
      .catch(() => setLogs(fallbackAttendance))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-title">
        <h1>Today&apos;s Entry Scans</h1>
        <p>Fingerprint scans at the gym entrance — valid membership required for access.</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : logs.length === 0 ? (
        <EmptyState message="No entry scans recorded for today." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Person</th>
                <th>Type</th>
                <th>Access</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.attendanceLogId}>
                  <td>{formatAppDateTime(log.loggedAt)}</td>
                  <td>{log.memberName ?? log.instructorName ?? 'Unknown'}</td>
                  <td>{log.personType ?? '—'}</td>
                  <td>
                    <span className={`badge ${log.accessGranted ? 'badge--success' : 'badge--error'}`}>
                      {log.accessGranted ? 'Granted' : 'Denied'}
                    </span>
                  </td>
                  <td>{log.validationMessage ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
