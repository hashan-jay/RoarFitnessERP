/**
 * Member home screen showing membership status, fingerprint activation state,
 * and shortcuts to plans and sessions. Role: Member.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { memberService } from '../../services';
import { LoadingSpinner } from '../../components/common';
import { formatDate } from '../../lib/formatters';
import type { MemberProfile } from '../../types';

const fallbackProfile: MemberProfile = {
  memberId: 1,
  identificationNumber: 'RFMEM0000001',
  isFingerprintActivated: false,
  membership: {
    packageName: 'Starter Monthly',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    isActive: true,
  },
};

export function MemberDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    memberService
      .getProfile()
      .then(setProfile)
      .catch(() => setProfile(fallbackProfile))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="page-title">
        <h1>Welcome, {user?.firstName}!</h1>
        <p>
          Member ID: {profile?.identificationNumber}
          {profile?.age != null && ` · Age: ${profile.age}`}
        </p>
      </div>

      {!profile?.isFingerprintActivated && (
        <div className="fingerprint-notice">
          <div className="fingerprint-notice__icon">👆</div>
          <div>
            <h3>Fingerprint Activation Required</h3>
            <p>
              Your gym access fingerprint has not been activated yet. Please visit the front
              desk during your next visit to complete biometric enrollment. Bring a valid ID.
            </p>
            <p style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Your fingerprint is scanned once at the gym entrance to verify membership and record attendance.
            </p>
          </div>
        </div>
      )}

      {profile?.isFingerprintActivated && (
        <div className="alert alert--success" style={{ marginBottom: 'var(--spacing-xl)' }}>
          Fingerprint activated on {profile.fingerprintActivatedAt ? formatDate(profile.fingerprintActivatedAt) : 'N/A'}. You have full gym access.
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Membership</div>
          <div className="stat-card__value" style={{ fontSize: '1.25rem' }}>
            {profile?.membership?.packageName ?? 'None'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Status</div>
          <div className="stat-card__value" style={{ fontSize: '1.25rem' }}>
            {profile?.membership?.isActive ? (
              <span className="badge badge--success">Active</span>
            ) : (
              <span className="badge badge--error">Inactive</span>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Expires</div>
          <div className="stat-card__value" style={{ fontSize: '1.25rem' }}>
            {profile?.membership?.endDate ? formatDate(profile.membership.endDate) : '—'}
          </div>
        </div>
      </div>

      <div className="grid grid--2">
        <div className="card">
          <h3>My Plans</h3>
          <p>View personalized workout and meal plans from your instructor.</p>
          <Link to="/member/plans" className="btn btn--primary" style={{ marginTop: 'var(--spacing-md)' }}>
            View plans
          </Link>
        </div>
        <div className="card">
          <h3>Special Sessions</h3>
          <p>Book instructor-led VIP sessions and pay online to secure your spot.</p>
          <Link to="/member/sessions" className="btn btn--primary" style={{ marginTop: 'var(--spacing-md)' }}>
            Browse sessions
          </Link>
        </div>
      </div>
    </>
  );
}
