import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { accountApi, authApi } from '../lib/api';
import type { User } from '../lib/apiTypes';
import { clearAuthToken, getAuthToken, setAuthToken } from '../lib/authStorage';
import { getPlanSessionUuid } from '../lib/session';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function claimGuestSessionIfPresent(): Promise<void> {
  const sessionUuid = getPlanSessionUuid();

  if (!sessionUuid) {
    return;
  }

  try {
    await accountApi.claimPlanSession(sessionUuid);
  } catch {
    // Guest session may already be claimed or expired — ignore.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setUser(null);
      setLoading(false);

      return;
    }

    try {
      const response = await authApi.me();
      setUser(response.data.user);
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setAuthToken(response.data.token);
    setUser(response.data.user);
    await claimGuestSessionIfPresent();

    return response.data.user;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, passwordConfirmation: string) => {
      const response = await authApi.register(name, email, password, passwordConfirmation);
      setAuthToken(response.data.token);
      setUser(response.data.user);
      await claimGuestSessionIfPresent();

      return response.data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Still clear local session.
    }

    clearAuthToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
