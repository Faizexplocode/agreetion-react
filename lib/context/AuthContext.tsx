'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { SessionUser, UserRole, UserStatus } from '@/types';

const STORAGE_KEY = 'tanipro_session';

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  setUser: (user: SessionUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<SessionUser | null>(() => {
    // Lazy initializer: runs only once on mount (client-side)
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as SessionUser) : null;
    } catch {
      return null;
    }
  });
  // loading=false because user is read synchronously from localStorage via state initializer
  const [loading] = useState(false);

  const setUser = (u: SessionUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}

export function createSession(user: {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  setup_complete: boolean;
}): SessionUser {
  return { ...user, logged_in_at: new Date().toISOString() };
}
