/**
 * Authentication API — login and current-user session validation.
 * API: /authentication (login is public; /me requires JWT).
 */
import { api } from './apiClient';

import type { LoginRequest } from '../types';

/** Shape returned by POST /authentication/login. */
export interface LoginApiResponse {
  token: string;
  email: string;
  fullName: string;
  roles: string[];
  userId: number;
}

/** Login and session validation used by AuthContext across all portals. */
export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginApiResponse>('/authentication/login', data),

  me: () =>
    api.get<{
      userId: number;
      email: string;
      fullName: string;
      roles: string[];
      memberId?: number;
      instructorId?: number;
      isFingerprintActivated?: boolean;
    }>('/authentication/me', true),
};
