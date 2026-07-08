import { mapApiUserToAuthUser } from '../../adapters/authAdapter'
import { ApiError, authService, setToken } from '../../services'
import type { AuthUser } from '../../types/auth'
import type { LoginFormValues } from './loginValidation'

export interface LoginResult {
  success: boolean
  message?: string
  user?: AuthUser
}

export async function authenticateUser(values: LoginFormValues): Promise<LoginResult> {
  try {
    const response = await authService.login({
      email: values.email.trim(),
      password: values.password,
    })
    setToken(response.token)
    return {
      success: true,
      user: mapApiUserToAuthUser(response),
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof ApiError
          ? error.message
          : 'Invalid email or password. Please try again.',
    }
  }
}
