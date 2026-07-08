import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { useGlobalLoading } from '../../context/LoadingContext'

/** Minimum time the route loader stays visible so the fade-in is perceptible. */
const ROUTE_LOADING_MS = 160

function isPublicWebsiteRoute(pathname: string): boolean {
  return !pathname.startsWith('/dashboard')
}

/**
 * Shows the global loader on public-site route changes only (not admin/member/instructor dashboards).
 */
export function RouteLoadingObserver() {
  const location = useLocation()
  const { startLoading, stopLoading } = useGlobalLoading()

  useEffect(() => {
    if (!isPublicWebsiteRoute(location.pathname)) {
      return
    }

    startLoading()
    let active = true

    const timer = window.setTimeout(() => {
      if (active) stopLoading()
    }, ROUTE_LOADING_MS)

    return () => {
      active = false
      window.clearTimeout(timer)
      stopLoading()
    }
  }, [location.key, location.pathname, startLoading, stopLoading])

  return null
}
