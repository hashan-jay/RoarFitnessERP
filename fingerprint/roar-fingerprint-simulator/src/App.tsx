import { useEffect, useState } from 'react';
import { checkApiHealth, getToken, onUnauthorized } from './api/client';
import { loginAdmin, logoutAdmin, restoreSession, type AdminSession } from './services/auth';
import { EnrollPanel } from './components/EnrollPanel';
import { GateScanPanel } from './components/GateScanPanel';
import { LogsPanel } from './components/LogsPanel';
import './styles.css';

type Tab = 'gate' | 'enroll' | 'logs';

export function App() {
  const [tab, setTab] = useState<Tab>('gate');
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [sessionReady, setSessionReady] = useState(!getToken());
  const [email, setEmail] = useState('admin@roarfitness.lk');
  const [password, setPassword] = useState('Admin@123');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const loggedIn = session !== null;

  useEffect(() => {
    onUnauthorized(() => {
      setSession(null);
      setSessionReady(true);
    });
    return () => onUnauthorized(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!getToken()) {
        setSessionReady(true);
        return;
      }

      const restored = await restoreSession();
      if (cancelled) return;

      setSession(restored);
      setSessionReady(true);
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      const online = await checkApiHealth();
      if (cancelled) return;
      setApiOnline(online);
      timer = setTimeout(poll, online ? 15000 : 60000);
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const nextSession = await loginAdmin(email, password);
      setSession(nextSession);
      setSessionReady(true);
    } catch (err) {
      setSession(null);
      setLoginError(
        err instanceof Error && err.message
          ? err.message
          : 'Login failed. Use admin credentials and ensure the API is running.'
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setSession(null);
  };

  return (
    <div className="sim-app">
      <header className="sim-header">
        <div className="sim-header__brand">
          <span className="sim-header__logo">R</span>
          <div>
            <h1>Fingerprint Simulator</h1>
            <p>Roar Fitness ERP — biometric gate &amp; enrollment testing</p>
          </div>
        </div>
        <div className="sim-header__status">
          <span className={`status-dot ${apiOnline ? 'status-dot--ok' : 'status-dot--err'}`} />
          API {apiOnline === null ? 'checking…' : apiOnline ? 'online' : 'offline'}
        </div>
      </header>

      {apiOnline === false && (
        <div className="alert alert--error sim-api-banner">
          Backend API is offline. Start it with <code>backend\RoarFitnessERP.Api\run-api.cmd</code> or run{' '}
          <code>start-dev.cmd</code> from the project root, then refresh this page.
        </div>
      )}

      <div className="sim-layout">
        <aside className="sim-sidebar">
          <nav className="sim-nav">
            <button
              type="button"
              className={tab === 'gate' ? 'sim-nav__item sim-nav__item--active' : 'sim-nav__item'}
              onClick={() => setTab('gate')}
            >
              Gate Scan
            </button>
            <button
              type="button"
              className={tab === 'enroll' ? 'sim-nav__item sim-nav__item--active' : 'sim-nav__item'}
              onClick={() => setTab('enroll')}
            >
              Enroll Fingerprint
            </button>
            <button
              type="button"
              className={tab === 'logs' ? 'sim-nav__item sim-nav__item--active' : 'sim-nav__item'}
              onClick={() => setTab('logs')}
            >
              Today&apos;s Logs
            </button>
          </nav>

          <div className="sim-auth card">
            <h3>Admin session</h3>
            <p className="sim-auth__hint">Required for enrollment and viewing logs.</p>
            {!sessionReady ? (
              <p className="muted">Checking session…</p>
            ) : loggedIn && session ? (
              <>
                <p className="sim-auth__ok">
                  Signed in as {session.fullName}
                  <br />
                  <span className="muted">{session.email}</span>
                </p>
                <button type="button" className="btn btn--outline btn--block" onClick={handleLogout}>
                  Sign out
                </button>
              </>
            ) : (
              <form onSubmit={handleLogin}>
                {loginError && <p className="alert alert--error">{loginError}</p>}
                <label>
                  Email
                  <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>
                <button type="submit" className="btn btn--primary btn--block" disabled={loggingIn || !apiOnline}>
                  {loggingIn ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            )}
          </div>

          <div className="sim-help card">
            <h3>How it works</h3>
            <ol>
              <li>Enroll: pick a member, generate a unique fingerprint PIN, save to ERP.</li>
              <li>Gate: select that PIN and scan to record entry attendance.</li>
              <li>Each PIN maps to exactly one person in the database.</li>
            </ol>
          </div>
        </aside>

        <main className="sim-main">
          {tab === 'gate' && <GateScanPanel apiOnline={!!apiOnline} sessionReady={sessionReady} loggedIn={loggedIn} />}
          {tab === 'enroll' && (
            <EnrollPanel loggedIn={loggedIn} sessionReady={sessionReady} apiOnline={!!apiOnline} />
          )}
          {tab === 'logs' && <LogsPanel loggedIn={loggedIn} sessionReady={sessionReady} apiOnline={!!apiOnline} />}
        </main>
      </div>
    </div>
  );
}
