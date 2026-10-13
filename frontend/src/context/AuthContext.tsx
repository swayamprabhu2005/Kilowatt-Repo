import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  login: (email: string, passwordPlain: string) => Promise<void>;
  logout: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const data = await apiFetch<{ user: User; activeWorkspace: Workspace; workspaces: Workspace[] }>('/auth/me');
      setUser(data.user);
      setActiveWorkspace(data.activeWorkspace);
      setWorkspaces(data.workspaces);
    } catch {
      setUser(null);
      setActiveWorkspace(null);
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, passwordPlain: string) => {
    const res = await apiFetch<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordPlain }),
    });
    setUser(res.user);
    setActiveWorkspace(res.activeWorkspace);
    await refreshProfile();
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setActiveWorkspace(null);
      setWorkspaces([]);
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    await apiFetch('/auth/switch-workspace', {
      method: 'POST',
      body: JSON.stringify({ workspaceId }),
    });
    await refreshProfile();
  };

  return (
    <AuthContext.Provider value={{ user, activeWorkspace, workspaces, isLoading, login, logout, switchWorkspace }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
