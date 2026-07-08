import { api } from './apiClient'

export interface LoginApiResponse {
  token: string
  email: string
  fullName: string
  roles: string[]
  userId: number
}

export const authService = {
  login: (data: { email: string; password: string }) =>
    api.post<LoginApiResponse>('/authentication/login', data),

  me: () =>
    api.get<{
      userId: number
      email: string
      fullName: string
      roles: string[]
    }>('/authentication/me', true),
}
