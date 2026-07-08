/** Section element ids used for in-page scroll targets */
import type { UserRole } from '../types/auth'

export const SECTION_IDS = {
  home: 'home',
  about: 'about',
  plans: 'membership',
  trainers: 'trainers',
  contact: 'contact',
} as const

export const ROUTES = {
  home: '/',
  about: '/about',
  plans: '/plans',
  classes: '/classes',
  trainers: '/trainers',
  contact: '/contact',
  join: '/join',
  login: '/login',
  register: '/register',
  payment: '/payment',
  dashboard: '/dashboard',
  dashboardAdmin: '/dashboard/admin',
  dashboardInstructor: '/dashboard/instructor',
} as const

export function registerPath(planId: string): string {
  return `${ROUTES.register}?plan=${encodeURIComponent(planId)}`
}

export function joinPath(planId?: string): string {
  if (!planId) return ROUTES.join
  return `${ROUTES.join}?plan=${encodeURIComponent(planId)}`
}

export function dashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return ROUTES.dashboardAdmin
    case 'instructor':
      return ROUTES.dashboardInstructor
    default:
      return ROUTES.dashboard
  }
}
