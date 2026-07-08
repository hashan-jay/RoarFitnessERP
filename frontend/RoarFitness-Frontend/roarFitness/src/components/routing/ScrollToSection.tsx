import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface ScrollToSectionProps {
  sectionId: string
}

export function ScrollToSection({ sectionId }: ScrollToSectionProps) {
  const location = useLocation()

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const element = document.getElementById(sectionId)
    element?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [location.pathname, sectionId])

  return null
}
