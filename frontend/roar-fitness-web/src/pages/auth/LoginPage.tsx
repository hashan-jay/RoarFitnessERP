/**
 * Sign-in page for members, instructors, and admins. Redirects authenticated
 * users to their role-specific dashboard. Role: All authenticated roles.
 */
import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../lib/authRoutes';
import { ApiError } from '../../services';
import { easeSmooth, scaleInVariants } from '../../lib/motion';

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const successMessage =
    (location.state as { message?: string } | null)?.message ??
    (searchParams.get('payment') === 'success'
      ? 'Payment successful. Your membership is active — you can sign in now.'
      : '');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const success = successMessage;
  const [loading, setLoading] = useState(false);

  // Skip login form when session already exists; honor ?from redirect if present.
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from || getDashboardPath(user.roles), { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedInUser = await login({ email, password });
      navigate(from || getDashboardPath(loggedInUser.roles), { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.message.toLowerCase().includes('pending payment')) {
        setError(err.message);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <motion.div
        className="auth-card"
        initial="hidden"
        animate="visible"
        variants={scaleInVariants}
        transition={{ duration: 0.55, ease: easeSmooth }}
      >
        <div className="auth-card__header">
          <div className="auth-card__logo">ROAR | FITNESS</div>
          <h1>Sign in</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Access your member or staff account</p>
        </div>

        {success && <div className="alert alert--success">{success}</div>}
        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: '0.875rem' }}>
          Don&apos;t have an account? <Link to="/join" style={{ fontWeight: 600 }}>Join Now</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-sm)', fontSize: '0.875rem' }}>
          <Link to="/" style={{ color: 'var(--color-text-muted)' }}>Back to Home</Link>
        </p>
      </motion.div>
    </div>
  );
}
