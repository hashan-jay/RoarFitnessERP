/**
 * Route guard that requires authentication and optionally restricts access by
 * user role. Redirects unauthenticated users to login with return path.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../lib/authRoutes';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role: send to the dashboard matching the user's highest privilege.
  if (allowedRoles && !allowedRoles.some((role) => hasRole(role))) {
    return <Navigate to={getDashboardPath(user.roles)} replace />;
  }

  return <>{children}</>;
}
