import { ApiError, membershipService } from '../../services'
import type { RegisterFormValues } from './registerValidation'

export interface RegisterResult {
  success: boolean
  message?: string
  memberId?: number
  packageId?: number
}

export async function validateRegistrationEmail(email: string): Promise<RegisterResult> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) {
    return { success: false, message: 'Email is required.' }
  }
  return { success: true }
}

export async function registerUser(
  values: RegisterFormValues,
  packageId: number,
): Promise<RegisterResult> {
  try {
    const registration = await membershipService.register({
      email: values.email.trim(),
      password: values.password,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim() || undefined,
      nicNumber: values.nicNumber.trim() || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      gender: values.gender || undefined,
      addressLine1: values.address.trim() || undefined,
      city: 'Colombo',
      packageId,
    })

    return {
      success: true,
      memberId: registration.memberId,
      packageId: registration.packageId,
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return {
        success: false,
        message: error.message.toLowerCase().includes('email')
          ? 'An account with this email already exists.'
          : error.message,
      }
    }

    return {
      success: false,
      message: 'Registration failed. Ensure the API is running and try again.',
    }
  }
}
