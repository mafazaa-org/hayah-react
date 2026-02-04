import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

interface PrivateRouteProps {
  children: ReactNode
}

/**
 * Wraps routes that require authentication.
 * If not authenticated, redirects to /login and stores the current location
 * so the user can be sent back after login.
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
