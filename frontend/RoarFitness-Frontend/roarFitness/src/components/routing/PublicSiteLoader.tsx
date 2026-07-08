import { useLocation } from 'react-router-dom'

import { GlobalLoader } from '../common/GlobalLoader'
import { RouteLoadingObserver } from './RouteLoadingObserver'

function isPublicWebsiteRoute(pathname: string): boolean {
  return !pathname.startsWith('/dashboard')
}

/** Framer-motion route loader — public marketing site only, not dashboards. */
export function PublicSiteLoader() {
  const { pathname } = useLocation()

  if (!isPublicWebsiteRoute(pathname)) {
    return null
  }

  return (
    <>
      <RouteLoadingObserver />
      <GlobalLoader />
    </>
  )
}
