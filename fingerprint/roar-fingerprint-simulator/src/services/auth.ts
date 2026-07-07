import { ApiError, api, clearToken, getToken, setToken } from '../api/client';

export interface AdminSession {
  email: string;
  fullName: string;
  roles: string[];
}

function readToken(payload: { token?: string; Token?: string }): string | null {
  const token = payload.token ?? payload.Token;
  return typeof token === 'string' && token.length > 0 ? token : null;
}

function readRoles(payload: { roles?: string[]; Roles?: string[] }): string[] {
  const roles = payload.roles ?? payload.Roles;
  return Array.isArray(roles) ? roles : [];
}

function assertAdminRole(roles: string[]): void {
  if (!roles.some((role) => role.toLowerCase() === 'admin')) {
    clearToken();
    throw new ApiError('Admin account required. Sign in with admin credentials.', 403);
  }
}

export async function loginAdmin(email: string, password: string): Promise<AdminSession> {
  const data = await api.post<{ token?: string; Token?: string; roles?: string[]; Roles?: string[]; email?: string; Email?: string; fullName?: string; FullName?: string }>(
    '/authentication/login',
    { email, password }
  );

  const token = readToken(data);
  if (!token) {
    throw new ApiError('Login succeeded but no token was returned.', 500);
  }

  const roles = readRoles(data);
  assertAdminRole(roles);

  setToken(token);
  return {
    email: data.email ?? data.Email ?? email,
    fullName: data.fullName ?? data.FullName ?? 'Admin',
    roles,
  };
}

export async function restoreSession(): Promise<AdminSession | null> {
  if (!getToken()) return null;

  try {
    const data = await api.get<{
      email?: string;
      Email?: string;
      fullName?: string;
      FullName?: string;
      roles?: string[];
      Roles?: string[];
    }>('/authentication/me', true);

    const roles = readRoles(data);
    assertAdminRole(roles);

    return {
      email: data.email ?? data.Email ?? '',
      fullName: data.fullName ?? data.FullName ?? 'Admin',
      roles,
    };
  } catch {
    clearToken();
    return null;
  }
}

export function logoutAdmin(): void {
  clearToken();
}
