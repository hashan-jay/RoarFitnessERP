/**
 * Shared UI primitives: loading/empty states and locale-aware formatters used
 * across all portals.
 */
import { formatAppDate } from '../lib/datetime';

export { formatAppClock, formatAppDate, formatAppDateTime, formatAppMonthYear, formatAppTime, formatSessionRange, calculateAgeFromDateOfBirth, toDateInputValue, APP_TIME_ZONE, APP_TIME_ZONE_LABEL } from '../lib/datetime';

export function LoadingSpinner() {
  return <div className="loading">Loading...</div>;
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty-state">{message}</div>;
}

export function formatCurrency(amount: number | null | undefined): string {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return formatAppDate(dateStr);
}
