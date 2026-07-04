/**
 * Instructor home screen with today's entry-scan stats, session request shortcut,
 * and recent attendance preview. Role: Instructor.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { instructorService, membershipService, sessionService } from '../../services';
import { LoadingSpinner } from '../../components/common';
import { formatAppTime } from '../../lib/formatters';
import { SessionRequestModal } from '../../components/SessionRequestModal';
import type { AttendanceLog, InstructorProfile, SpecialSession } from '../../types';

export function InstructorDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [sessions, setSessions] = useState<SpecialSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadSessions = () =>
    sessionService.getInstructorSessions().then(setSessions).catch(() => setSessions([]));

  useEffect(() => {
    Promise.all([
      instructorService.getTodayAttendance().catch(() => []),
      membershipService.getInstructorProfile().catch(() => null),
      loadSessions(),
    ])
      .then(([logs, instructorProfile]) => {
        setAttendance(logs);
        setProfile(instructorProfile);
      })
      .finally(() => setLoading(false));
  }, []);

  const grantedEntries = attendance.filter((a) => a.accessGranted).length;
  const deniedEntries = attendance.filter((a) => !a.accessGranted).length;
  const acceptedSessions = sessions.filter((s) => s.status === 'Accepted').length;

  return (
    <>
      <div className="page-title">
        <h1>Instructor Dashboard</h1>
        <p>
          Welcome back, {user?.firstName} {user?.lastName}
          {profile?.age != null && ` · Age: ${profile.age}`}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Valid Entries Today</div>
          <div className="stat-card__value">{grantedEntries}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Denied Scans Today</div>
          <div className="stat-card__value">{deniedEntries}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Accepted Sessions</div>
          <div className="stat-card__value">{acceptedSessions}</div>
        </div>
      </div>

      <div className="card card--interactive session-request-panel">
        <div className="dashboard-header">
          <div>
            <h3>Member plans</h3>
            <p>Build personalized workout and meal plans for members based on their goals.</p>
          </div>
          <Link to="/instructor/plans" className="btn btn--primary">
            Manage plans
          </Link>
        </div>
      </div>

      <div className="card card--interactive session-request-panel">
        <div className="dashboard-header">
          <div>
            <h3>Request a session</h3>
            <p>Submit a specialized VIP session for management approval.</p>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => setModalOpen(true)}>
            Request a session
          </button>
        </div>
        <p className="session-card__meta">
          Pending requests: {sessions.filter((s) => s.status === 'Pending').length} ·{' '}
          <Link to="/instructor/sessions">View all session requests</Link>
        </p>
      </div>

      <div className="card">
        <div className="dashboard-header">
          <h3>Recent Entry Scans</h3>
          <Link to="/instructor/attendance" className="btn btn--outline btn--sm">View All</Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Person</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 5).map((log) => (
                  <tr key={log.attendanceLogId}>
                    <td>{formatAppTime(log.loggedAt)}</td>
                    <td>{log.memberName ?? log.instructorName ?? 'Unknown'}</td>
                    <td>
                      <span className={`badge ${log.accessGranted ? 'badge--success' : 'badge--error'}`}>
                        {log.accessGranted ? 'Granted' : 'Denied'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SessionRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (data) => {
          await sessionService.createRequest(data);
          await loadSessions();
        }}
      />
    </>
  );
}
