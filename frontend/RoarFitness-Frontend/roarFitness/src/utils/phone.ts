const PHONE_DIGITS_MIN = 8
const PHONE_DIGITS_MAX = 15

/** Strip to digits and optional leading + */
export function normalizePhoneInput(value: string): string {
  const trimmed = value.trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  return hasPlus ? `+${digits}` : digits
}

/**
 * Lightweight international display formatting.
 * Groups digits after country code for readability (e.g. +94 77 123 4567).
 */
export function formatInternationalPhone(value: string): string {
  const normalized = normalizePhoneInput(value)
  if (!normalized) return ''

  if (normalized.startsWith('+')) {
    const digits = normalized.slice(1)
    if (digits.length <= 2) return `+${digits}`
    if (digits.length <= 5) return `+${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 8) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
    }
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`
  }

  if (normalized.length <= 3) return normalized
  if (normalized.length <= 6) return `${normalized.slice(0, 3)} ${normalized.slice(3)}`
  if (normalized.length <= 9) {
    return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6)}`
  }
  return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 10)} ${normalized.slice(10)}`
}

export function validatePhone(value: string): string | undefined {
  const normalized = normalizePhoneInput(value)
  const digitCount = normalized.replace(/\D/g, '').length

  if (!normalized) {
    return 'Phone number is required.'
  }

  if (digitCount < PHONE_DIGITS_MIN || digitCount > PHONE_DIGITS_MAX) {
    return 'Enter a valid phone number (8–15 digits).'
  }

  return undefined
}
