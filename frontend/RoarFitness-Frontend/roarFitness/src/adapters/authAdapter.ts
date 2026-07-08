import type { AuthUser, UserRole } from '../types/auth'

function mapRole(roles: string[]): UserRole {
  if (roles.includes('Admin')) return 'admin'
  if (roles.includes('Instructor')) return 'instructor'
  return 'member'
}

export function mapApiUserToAuthUser(input: {
  userId: number
  email: string
  fullName: string
  roles: string[]
  planName?: string
  planId?: string
}): AuthUser {
  const [firstName, ...rest] = input.fullName.split(' ')
  return {
    userId: input.userId,
    email: input.email,
    firstName: firstName || input.email,
    lastName: rest.join(' ') || firstName || '',
    role: mapRole(input.roles),
    planId: input.planId,
    planName: input.planName,
  }
}
