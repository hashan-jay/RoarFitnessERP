import { useCallback, useEffect, useState } from 'react';
import { formatApiError } from '../api/client';
import { attendanceApi } from '../services/attendance';
import type { AttendanceLog } from '../types';

interface LogsPanelProps {
  loggedIn: boolean;
  sessionReady: boolean;
  apiOnline: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function LogsPanel({ loggedIn, sessionReady, apiOnline }: LogsPanelProps) {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!sessionReady || !loggedIn || !apiOnline) return;
    setLoading(true);
    setError('');
    try {
      const data = await attendanceApi.getTodayLogs();
      setLogs(data);
    } catch (err) {
      setError(formatApiError(err, 'Could not load today\'s scan logs.'));
    } finally {
      setLoading(false);
    }
  }, [loggedIn, sessionReady, apiOnline]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (!sessionReady) {
    return (
      <div className="panel">
        <p className="muted">Checking admin session…</p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="panel">
        <div className="alert alert--info">Sign in as admin in the sidebar to view today&apos;s scan logs.</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel__header panel__header--row">
        <div>
          <h2>Today&apos;s Scan Logs</h2>
          <p>Live feed from GET /attendance/logs/today (refreshes every 10s).</p>
        </div>
        <button type="button" className="btn btn--outline btn--sm" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <p className="alert alert--error">{error}</p>}

      <div className="card">
        {loading && logs.length === 0 ? (
          <p className="muted">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="muted">No scans recorded today yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Person</th>
                  <th>Type</th>
                  <th>Result</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.attendanceLogId}>
                    <td>{formatTime(log.loggedAt)}</td>
                    <td>{log.memberName ?? log.instructorName ?? 'Unknown'}</td>
                    <td>{log.personType ?? '—'}</td>
                    <td>
                      <span className={`badge ${log.accessGranted ? 'badge--ok' : 'badge--deny'}`}>
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
      </div>
    </div>
  );
}
