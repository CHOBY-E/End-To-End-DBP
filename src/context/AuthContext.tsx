import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { getMe } from '../api/users';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  setSession: (token: string) => Promise<User | null>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const me = await getMe();
      setUser(me);
      return me;
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  if (token) {
    loadUser();
  } else {
    setLoading(false);
    setUser(null);
  }
}, [token]);

  async function setSession(newToken: string) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setLoading(true);
    return loadUser();
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, setSession, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
