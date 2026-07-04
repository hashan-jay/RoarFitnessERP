/**
 * Review and approve instructor special-session requests. Includes tabbed lists
 * and a calendar view of scheduled sessions. Role: Admin.
 */
import { useEffect, useMemo, useState } from 'react';
import { sessionService, ApiError } from '../../services';
import { LoadingSpinner } from '../../components/common';
import { formatCurrency, formatAppDateTime, formatAppMonthYear, formatSessionRange } from '../../lib/formatters';
import { SessionCard } from '../../components/SessionCard';
import type { SpecialSession } from '../../types';

type AdminTab = 'Pending' | 'Accepted' | 'Rejected' | 'Calendar';

export function AdminSessionManagement() {
  const [tab, setTab] = useState<AdminTab>('Pending');
  const [sessions, setSessions] = useState<SpecialSession[]>([]);
  const [calendarSessions, setCalendarSessions] = useState<SpecialSession[]>([]);
  const [selected, setSelected] = useState<SpecialSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'Calendar') {
        setCalendarSessions(await sessionService.getAdminCalendar());
      } else {
        setSessions(await sessionService.getAdminSessions(tab));
      }
    } catch {
      setError('Could not load sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab]);

  const handleAccept = async (sessionId: number) => {
    setActionLoading(true);
    setError('');
    try {
      await sessionService.acceptSession(sessionId);
      setSelected(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not accept session.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (sessionId: number) => {
    setActionLoading(true);
    setError('');
    try {
      await sessionService.rejectSession(sessionId, { rejectionReason: rejectReason || undefined });
      setSelected(null);
      setRejectReason('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reject session.');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetail = async (session: SpecialSession) => {
    try {
      const detail = await sessionService.getAdminSessionDetail(session.sessionId);
      setSelected(detail);
    } catch {
      setSelected(session);
    }
  };

  // Build calendar grid: pad leading blanks, then one cell per day with matching sessions.
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date | null; sessions: SpecialSession[] }> = [];

    for (let i = 0; i < startOffset; i++) cells.push({ date: null, sessions: [] });
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const daySessions = calendarSessions.filter((session) => {
        const start = new Date(session.startDateTime);
        return start.getFullYear() === year && start.getMonth() === month && start.getDate() === day;
      });
      cells.push({ date, sessions: daySessions });
    }
    return cells;
  }, [calendarMonth, calendarSessions]);

  return (
    <>
      <div className="page-title">
        <h1>Session Management</h1>
        <p>Review instructor requests, manage schedules, and view enrollments.</p>
      </div>

      <div className="session-tabs">
        {(['Pending', 'Accepted', 'Rejected', 'Calendar'] as AdminTab[]).map((item) => (
          <button
            key={item}
            type="button"
            className={`session-tabs__btn ${tab === item ? 'active' : ''}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : tab === 'Calendar' ? (
        <div className="card session-calendar">
          <div className="session-calendar__toolbar">
            <button type="button" className="btn btn--outline btn--sm" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>Previous</button>
            <strong>{formatAppMonthYear(calendarMonth.toISOString())}</strong>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>Next</button>
          </div>
          <div className="session-calendar__grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="session-calendar__weekday">{day}</div>
            ))}
            {calendarDays.map((cell, index) => (
              <div key={index} className="session-calendar__cell">
                {cell.date && <span className="session-calendar__day">{cell.date.getDate()}</span>}
                {cell.sessions.map((session) => (
                  <button
                    key={session.sessionId}
                    type="button"
                    className={`session-calendar__event session-calendar__event--${session.runtimeStatus.toLowerCase()}`}
                    onClick={() => openDetail(session)}
                  >
                    {session.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid--2">
          {sessions.length === 0 ? (
            <div className="card"><p>No {tab.toLowerCase()} sessions.</p></div>
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.sessionId}
                session={session}
                action={
                  <div className="session-card__actions">
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => openDetail(session)}>View details</button>
                    {tab === 'Pending' && (
                      <>
                        {session.hasTimeConflict && (
                          <span className="badge badge--error">Time conflict</span>
                        )}
                        <button type="button" className="btn btn--primary btn--sm" disabled={actionLoading || session.hasTimeConflict} onClick={() => handleAccept(session.sessionId)}>
                          Accept
                        </button>
                        <button type="button" className="btn btn--outline btn--sm" disabled={actionLoading} onClick={() => { setSelected(session); setRejectReason(''); }}>
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                }
              />
            ))
          )}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{selected.title}</h2>
              <button type="button" className="modal__close" onClick={() => setSelected(null)} aria-label="Close">×</button>
            </div>
            <div className="session-detail">
              <p><strong>Instructor:</strong> {selected.instructorName}</p>
              <p><strong>Status:</strong> {selected.status} · {selected.runtimeStatus}</p>
              <p><strong>Schedule:</strong> {formatSessionRange(selected.startDateTime, selected.endDateTime)}</p>
              <p><strong>Fee:</strong> {formatCurrency(selected.feePerPersonLKR)} per person</p>
              <p><strong>Capacity:</strong> {selected.enrolledCount}/{selected.maxParticipants}</p>
              <p>{selected.description}</p>
              {selected.rejectionReason && <p><strong>Rejection reason:</strong> {selected.rejectionReason}</p>}

              <h3>Enrolled members</h3>
              {selected.enrollments && selected.enrollments.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Enrolled</th></tr>
                    </thead>
                    <tbody>
                      {selected.enrollments.map((enrollment) => (
                        <tr key={enrollment.memberId}>
                          <td>{enrollment.memberName}</td>
                          <td>{enrollment.email}</td>
                          <td>{formatAppDateTime(enrollment.enrolledAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No members enrolled yet.</p>
              )}

              {selected.status === 'Pending' && (
                <div className="modal__actions">
                  <input
                    type="text"
                    placeholder="Rejection reason (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <button type="button" className="btn btn--outline" disabled={actionLoading} onClick={() => handleReject(selected.sessionId)}>Reject</button>
                  <button type="button" className="btn btn--primary" disabled={actionLoading || selected.hasTimeConflict} onClick={() => handleAccept(selected.sessionId)}>Accept</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
