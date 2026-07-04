/**
 * React context for authentication state across all portals.
 * Restores session from stored JWT via /authentication/me; exposes login, logout, and role checks.
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authService, getToken, setToken, removeToken } from '../services';
import type { User, UserRole, LoginRequest } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<User>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Provides auth state and actions to the component tree. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authService.me();
        const [firstName, ...rest] = userData.fullName.split(' ');
        setUser({
          userId: userData.userId,
          email: userData.email,
          firstName,
          lastName: rest.join(' ') || firstName,
          roles: userData.roles as UserRole[],
        });
        setTokenState(storedToken);
      } catch {
        removeToken();
        setTokenState(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.login(data);
    setToken(response.token);
    setTokenState(response.token);
    const [firstName, ...rest] = response.fullName.split(' ');
    const user: User = {
      userId: response.userId,
      email: response.email,
      firstName,
      lastName: rest.join(' ') || firstName,
      roles: response.roles as UserRole[],
    };
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => user?.roles.includes(role) ?? false,
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Returns auth context; throws if used outside AuthProvider. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
