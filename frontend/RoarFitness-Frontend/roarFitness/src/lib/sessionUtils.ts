import type { SpecialSession } from '../types/api'

export function isSessionExpired(session: SpecialSession): boolean {
  return session.runtimeStatus === 'Expired'
}
