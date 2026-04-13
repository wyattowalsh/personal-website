'use client';

import { useCallback, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEFAULT_INTERVAL_MS = 30_000;

interface TelemetryAutoRefreshProps {
  intervalMs?: number;
}

export function TelemetryAutoRefresh({ intervalMs = DEFAULT_INTERVAL_MS }: TelemetryAutoRefreshProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pendingRef = useRef(false);

  useEffect(() => {
    pendingRef.current = isPending;
  }, [isPending]);

  const triggerRefresh = useCallback(() => {
    if (pendingRef.current || document.visibilityState === 'hidden') {
      return;
    }

    pendingRef.current = true;
    startTransition(() => {
      router.refresh();
    });
  }, [router, startTransition]);

  useEffect(() => {
    if (intervalMs <= 0) {
      return;
    }

    const id = window.setInterval(triggerRefresh, intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs, triggerRefresh]);

  return (
    <div className="flex items-center gap-2 self-start lg:self-auto">
      <span className="text-xs text-muted-foreground">
        Auto refresh every {Math.round(intervalMs / 1000)}s
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9"
        aria-label="Refresh telemetry"
        disabled={isPending}
        onClick={triggerRefresh}
      >
        <RefreshCw className={isPending ? 'size-4 animate-spin' : 'size-4'} />
      </Button>
    </div>
  );
}
