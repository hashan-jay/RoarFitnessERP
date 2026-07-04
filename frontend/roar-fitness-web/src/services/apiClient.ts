/**
 * HTTP client and JWT token storage for all backend API calls.
 * Base URL from VITE_API_URL; attaches Bearer token when auth is requested.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const TOKEN_KEY = 'roar_fitness_token';

/** Reads the stored JWT from localStorage, or null if absent. */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Persists a JWT in localStorage for subsequent authenticated requests. */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Clears the stored JWT from localStorage. */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Structured error thrown when an API response is not ok. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }
    const message =
      typeof details === 'object' && details !== null && 'message' in details
        ? String((details as { message: string }).message)
        : typeof details === 'object' && details !== null && 'errors' in details
          ? Object.values((details as { errors: Record<string, string[]> }).errors)
              .flat()
              .join(' ') || `Request failed with status ${response.status}`
          : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Typed HTTP helpers (GET, POST, PUT, DELETE) against the backend API.
 * Pass `auth: true` to include the Bearer token from localStorage.
 */
export const api = {
  get: <T>(endpoint: string, auth = false) =>
    request<T>(endpoint, { method: 'GET', auth }),

  post: <T>(endpoint: string, body?: unknown, auth = false) =>
    request<T>(endpoint, { method: 'POST', body, auth }),

  put: <T>(endpoint: string, body?: unknown, auth = false) =>
    request<T>(endpoint, { method: 'PUT', body, auth }),

  delete: <T>(endpoint: string, auth = false) =>
    request<T>(endpoint, { method: 'DELETE', auth }),

  upload: async <T>(endpoint: string, formData: FormData, auth = true): Promise<T> => {
    const headers: Record<string, string> = {};
    if (auth) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let details: unknown;
      try {
        details = await response.json();
      } catch {
        details = await response.text();
      }
      const message =
        typeof details === 'object' && details !== null && 'message' in details
          ? String((details as { message: string }).message)
          : `Upload failed with status ${response.status}`;
      throw new ApiError(message, response.status, details);
    }

    return response.json() as Promise<T>;
  },
};

export { API_BASE_URL, TOKEN_KEY };
