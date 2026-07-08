import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { mapApiUserToAuthUser } from '../adapters/authAdapter'
import { authService, getToken, removeToken, setToken } from '../services'
import type { AuthUser } from '../types/auth'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  signIn: (user: AuthUser) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Restores session on app load: if a JWT exists, validate it via GET /api/auth/me.
 * Invalid/expired tokens are cleared so protected routes redirect to login cleanly.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      const token = getToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const me = await authService.me()
        setUser(mapApiUserToAuthUser(me))
      } catch {
        removeToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrap()
  }, [])

  const signIn = useCallback((nextUser: AuthUser) => {
    setUser(nextUser)
  }, [])

  const signOut = useCallback(() => {
    removeToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, signIn, signOut }),
    [user, isLoading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/** Stores JWT after login and maps API user to the frontend AuthUser shape. */
export async function persistAuthSession(email: string, password: string): Promise<AuthUser> {
  const response = await authService.login({ email, password })
  setToken(response.token)
  return mapApiUserToAuthUser(response)
}
