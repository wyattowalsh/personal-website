'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';

const MILESTONES = [25, 50, 75, 100] as const;

export function useReadingProgress(slug: string) {
  const firedRef = useRef(new Set<number>());

  const rafId = useRef<number | null>(null);

  useEffect(() => {
    firedRef.current = new Set<number>();
    const fired = firedRef.current;

    function onScroll() {
      if (rafId.current !== null) return;

      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;

        const docHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        if (docHeight <= 0) return;

        const percent = Math.round((window.scrollY / docHeight) * 100);

        for (const milestone of MILESTONES) {
          if (percent >= milestone && !fired.has(milestone)) {
            fired.add(milestone);
            track('reading_progress', { slug, milestone, percent });
          }
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [slug]);
}
