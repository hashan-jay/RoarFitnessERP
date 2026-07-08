export type UserRole = 'admin' | 'instructor' | 'member'

export interface AuthUser {
  userId?: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
  planId?: string
  planName?: string
}
