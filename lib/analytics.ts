'use client';

import { track as vercelTrack } from '@vercel/analytics';
import {
  getDeviceContextSlim,
  getVisitorId,
  getSessionId,
  getVisitorInfo,
  getDeviceContext,
} from '@/lib/device';
import type { VisitorInfo } from '@/lib/device';

// ---------- Event types ----------

export type EventProperties = {
  reading_progress: { slug: string; milestone: number; percent: number };
  time_on_page: { slug: string; seconds: number };
  search_query: { query: string; results_count: number };
  search_no_results: { query: string };
  share_click: { platform: string };
  page_view: { url: string; referrer: string; title: string };
  page_exit: { url: string; timeSpent: number };
  scroll_depth: { url: string; depth: number };
  link_click: { url: string; href: string; external: boolean };
};

export type EventName = keyof EventProperties;

// ---------- Opt-out ----------

const OPT_OUT_KEY = 'analytics-opt-out';

function isOptedOut(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return localStorage.getItem(OPT_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

/** Allow users to opt out of analytics tracking. */
export function setAnalyticsOptOut(optOut: boolean): void {
  try {
    if (optOut) {
      localStorage.setItem(OPT_OUT_KEY, '1');
    } else {
      localStorage.removeItem(OPT_OUT_KEY);
    }
  } catch {
    // localStorage unavailable
  }
}

/** Check whether analytics tracking is currently opted out. */
export function getAnalyticsOptOut(): boolean {
  return isOptedOut();
}

// ---------- Helpers ----------

function sanitizeQuery(query: string): string {
  return query.slice(0, 50).replace(/[^\w\s-]/g, '').trim();
}

// ---------- Vercel track (enriched) ----------

export function track<E extends EventName>(
  event: E,
  properties?: EventProperties[E]
): void {
  if (isOptedOut()) return;

  // Sanitize search queries
  if (
    properties &&
    (event === 'search_query' || event === 'search_no_results')
  ) {
    const props = properties as Record<string, unknown>;
    if (typeof props.query === 'string') {
      props.query = sanitizeQuery(props.query);
    }
  }

  // Enrich with slim device context for Vercel (property size limit)
  const deviceSlim = getDeviceContextSlim();
  const enriched = {
    ...deviceSlim,
    ...(properties as Record<string, string | number | boolean> | undefined),
  };

  if (process.env.NODE_ENV === 'development') {
    console.debug('[Analytics]', event, enriched);
  }
  vercelTrack(event, enriched);
}

// ---------- Beacon (full payload to our API) ----------

/**
 * Send a full-payload beacon to /api/analytics/beacon.
 *
 * Design note: page_exit events use navigator.sendBeacon (reliable on unload).
 * Other events use fetch with keepalive. page_exit is NOT sent to Vercel
 * Analytics (via track()) because fetch is unreliable during page teardown.
 */

interface BeaconOptions {
  event: 'page_view' | 'page_exit' | 'scroll_depth' | 'link_click';
  url: string;
  referrer?: string;
  title?: string;
  data?: Record<string, string | number | boolean | null>;
}

let cachedVisitorInfo: VisitorInfo | null = null;

export async function sendBeacon(options: BeaconOptions): Promise<void> {
  if (isOptedOut()) return;

  const visitorId = getVisitorId();
  const sessionId = getSessionId();

  if (!cachedVisitorInfo) {
    cachedVisitorInfo = getVisitorInfo(visitorId);
  }

  const payload = {
    visitorId,
    sessionId,
    event: options.event,
    url: options.url,
    referrer: options.referrer ?? '',
    title: options.title ?? '',
    timestamp: Date.now(),
    isReturning: cachedVisitorInfo.isReturning,
    visitCount: cachedVisitorInfo.visitCount,
    daysSinceFirstVisit: cachedVisitorInfo.daysSinceFirstVisit,
    data: options.data,
    device: getDeviceContext(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.debug('[Beacon]', options.event, payload);
  }

  // Use sendBeacon for page_exit (reliable on unload), fetch for others
  const body = JSON.stringify(payload);

  if (options.event === 'page_exit' && navigator.sendBeacon) {
    navigator.sendBeacon(
      '/api/analytics/beacon',
      new Blob([body], { type: 'application/json' })
    );
  } else {
    fetch('/api/analytics/beacon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // Silently fail — analytics should never break the site
    });
  }
}
