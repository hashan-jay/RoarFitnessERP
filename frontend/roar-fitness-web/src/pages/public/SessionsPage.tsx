/**
 * Static VIP session types for the public website.
 */
import { Link } from 'react-router-dom';
import { PageHero } from '../../components/PageHero';
import { Stagger, StaggerItem } from '../../components/motion';
import { PUBLIC_VIP_SESSIONS } from '../../data/publicContent';

export function SessionsPage() {
  return (
    <>
      <PageHero
        eyebrow="VIP SESSIONS"
        title="Instructor-led sessions"
        description="Explore our signature VIP session formats. Members can book and pay through the member portal."
      />

      <section className="section">
        <div className="container">
          <Stagger className="grid grid--3">
            {PUBLIC_VIP_SESSIONS.map((session) => (
              <StaggerItem key={session.id}>
                <article className="card vip-session-card card--interactive">
                  <p className="vip-session-card__eyebrow">VIP SESSION</p>
                  <h3>{session.title}</h3>
                  <p className="vip-session-card__desc">{session.description}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="card" style={{ marginTop: 'var(--spacing-2xl)', textAlign: 'center' }}>
            <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-muted)' }}>
              Ready to join a session? Sign in as a member to view live schedules and enroll.
            </p>
            <Link to="/login" className="btn btn--primary btn--arrow">Member Login</Link>
          </div>
        </div>
      </section>
    </>
  );
}
