import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { dashboardPath, ROUTES } from '../../routes/paths'
import type { UserRole } from '../../types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPath(user.role)} replace />
  }

  return children
}
