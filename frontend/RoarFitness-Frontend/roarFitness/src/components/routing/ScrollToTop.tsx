import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { ROUTES } from '../../routes/paths'

/** Home routes that scroll to an in-page section via ScrollToSection. */
const HOME_SECTION_PATHS = new Set<string>([
  ROUTES.home,
  ROUTES.plans,
  ROUTES.trainers,
  ROUTES.contact,
])

/** Resets window scroll on full-page navigations (e.g. home → /classes). */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    if (HOME_SECTION_PATHS.has(pathname)) {
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
