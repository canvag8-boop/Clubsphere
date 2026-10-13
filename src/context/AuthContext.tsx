import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { apiService, getAuthHeaders } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    studentId?: string;
    department?: string;
    year?: number;
    section?: string;
    gender?: string;
    avatar?: string;
  }) => Promise<void>;
  logout: () => void;
  switchDemoUser: (role: UserRole) => Promise<void>;
  elevateCurrentAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS: Partial<Record<UserRole, { email: string; pass: string }>> = {
  student: { email: 'alex.rivera@college.edu', pass: 'student123' },
  coordinator: { email: 'maya.lin@college.edu', pass: 'coordinator123' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize with verified saved session token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('clubsphere_token');
        const savedUserJson = localStorage.getItem('clubsphere_user');
        if (token && savedUserJson) {
          const parsed = JSON.parse(savedUserJson);
          const me = await fetch(`/api/auth/me/${parsed.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null);

          if (me?.user) {
            setUser(me.user);
            localStorage.setItem('clubsphere_user', JSON.stringify(me.user));
            return;
          }
        }
        // Invalid or missing token/session -> clear and prompt login
        localStorage.removeItem('clubsphere_user');
        localStorage.removeItem('clubsphere_token');
      } catch (err) {
        console.error('Failed to init auth:', err);
        localStorage.removeItem('clubsphere_user');
        localStorage.removeItem('clubsphere_token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await apiService.login(email, password);
      setUser(res.user);
      localStorage.setItem('clubsphere_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    studentId?: string;
    department?: string;
    year?: number;
    section?: string;
    gender?: string;
    avatar?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await apiService.register(data);
      setUser(res.user);
      localStorage.setItem('clubsphere_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clubsphere_user');
    localStorage.removeItem('clubsphere_token');
  };

  const switchDemoUser = async (targetRole: UserRole) => {
    if (targetRole === 'admin') {
      console.warn('Admin access requires explicit credential authentication.');
      return;
    }
    const creds = DEMO_CREDENTIALS[targetRole];
    if (!creds) return;

    setIsLoading(true);
    try {
      const res = await apiService.login(creds.email, creds.pass);
      setUser(res.user);
      localStorage.setItem('clubsphere_user', JSON.stringify(res.user));
    } catch (err) {
      console.error('Failed to switch demo user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const elevateCurrentAccount = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/elevate-me', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('clubsphere_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Failed to elevate account:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/auth/me/${user.id}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('clubsphere_user', JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const role: UserRole = user?.role || 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        login,
        register,
        logout,
        switchDemoUser,
        elevateCurrentAccount,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
