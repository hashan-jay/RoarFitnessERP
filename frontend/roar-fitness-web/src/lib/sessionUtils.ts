import type { SpecialSession } from '../types';

export function isSessionExpired(session: SpecialSession): boolean {
  return session.runtimeStatus === 'Expired';
}
