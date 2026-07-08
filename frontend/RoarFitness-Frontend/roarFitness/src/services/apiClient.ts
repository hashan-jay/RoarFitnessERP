/**
 * Central HTTP client for all backend calls.
 * - Single place for base URL, JSON serialization, and Bearer JWT attachment.
 * - Throws ApiError with server message so UI layers can show consistent toasts.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
const TOKEN_KEY = 'roar_fitness_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, headers: customHeaders, ...rest } = options
  const headers: Record<string, string> = {
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(customHeaders as Record<string, string>),
  }

  // Attach JWT only when auth=true — public routes must not send stale tokens.
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let details: unknown
    try {
      details = await response.json()
    } catch {
      details = await response.text()
    }
    const message =
      typeof details === 'object' && details !== null && 'message' in details
        ? String((details as { message: string }).message)
        : typeof details === 'object' && details !== null && 'errors' in details
          ? Object.values((details as { errors: Record<string, string[]> }).errors)
              .flat()
              .join(' ') || `Request failed with status ${response.status}`
          : `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, details)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

async function postForm<T>(endpoint: string, formData: FormData, auth = false): Promise<T> {
  const headers: Record<string, string> = {}

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    let details: unknown
    try {
      details = await response.json()
    } catch {
      details = await response.text()
    }
    const message =
      typeof details === 'object' && details !== null && 'message' in details
        ? String((details as { message: string }).message)
        : `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, details)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  get: <T>(endpoint: string, auth = false, init: Omit<RequestOptions, 'auth' | 'body'> = {}) =>
    request<T>(endpoint, { method: 'GET', auth, cache: 'no-store', ...init }),
  post: <T>(endpoint: string, body?: unknown, auth = false) =>
    request<T>(endpoint, { method: 'POST', body, auth }),
  postForm: <T>(endpoint: string, formData: FormData, auth = false) =>
    postForm<T>(endpoint, formData, auth),
  put: <T>(endpoint: string, body?: unknown, auth = false) =>
    request<T>(endpoint, { method: 'PUT', body, auth }),
  delete: <T>(endpoint: string, auth = false) => request<T>(endpoint, { method: 'DELETE', auth }),
}
