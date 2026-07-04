/**
 * Live portal clock shown in member, instructor, and admin dashboards (GMT+5:30).
 */
import { useEffect, useState } from 'react';
import { formatAppClock } from '../lib/datetime';

export function PortalClock() {
  const [nowLabel, setNowLabel] = useState(() => formatAppClock());

  useEffect(() => {
    const timer = window.setInterval(() => setNowLabel(formatAppClock()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="portal-clock" aria-live="polite">
      <span className="portal-clock__label">Portal Time</span>
      <strong>{nowLabel}</strong>
    </div>
  );
}
