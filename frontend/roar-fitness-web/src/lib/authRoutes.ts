import type { UserRole } from '../types';

/** Default dashboard route for the user's highest-priority role. */
export function getDashboardPath(roles: UserRole[]): string {
  if (roles.includes('Admin')) return '/admin';
  if (roles.includes('Instructor')) return '/instructor';
  if (roles.includes('Member')) return '/member';
  return '/';
}
