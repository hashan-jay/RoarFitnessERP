/** Sri Lanka / IST display timezone (UTC+5:30) used across all portals. */
export const APP_TIME_ZONE = 'Asia/Colombo';
export const APP_TIME_ZONE_LABEL = 'GMT+5:30';

const dateFormatter = new Intl.DateTimeFormat('en-LK', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const monthYearFormatter = new Intl.DateTimeFormat('en-LK', {
  timeZone: APP_TIME_ZONE,
  month: 'long',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-LK', {
  timeZone: APP_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-LK', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

const clockFormatter = new Intl.DateTimeFormat('en-LK', {
  timeZone: APP_TIME_ZONE,
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

function parseDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function getColomboDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === 'year')?.value ?? 0);
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? 0);
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? 0);
  return { year, month, day };
}

export function formatAppDate(value: string | Date): string {
  return dateFormatter.format(parseDate(value));
}

export function formatAppTime(value: string | Date): string {
  return timeFormatter.format(parseDate(value));
}

export function formatAppDateTime(value: string | Date): string {
  return `${dateTimeFormatter.format(parseDate(value))} (${APP_TIME_ZONE_LABEL})`;
}

export function formatAppMonthYear(value: string | Date): string {
  return monthYearFormatter.format(parseDate(value));
}

export function formatAppClock(value: Date = new Date()): string {
  return `${clockFormatter.format(value)} (${APP_TIME_ZONE_LABEL})`;
}

export function formatSessionRange(start: string, end: string): string {
  return `${formatAppDate(start)} ${formatAppTime(start)} – ${formatAppTime(end)} (${APP_TIME_ZONE_LABEL})`;
}

export function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  const { year, month, day } = getColomboDateParts(parseDate(value));
  if (!year || !month || !day) return '';
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function calculateAgeFromDateOfBirth(value?: string | null): number | null {
  if (!value) return null;

  const dob = getColomboDateParts(parseDate(value));
  const today = getColomboDateParts(new Date());
  if (!dob.year || !dob.month || !dob.day) return null;

  let age = today.year - dob.year;
  const hadBirthday =
    today.month > dob.month || (today.month === dob.month && today.day >= dob.day);
  if (!hadBirthday) age -= 1;

  return age >= 0 ? age : null;
}
