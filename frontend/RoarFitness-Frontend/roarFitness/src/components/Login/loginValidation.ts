import {
  validatePassword,
  validateRequiredEmail,
} from '../../utils/validation'

export interface LoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

export type LoginFormErrors = Partial<
  Record<'email' | 'password' | 'form', string>
>

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {}

  const emailError = validateRequiredEmail(values.email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(values.password)
  if (passwordError) errors.password = passwordError

  return errors
}
