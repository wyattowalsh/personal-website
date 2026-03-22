'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';

const MILESTONES_SECONDS = [30, 60, 180, 300] as const;
const TICK_MS = 5000;

export function useTimeOnPage(slug: string) {
  const activeRef = useRef(0);
  const hiddenRef = useRef(false);
  const firedRef = useRef(new Set<number>());

  useEffect(() => {
    activeRef.current = 0;
    firedRef.current = new Set();
    const fired = firedRef.current;
    hiddenRef.current = document.hidden;

    function checkMilestones() {
      if (hiddenRef.current) return;
      activeRef.current += TICK_MS / 1000;

      for (const milestone of MILESTONES_SECONDS) {
        if (activeRef.current >= milestone && !fired.has(milestone)) {
          fired.add(milestone);
          track('time_on_page', { slug, seconds: milestone });
        }
      }
    }

    function onVisibilityChange() {
      hiddenRef.current = document.hidden;
    }

    const interval = setInterval(checkMilestones, TICK_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [slug]);
}
