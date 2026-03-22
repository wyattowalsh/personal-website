'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Lock, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdminProvider } from './components/AdminContext';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';

const SESSION_POLL_MS = 5 * 60 * 1000; // 5 minutes

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const checkAuth = useCallback(async () => {
    const response = await fetch('/api/admin/auth', {
      cache: 'no-store',
      credentials: 'same-origin',
    });
    return response.ok;
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth()
      .then(setIsAuthed)
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [checkAuth]);

  // Poll session validity
  useEffect(() => {
    if (!isAuthed) return;
    const id = setInterval(async () => {
      try {
        if (!(await checkAuth())) setIsAuthed(false);
      } catch {
        // Network error — don't log out, may be transient
      }
    }, SESSION_POLL_MS);
    return () => clearInterval(id);
  }, [checkAuth, isAuthed]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch {
      // Best-effort
    }
    setIsAuthed(false);
    setPassword('');
    setMobileSidebarOpen(false);
    router.refresh();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword('');
        setIsAuthed(true);
        router.refresh();
      } else if (res.status === 429) {
        setError('Too many attempts. Try again later.');
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Connection error');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <form
          onSubmit={handleSubmit}
          className={cn(
            'w-full max-w-sm p-8 rounded-xl',
            'bg-card border border-border',
            'shadow-lg'
          )}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Admin Access</h1>
              <p className="text-xs text-muted-foreground">Enter your password to continue</p>
            </div>
          </div>

          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mb-3"
            autoFocus
          />

          {error && (
            <p className="text-sm text-destructive mb-3">{error}</p>
          )}

          <Button type="submit" className="w-full gap-2">
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        </form>
      </div>
    );
  }

  return (
    <AdminProvider
      value={{
        logout: handleLogout,
        desktopSidebarOpen,
        setDesktopSidebarOpen,
        mobileSidebarOpen,
        setMobileSidebarOpen,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
