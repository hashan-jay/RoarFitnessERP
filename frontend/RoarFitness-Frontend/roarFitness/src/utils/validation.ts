import { isAdultFromDateOfBirth } from '../lib/datetime'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Minimum password rules for client-side validation */
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_HAS_LETTER = /[A-Za-z]/
const PASSWORD_HAS_NUMBER = /\d/
const PASSWORD_HAS_SPECIAL = /[^A-Za-z0-9]/
const NAME_HAS_NUMBERS = /\d/
const NAME_MIN_LENGTH = 2

export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordStrengthResult {
  score: number
  level: PasswordStrengthLevel
  percent: number
  label: string
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function validateName(value: string, fieldLabel: string): string | undefined {
  const name = value.trim()

  if (!name) {
    return `${fieldLabel} is required.`
  }

  if (name.length < NAME_MIN_LENGTH) {
    return `${fieldLabel} must be at least ${NAME_MIN_LENGTH} characters.`
  }

  if (NAME_HAS_NUMBERS.test(name)) {
    return `${fieldLabel} cannot include numbers.`
  }

  return undefined
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: 0, level: 'weak', percent: 0, label: 'Enter a password' }
  }

  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (PASSWORD_HAS_LETTER.test(password)) score += 1
  if (PASSWORD_HAS_NUMBER.test(password)) score += 1
  if (PASSWORD_HAS_SPECIAL.test(password)) score += 1

  const capped = Math.min(score, 4)
  const levels: PasswordStrengthLevel[] = ['weak', 'fair', 'good', 'strong']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const level = levels[Math.max(0, capped - 1)] ?? 'weak'

  return {
    score: capped,
    level,
    percent: (capped / 4) * 100,
    label: labels[Math.max(0, capped - 1)] ?? 'Weak',
  }
}

export function validatePassword(value: string): string | undefined {
  const password = value

  if (!password) {
    return 'Password is required.'
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
  }

  if (!PASSWORD_HAS_LETTER.test(password)) {
    return 'Password must include at least one letter.'
  }

  if (!PASSWORD_HAS_NUMBER.test(password)) {
    return 'Password must include at least one number.'
  }

  return undefined
}

export function validateRequiredEmail(value: string): string | undefined {
  const email = value.trim()

  if (!email) {
    return 'Email is required.'
  }

  if (!isValidEmail(email)) {
    return 'Enter a valid email address.'
  }

  return undefined
}

export function validateDateOfBirth(value: string): string | undefined {
  if (!value.trim()) {
    return 'Date of birth is required.'
  }

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return 'Enter a valid date of birth.'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date > today) {
    return 'Date of birth cannot be in the future.'
  }

  return undefined
}

export function validateRequiredAddress(value: string): string | undefined {
  const address = value.trim()

  if (!address) {
    return 'Address is required.'
  }

  return undefined
}

export function validateNicNumber(
  value: string,
  dateOfBirth: string,
): string | undefined {
  const nic = value.trim()
  const required = isAdultFromDateOfBirth(dateOfBirth)

  if (required && !nic) {
    return 'NIC is required for members aged 18 and over.'
  }

  if (nic && nic.length < 9) {
    return 'Enter a valid NIC number.'
  }

  return undefined
}
