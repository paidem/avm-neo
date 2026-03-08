import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchMe, login as apiLogin, logout as apiLogout } from '../api/auth';

interface AuthState {
  authenticated: boolean;
  username: string;
  role: 'admin' | 'viewer';
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    authenticated: false,
    username: 'Guest',
    role: 'viewer',
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const info = await fetchMe();
      setState({ ...info, loading: false });
    } catch {
      setState({ authenticated: false, username: 'Guest', role: 'viewer', loading: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (password: string): Promise<string | null> => {
    const result = await apiLogin(password);
    if (result.status === 'success') {
      await refresh();
      return null;
    }
    return result.message || 'Login failed';
  };

  const logout = async () => {
    await apiLogout();
    await refresh();
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
