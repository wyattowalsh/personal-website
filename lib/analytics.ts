"use client";

import { track as vercelTrack } from '@vercel/analytics';

// ---------- Event types ----------

export type EventProperties = {
  reading_progress: { slug: string; milestone: number; percent: number };
  time_on_page: { slug: string; seconds: number };
  search_query: { query: string; results_count: number };
  search_no_results: { query: string };
  share_click: { platform: string };
  page_view: { url: string; referrer: string; title: string };
  scroll_depth: { url: string; depth: number };
  link_click: { url: string; href: string; external: boolean };
  code_copied: { language?: string };
  theme_changed: { to: string };
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

  const flat = properties as Record<string, string | number | boolean> | undefined;

  if (process.env.NODE_ENV === 'development') {
    console.debug('[Analytics]', event, flat);
  }
  vercelTrack(event, flat);
}
