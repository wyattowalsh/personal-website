// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockVercelTrack } = vi.hoisted(() => ({
  mockVercelTrack: vi.fn(),
}));

vi.mock('@vercel/analytics', () => ({
  track: mockVercelTrack,
}));

// Must import after mocks are set up
import {
  track,
  trackPageView,
  setAnalyticsOptOut,
  getAnalyticsOptOut,
} from '@/lib/analytics';

// Node 25 ships a built-in localStorage on globalThis that shadows jsdom's
// proper Storage implementation. Replace with a spec-compliant mock.
function createStorageMock(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  };
}

let origLocalStorage: Storage;
let origSessionStorage: Storage;
let origFetch: typeof fetch;
let mockLocalStorage: Storage;
let mockSessionStorage: Storage;

beforeEach(() => {
  vi.clearAllMocks();
  origLocalStorage = globalThis.localStorage;
  origSessionStorage = globalThis.sessionStorage;
  origFetch = globalThis.fetch;
  mockLocalStorage = createStorageMock();
  mockSessionStorage = createStorageMock();
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'fetch', {
    value: vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })),
    writable: true,
    configurable: true,
  });
  delete process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
  delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
});

afterEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: origLocalStorage,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: origSessionStorage,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'fetch', {
    value: origFetch,
    writable: true,
    configurable: true,
  });
  delete process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
  delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
});

// ---------- track() ----------

describe('track()', () => {
  it('calls vercelTrack with provided properties', () => {
    track('share_click', { platform: 'twitter' });

    expect(mockVercelTrack).toHaveBeenCalledOnce();
    const [event, props] = mockVercelTrack.mock.calls[0];
    expect(event).toBe('share_click');
    expect(props).toMatchObject({ platform: 'twitter' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends anonymous PostHog events when configured', () => {
    process.env.NEXT_PUBLIC_POSTHOG_TOKEN = 'phc_test';
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://eu.i.posthog.com/';

    track('share_click', { platform: 'twitter' });

    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('https://eu.i.posthog.com/i/v0/e/');

    const body = JSON.parse(String((init as RequestInit).body));
    expect(body).toMatchObject({
      api_key: 'phc_test',
      event: 'share_click',
    });
    expect(body.distinct_id).toMatch(/^anon_/);
    expect(body.properties).toMatchObject({
      platform: 'twitter',
      source: 'w4w.dev',
      '$process_person_profile': false,
    });
    expect(body.properties.session_id).toMatch(/^session_/);
  });

  it('respects opt-out', () => {
    process.env.NEXT_PUBLIC_POSTHOG_TOKEN = 'phc_test';
    localStorage.setItem('analytics-opt-out', '1');

    track('share_click', { platform: 'twitter' });

    expect(mockVercelTrack).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sanitizes search queries (strips special chars, truncates to 50 chars)', () => {
    const longQuery = 'a'.repeat(100);
    track('search_query', { query: longQuery, results_count: 5 });

    const [, props] = mockVercelTrack.mock.calls[0];
    expect(props.query).toHaveLength(50);

    vi.clearAllMocks();

    track('search_query', {
      query: 'hello <script>alert(1)</script>',
      results_count: 0,
    });
    const [, props2] = mockVercelTrack.mock.calls[0];
    expect(props2.query).not.toContain('<');
    expect(props2.query).not.toContain('>');
    expect(props2.query).not.toContain('(');
    expect(props2.query).not.toContain(')');
  });

  it('sanitizes search_no_results queries', () => {
    track('search_no_results', { query: 'test@#$%' });

    const [, props] = mockVercelTrack.mock.calls[0];
    expect(props.query).toBe('test');
  });

  it('captures page views as PostHog pageview events', () => {
    process.env.NEXT_PUBLIC_POSTHOG_TOKEN = 'phc_test';

    trackPageView({
      url: 'https://www.w4w.dev/blog',
      referrer: '',
      title: 'Blog',
    });

    expect(mockVercelTrack).toHaveBeenCalledWith('page_view', {
      url: 'https://www.w4w.dev/blog',
      referrer: '',
      title: 'Blog',
    });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(String((init as RequestInit).body));
    expect(body.event).toBe('$pageview');
    expect(body.properties).toMatchObject({
      url: 'https://www.w4w.dev/blog',
      title: 'Blog',
      '$process_person_profile': false,
    });
  });
});

// ---------- setAnalyticsOptOut() / getAnalyticsOptOut() ----------

describe('setAnalyticsOptOut() / getAnalyticsOptOut()', () => {
  it('setting to true stores "1" in localStorage', () => {
    setAnalyticsOptOut(true);

    expect(localStorage.getItem('analytics-opt-out')).toBe('1');
    expect(getAnalyticsOptOut()).toBe(true);
  });

  it('setting to false removes the key', () => {
    localStorage.setItem('analytics-opt-out', '1');

    setAnalyticsOptOut(false);

    expect(localStorage.getItem('analytics-opt-out')).toBeNull();
    expect(getAnalyticsOptOut()).toBe(false);
  });

  it('getAnalyticsOptOut reflects current state', () => {
    expect(getAnalyticsOptOut()).toBe(false);

    setAnalyticsOptOut(true);
    expect(getAnalyticsOptOut()).toBe(true);

    setAnalyticsOptOut(false);
    expect(getAnalyticsOptOut()).toBe(false);
  });
});
