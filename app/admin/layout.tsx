'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Lock, LogIn, Radar } from 'lucide-react';
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
  const passwordInputId = 'admin-password';
  const passwordErrorId = 'admin-password-error';
  const checkAuth = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch('/api/admin/auth', {
      cache: 'no-store',
      credentials: 'same-origin',
      signal,
    });
    return response.ok;
  }, []);

  // Check auth on mount
  useEffect(() => {
    const controller = new AbortController();
    checkAuth(controller.signal)
      .then(setIsAuthed)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setIsAuthed(false);
        }
      })
      .finally(() => setChecking(false));

    return () => controller.abort();
  }, [checkAuth]);

  // Poll session validity
  useEffect(() => {
    if (!isAuthed) return;
    let timeoutId: number | undefined;
    let controller: AbortController | null = null;

    const clearPoll = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      controller?.abort();
      controller = null;
    };

    const schedulePoll = () => {
      if (document.visibilityState === 'hidden') return;
      timeoutId = window.setTimeout(runPoll, SESSION_POLL_MS);
    };

    const runPoll = async () => {
      if (document.visibilityState === 'hidden') return;
      controller = new AbortController();
      try {
        if (!(await checkAuth(controller.signal))) setIsAuthed(false);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        // Network error — don't log out, may be transient
      } finally {
        controller = null;
        schedulePoll();
      }
    };

    const handleVisibilityChange = () => {
      clearPoll();
      if (document.visibilityState === 'visible') {
        void runPoll();
      }
    };

    schedulePoll();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearPoll();
    };
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative flex size-20 items-center justify-center" role="status" aria-label="Checking admin session">
          <div className="absolute inset-0 animate-ping rounded-full border border-[hsl(var(--chart-1)/0.35)] motion-reduce:animate-none" />
          <div className="size-8 animate-spin rounded-full border-2 border-[hsl(var(--chart-1))] border-t-transparent motion-reduce:animate-none" />
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.26)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.22)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--chart-1)/0.18),transparent_42%)]" />
        <form
          onSubmit={handleSubmit}
          className={cn(
            'relative w-full max-w-sm overflow-hidden rounded-lg p-8',
            'border border-border/80 bg-card/90 shadow-2xl backdrop-blur'
          )}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--chart-1))] to-transparent" />
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg border border-[hsl(var(--chart-1)/0.28)] bg-[hsl(var(--chart-1)/0.12)] p-2.5 text-[hsl(var(--chart-1))]">
              <Radar aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Secure console</p>
              <h1 className="text-lg font-semibold tracking-tight">Admin Access</h1>
            </div>
          </div>

          <label htmlFor={passwordInputId} className="sr-only">
            Admin password
          </label>
          <Input
            id={passwordInputId}
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? passwordErrorId : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mb-3 border-border/80 bg-background/70 font-mono"
            autoFocus
          />

          {error && (
            <p id={passwordErrorId} className="text-sm text-destructive mb-3" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full gap-2">
            <LogIn aria-hidden="true" className="h-4 w-4" />
            Sign In
          </Button>
          <div className="mt-4 flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            <Lock aria-hidden="true" className="size-3" />
            Secrets stay server-side
          </div>
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
      <div className="flex h-[calc(100dvh-3.5rem)] overflow-hidden bg-background sm:h-[calc(100dvh-4rem)]">
        <AdminSidebar />
        <div
          aria-hidden={mobileSidebarOpen ? 'true' : undefined}
          inert={mobileSidebarOpen ? true : undefined}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <a
            href="#admin-main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Skip admin navigation
          </a>
          <AdminHeader />
          <div id="admin-main" role="region" aria-label="Admin content" tabIndex={-1} className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </div>
        </div>
      </div>
    </AdminProvider>
  );
}
