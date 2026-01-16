'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/app/types';
import { authApi } from '@/app/lib/api';
import { isDevelopmentMode, mockDevUser } from '@/app/lib/dev-mode';
import { LoginPage } from '@/app/components/auth/LoginPage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDevelopmentMode) {
      setUser(mockDevUser as User);
      setIsLoading(false);
      return;
    }

    authApi.getSession()
      .then(data => {
        if (data.valid && data.user) {
          setUser({
            id: data.user.slackUserId,
            slackUserId: data.user.slackUserId,
            slackWorkspaceId: data.user.slackWorkspaceId,
            displayName: data.user.displayName,
            email: data.user.email || '',
            avatarUrl: ''
          });
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
    }
    setUser(null);
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🦖</div>
          <div className="text-xl font-bold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

