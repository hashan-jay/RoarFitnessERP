import { useEffect, useState } from 'react'

import { formatAppClock, formatAppClockDate } from '../../lib/formatters'

export function PortalClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <p
      className="text-xs tabular-nums text-portal-muted"
      aria-live="polite"
      aria-label="Current date and time"
    >
      <span className="font-semibold text-portal-ink">{formatAppClock(now)}</span>
      <span className="mx-1.5 text-portal-line" aria-hidden="true">
        ·
      </span>
      <span>{formatAppClockDate(now)}</span>
    </p>
  )
}