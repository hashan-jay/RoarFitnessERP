import { validatePhone } from '../../utils/phone'
import {
  validateDateOfBirth,
  validateName,
  validateNicNumber,
  validatePassword,
  validateRequiredAddress,
  validateRequiredEmail,
} from '../../utils/validation'
import { isAdultFromDateOfBirth } from '../../lib/datetime'
import type { GenderValue } from './constants'

export interface RegisterFormValues {
  firstName: string
  lastName: string
  dateOfBirth: string
  nicNumber: string
  gender: GenderValue | ''
  email: string
  phone: string
  address: string
  password: string
  confirmPassword: string
}

export type RegisterFormField = keyof RegisterFormValues

export type RegisterFormErrors = Partial<Record<RegisterFormField | 'form', string>>

export function validateRegisterField(
  field: RegisterFormField,
  values: RegisterFormValues,
): string | undefined {
  switch (field) {
    case 'firstName':
      return validateName(values.firstName, 'First name')
    case 'lastName':
      return validateName(values.lastName, 'Last name')
    case 'dateOfBirth':
      return validateDateOfBirth(values.dateOfBirth)
    case 'nicNumber':
      return validateNicNumber(values.nicNumber, values.dateOfBirth)
    case 'email':
      return validateRequiredEmail(values.email)
    case 'phone':
      return validatePhone(values.phone)
    case 'address':
      return validateRequiredAddress(values.address)
    case 'gender':
      return values.gender ? undefined : 'Please select a gender.'
    case 'password':
      return validatePassword(values.password)
    case 'confirmPassword':
      if (!values.confirmPassword.trim()) return 'Please confirm your password.'
      if (values.confirmPassword !== values.password) {
        return 'Passwords do not match.'
      }
      return undefined
    default:
      return undefined
  }
}

export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors {
  const fields: RegisterFormField[] = [
    'firstName',
    'lastName',
    'dateOfBirth',
    'nicNumber',
    'gender',
    'email',
    'phone',
    'address',
    'password',
    'confirmPassword',
  ]

  const errors: RegisterFormErrors = {}

  for (const field of fields) {
    const message = validateRegisterField(field, values)
    if (message) errors[field] = message
  }

  return errors
}

export function getRegisterNicLabel(dateOfBirth: string): string {
  if (!dateOfBirth.trim()) return 'NIC'
  return isAdultFromDateOfBirth(dateOfBirth) ? 'NIC' : '(optional) NIC'
}
