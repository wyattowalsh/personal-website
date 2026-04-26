'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { track, trackPageView } from '@/lib/analytics';

const SCROLL_MILESTONES = [25, 50, 75, 100] as const;
const TIME_MILESTONES_SECONDS = [30, 60, 180, 300] as const;

export function PostHogPageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const shouldTrack = !pathname.startsWith('/admin');

  useEffect(() => {
    if (!shouldTrack) return;

    const url = `${window.location.origin}${pathname}${search ? `?${search}` : ''}`;

    trackPageView({
      url,
      referrer: document.referrer,
      title: document.title,
    });
  }, [pathname, search, shouldTrack]);

  useEffect(() => {
    if (!shouldTrack) return;

    const clicked = new Set<number>();

    function onScroll() {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const depth = Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100));
      for (const milestone of SCROLL_MILESTONES) {
        if (depth >= milestone && !clicked.has(milestone)) {
          clicked.add(milestone);
          track('scroll_depth', { url: window.location.href, depth: milestone });
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname, search, shouldTrack]);

  useEffect(() => {
    if (!shouldTrack) return;

    const timers = TIME_MILESTONES_SECONDS.map((seconds) =>
      window.setTimeout(() => {
        track('time_on_page', { slug: pathname, seconds });
      }, seconds * 1000)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [pathname, search, shouldTrack]);

  useEffect(() => {
    if (!shouldTrack) return;

    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.href;
      const external = anchor.origin !== window.location.origin;
      if (!external) return;

      track('link_click', {
        url: window.location.href,
        href,
        external,
      });
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [pathname, search, shouldTrack]);

  return null;
}
