import { formatAppDate } from './datetime';

export {
  formatAppClock,
  formatAppDate,
  formatAppDateTime,
  formatAppMonthYear,
  formatAppTime,
  formatSessionRange,
  calculateAgeFromDateOfBirth,
  toDateInputValue,
  APP_TIME_ZONE,
  APP_TIME_ZONE_LABEL,
} from './datetime';

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
