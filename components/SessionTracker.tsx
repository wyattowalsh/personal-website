"use client";

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { sendBeacon, track, getAnalyticsOptOut } from '@/lib/analytics';

/**
 * Global session tracker — renders invisibly in the root layout.
 *
 * Tracks:
 * - page_view on every navigation (SPA + initial load)
 * - page_exit on visibility hidden / beforeunload
 * - scroll_depth at 10% intervals
 * - outbound link clicks via event delegation
 */
export function SessionTracker() {
  const pathname = usePathname();
  const pageEnteredAt = useRef(Date.now());
  const maxScrollDepth = useRef(0);
  const firedDepths = useRef(new Set<number>());
  const rafId = useRef<number | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  // ---------- Page view ----------
  useEffect(() => {
    if (getAnalyticsOptOut()) return;

    // Fire exit for the page we're leaving (skip on initial mount)
    if (prevUrlRef.current) {
      const timeSpent = Math.round((Date.now() - pageEnteredAt.current) / 1000);
      sendBeacon({
        event: 'page_exit',
        url: prevUrlRef.current,
        data: { timeSpent, maxScrollDepth: maxScrollDepth.current },
      });
    }

    prevUrlRef.current = window.location.href;
    pageEnteredAt.current = Date.now();
    maxScrollDepth.current = 0;
    firedDepths.current = new Set();

    sendBeacon({
      event: 'page_view',
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
    });

    track('page_view', {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
    });
  }, [pathname]);

  // ---------- Page exit ----------
  const firePageExit = useCallback(() => {
    if (getAnalyticsOptOut()) return;

    // page_exit goes to beacon only (not Vercel Analytics) because:
    // 1. Vercel track() uses fetch which is unreliable during page unload
    // 2. navigator.sendBeacon is designed for this exact use case
    // Other events (page_view, scroll_depth, link_click) dual-send to both.
    const timeSpent = Math.round((Date.now() - pageEnteredAt.current) / 1000);
    sendBeacon({
      event: 'page_exit',
      url: window.location.href,
      data: { timeSpent, maxScrollDepth: maxScrollDepth.current },
    });
  }, []);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        firePageExit();
      }
    }

    // visibilitychange is more reliable than beforeunload on mobile
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', firePageExit);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', firePageExit);
    };
  }, [firePageExit]);

  // ---------- Scroll depth (10% intervals) ----------
  useEffect(() => {
    if (getAnalyticsOptOut()) return;

    // Blog posts use ArticleTracker/useReadingProgress for scroll tracking
    if (/^\/blog\/posts\//.test(pathname)) return;

    function onScroll() {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;

        const docHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        if (docHeight <= 0) return;

        const percent = Math.round((window.scrollY / docHeight) * 100);
        maxScrollDepth.current = Math.max(maxScrollDepth.current, percent);

        // Fire at 10% milestones
        const milestone = Math.floor(percent / 10) * 10;
        if (milestone > 0 && !firedDepths.current.has(milestone)) {
          firedDepths.current.add(milestone);

          sendBeacon({
            event: 'scroll_depth',
            url: window.location.href,
            data: { depth: milestone },
          });

          track('scroll_depth', {
            url: window.location.pathname,
            depth: milestone,
          });
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [pathname]);

  // ---------- Outbound link clicks ----------
  useEffect(() => {
    if (getAnalyticsOptOut()) return;

    function onClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest?.('a');
      if (!anchor) return;

      const href = anchor.href;
      if (!href) return;

      try {
        const url = new URL(href, window.location.origin);
        // Note: intentionally not using lib/utils.ts:isExternal() — that function
        // also matches mailto: and tel: URIs, which are not outbound links.
        const isExternal = url.origin !== window.location.origin;

        if (isExternal) {
          sendBeacon({
            event: 'link_click',
            url: window.location.href,
            data: { href, external: true },
          });

          track('link_click', {
            url: window.location.pathname,
            href,
            external: true,
          });
        }
      } catch {
        // Invalid URL — skip
      }
    }

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
