const API_BASE = import.meta.env.VITE_API_URL ?? '/api';
const TOKEN_KEY = 'roar_fp_sim_token';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function onUnauthorized(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

function handleUnauthorized(): void {
  clearToken();
  unauthorizedHandler?.();
}

async function request<T>(
  endpoint: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = 'GET', body, auth = false } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError('Sign in as admin to continue.', 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      /* ignore */
    }

    if (response.status === 401 && auth) {
      handleUnauthorized();
      message = 'Session expired or invalid. Sign in again as admin.';
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, auth = false) => request<T>(path, { auth }),
  post: <T>(path: string, body: unknown, auth = false) =>
    request<T>(path, { method: 'POST', body, auth }),
};

export async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export function formatApiError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Session expired or invalid. Sign in again as admin.';
    if (err.status === 403) return 'Admin access required for this action.';
    return err.message || fallback;
  }
  return fallback;
}
