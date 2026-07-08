import { formatAppDate } from './datetime'

export {
  formatAppDate,
  formatAppDateTime,
  formatAppClock,
  formatAppClockDate,
  formatAppMonthYear,
  formatAppMonthYearFromParts,
  formatAppTime,
  formatSessionRange,
  calculateAgeFromDateOfBirth,
  toDateInputValue,
  getAppToday,
  getAppTodayInputValue,
  getColomboDayOfWeek,
  getDaysInColomboMonth,
  isSameColomboDay,
  APP_TIME_ZONE,
} from './datetime'

export function formatCurrency(amount: number | null | undefined): string {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateStr: string): string {
  return formatAppDate(dateStr)
}
