/**
 * Card displaying a special session's schedule, fee, capacity, and optional
 * action slot (enroll, approve, etc.).
 */
import type { SpecialSession } from '../types';
import { formatCurrency, formatDate, formatAppTime, formatSessionRange } from './common';

interface SessionCardProps {
  session: SpecialSession;
  action?: React.ReactNode;
  muted?: boolean;
}

export function SessionCard({ session, action, muted }: SessionCardProps) {
  return (
    <div className={`card session-card ${muted ? 'session-card--expired' : ''}`}>
      <div className="session-card__header">
        <div>
          <span className={`badge session-card__status session-card__status--${session.runtimeStatus.toLowerCase()}`}>
            {session.runtimeStatus}
          </span>
          <h3>{session.title}</h3>
          <p className="session-card__instructor">{session.instructorName}</p>
        </div>
        <div className="session-card__fee">{formatCurrency(session.feePerPersonLKR)}</div>
      </div>
      <p className="session-card__desc">{session.description}</p>
      <div className="session-card__meta">
        <span>{formatDate(session.startDateTime)} · {formatAppTime(session.startDateTime)} – {formatAppTime(session.endDateTime)}</span>
        <span>{session.enrolledCount}/{session.maxParticipants} enrolled · {session.spotsRemaining} spots left</span>
      </div>
      {action}
    </div>
  );
}

export { formatSessionRange };

export function isSessionExpired(session: SpecialSession) {
  return session.runtimeStatus === 'Expired';
}
