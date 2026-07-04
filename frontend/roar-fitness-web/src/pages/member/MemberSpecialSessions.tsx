/**
 * Browse and enroll in instructor-led special sessions. Enrollment redirects
 * to the payment gateway. Role: Member.
 */
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { sessionService, paymentService, ApiError } from '../../services';
import { LoadingSpinner } from '../../components/common';
import { SessionCard } from '../../components/SessionCard';
import { isSessionExpired } from '../../lib/sessionUtils';
import type { SpecialSession } from '../../types';

type MemberTab = 'all' | 'mine';

export function MemberSpecialSessions() {
  const [tab, setTab] = useState<MemberTab>('all');
  const [available, setAvailable] = useState<SpecialSession[]>([]);
  const [mine, setMine] = useState<SpecialSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const location = useLocation();

  // Restore payment success message when returning from mock checkout redirect.
  useEffect(() => {
    const state = location.state as { message?: string; tab?: MemberTab } | null;
    if (state?.message) setSuccess(state.message);
    if (state?.tab) setTab(state.tab);
  }, [location.state]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [availableSessions, mySessions] = await Promise.all([
        sessionService.getAvailableSessions(),
        sessionService.getMySessions(),
      ]);
      setAvailable(availableSessions);
      setMine(mySessions);
    } catch {
      setError('Could not load special sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /** Initiate gateway checkout; user leaves the app until payment completes. */
  const handleEnroll = async (sessionId: number) => {
    setEnrollingId(sessionId);
    setError('');
    try {
      const payment = await paymentService.initSessionPayment(sessionId);
      window.location.href = payment.checkoutUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start enrollment payment.');
      setEnrollingId(null);
    }
  };

  const sessions = tab === 'all' ? available : mine;

  return (
    <>
      <div className="page-title">
        <h1>Special Sessions</h1>
        <p>Book instructor-led VIP sessions. Pay online to secure your spot.</p>
      </div>

      <div className="session-tabs">
        <button type="button" className={`session-tabs__btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          All Special Sessions
        </button>
        <button type="button" className={`session-tabs__btn ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>
          My Sessions
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : sessions.length === 0 ? (
        <div className="card">
          <p>{tab === 'all' ? 'No special sessions available right now.' : 'You have not enrolled in any sessions yet.'}</p>
        </div>
      ) : (
        <div className="grid grid--2">
          {sessions.map((session) => {
            const expired = isSessionExpired(session);
            return (
              <SessionCard
                key={session.sessionId}
                session={session}
                muted={tab === 'mine' && expired}
                action={
                  tab === 'all' ? (
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      disabled={enrollingId === session.sessionId || session.spotsRemaining <= 0}
                      onClick={() => handleEnroll(session.sessionId)}
                    >
                      {enrollingId === session.sessionId ? 'Redirecting...' : 'Enroll'}
                    </button>
                  ) : (
                    <span className="badge badge--success">Enrolled</span>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </>
  );
}
