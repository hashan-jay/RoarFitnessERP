/** Digits only, max 16, spaced in groups of 4: `4242 4242 4242 4242` */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

/** MM/YY as the user types */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)

  if (digits.length === 0) return ''

  let month = digits.slice(0, 2)
  if (digits.length === 1 && Number(month) > 1) {
    month = `0${month}`
  }
  if (month.length === 2) {
    const monthNum = Number(month)
    if (monthNum === 0) month = '01'
    if (monthNum > 12) month = '12'
  }

  const year = digits.slice(2, 4)
  if (digits.length <= 2) return month
  return `${month}/${year}`
}

/** 3–4 digit CVV */
export function formatCvv(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4)
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown'

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, '')
  if (/^4/.test(digits)) return 'visa'
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard'
  if (/^3[47]/.test(digits)) return 'amex'
  return 'unknown'
}

export function isValidExpiry(expiry: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry)
  if (!match) return false

  const month = Number(match[1])
  const year = Number(match[2])
  if (month < 1 || month > 12) return false

  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1

  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false
  return true
}
