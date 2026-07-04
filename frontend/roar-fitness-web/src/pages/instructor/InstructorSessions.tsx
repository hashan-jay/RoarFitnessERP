/**
 * List of submitted special-session requests with status and enrolled members.
 * Role: Instructor.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sessionService } from '../../services';
import { LoadingSpinner } from '../../components/common';
import { SessionCard, formatSessionRange } from '../../components/SessionCard';
import type { SpecialSession } from '../../types';

export function InstructorSessions() {
  const [sessions, setSessions] = useState<SpecialSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    sessionService.getInstructorSessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-title">
        <h1>My Session Requests</h1>
        <p>Track pending, accepted, and rejected session requests.</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : sessions.length === 0 ? (
        <div className="card">
          <p>No session requests yet.</p>
          <Link to="/instructor" className="btn btn--primary btn--sm">Request a session</Link>
        </div>
      ) : (
        <div className="grid grid--2">
          {sessions.map((session) => (
            <div key={session.sessionId}>
              <SessionCard
                session={session}
                action={
                  session.status === 'Accepted' ? (
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() => setExpandedId(expandedId === session.sessionId ? null : session.sessionId)}
                    >
                      {expandedId === session.sessionId ? 'Hide members' : `View members (${session.enrolledCount})`}
                    </button>
                  ) : (
                    <span className="badge">{session.status}</span>
                  )
                }
              />
              {expandedId === session.sessionId && session.enrollments && (
                <div className="card session-enrollments">
                  <h4>Enrolled members</h4>
                  {session.enrollments.length === 0 ? (
                    <p>No members enrolled yet.</p>
                  ) : (
                    <ul>
                      {session.enrollments.map((enrollment) => (
                        <li key={enrollment.memberId}>
                          {enrollment.memberName} · {enrollment.email}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="session-card__meta">{formatSessionRange(session.startDateTime, session.endDateTime)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
