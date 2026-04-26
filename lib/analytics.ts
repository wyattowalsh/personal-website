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
const POSTHOG_DISTINCT_ID_KEY = 'w4w-posthog-distinct-id';
const POSTHOG_SESSION_ID_KEY = 'w4w-posthog-session-id';
const DEFAULT_POSTHOG_CAPTURE_HOST = 'https://us.i.posthog.com';

type FlatProperties = Record<string, string | number | boolean>;

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

function createId(prefix: string): string {
  const randomId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${prefix}_${randomId}`;
}

function getStoredId(storage: Storage, key: string, prefix: string): string {
  const existing = storage.getItem(key);
  if (existing) return existing;

  const id = createId(prefix);
  storage.setItem(key, id);
  return id;
}

function getPostHogIds(): { distinctId: string; sessionId: string } | null {
  if (typeof window === 'undefined') return null;

  try {
    return {
      distinctId: getStoredId(localStorage, POSTHOG_DISTINCT_ID_KEY, 'anon'),
      sessionId: getStoredId(sessionStorage, POSTHOG_SESSION_ID_KEY, 'session'),
    };
  } catch {
    return null;
  }
}

function getPostHogCaptureHost(): string {
  return (process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_POSTHOG_CAPTURE_HOST).replace(/\/+$/, '');
}

function getDeviceCategory(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getPageContextProperties(): FlatProperties {
  if (typeof window === 'undefined') return {};

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

  return {
    '$current_url': window.location.href,
    '$host': window.location.host,
    '$pathname': window.location.pathname,
    '$referrer': document.referrer,
    '$title': document.title,
    viewport_width: viewportWidth,
    viewport_height: viewportHeight,
    device_category: getDeviceCategory(viewportWidth),
  };
}

function sanitizeProperties<E extends EventName>(
  event: E,
  properties?: EventProperties[E]
): FlatProperties {
  const flat = { ...(properties as FlatProperties | undefined) };

  if (
    (event === 'search_query' || event === 'search_no_results') &&
    typeof flat.query === 'string'
  ) {
    flat.query = sanitizeQuery(flat.query);
  }

  return flat;
}

function capturePostHog(event: string, properties: FlatProperties): void {
  if (typeof window === 'undefined' || isOptedOut()) return;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
  if (!apiKey) return;

  const ids = getPostHogIds();
  if (!ids) return;

  const payload = {
    api_key: apiKey,
    event,
    distinct_id: ids.distinctId,
    properties: {
      ...getPageContextProperties(),
      ...properties,
      session_id: ids.sessionId,
      source: 'w4w.dev',
      '$process_person_profile': false,
    },
  };

  fetch(`${getPostHogCaptureHost()}/i/v0/e/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Analytics must never affect the site experience.
  });
}

// ---------- Vercel + PostHog track (enriched) ----------

export function track<E extends EventName>(
  event: E,
  properties?: EventProperties[E]
): void {
  if (isOptedOut()) return;

  const flat = sanitizeProperties(event, properties);

  if (process.env.NODE_ENV === 'development') {
    console.debug('[Analytics]', event, flat);
  }
  vercelTrack(event, flat);
  capturePostHog(event, flat);
}

export function trackPageView(page: EventProperties['page_view']): void {
  if (isOptedOut()) return;

  const flat = sanitizeProperties('page_view', page);

  if (process.env.NODE_ENV === 'development') {
    console.debug('[Analytics]', '$pageview', flat);
  }
  vercelTrack('page_view', flat);
  capturePostHog('$pageview', flat);
}
