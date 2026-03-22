// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockVercelTrack } = vi.hoisted(() => ({
  mockVercelTrack: vi.fn(),
}));

vi.mock('@vercel/analytics', () => ({
  track: mockVercelTrack,
}));

vi.mock('@/lib/device', () => ({
  getDeviceContextSlim: vi.fn(() => ({
    screen: '1920x1080',
    dpr: 2,
    viewport: '1024x768',
    orientation: 'landscape',
    language: 'en-US',
    timezone: 'America/Los_Angeles',
    touchPoints: 0,
    cores: 8,
    connection: '4g',
    platform: 'MacIntel',
  })),
}));

// Must import after mocks are set up
import {
  track,
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
let mockLocalStorage: Storage;

beforeEach(() => {
  vi.clearAllMocks();
  origLocalStorage = globalThis.localStorage;
  mockLocalStorage = createStorageMock();
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: origLocalStorage,
    writable: true,
    configurable: true,
  });
});

// ---------- track() ----------

describe('track()', () => {
  it('calls vercelTrack with enriched properties (device slim context merged)', () => {
    track('share_click', { platform: 'twitter' });

    expect(mockVercelTrack).toHaveBeenCalledOnce();
    const [event, props] = mockVercelTrack.mock.calls[0];
    expect(event).toBe('share_click');
    expect(props).toMatchObject({
      screen: '1920x1080',
      dpr: 2,
      platform: 'twitter',
      language: 'en-US',
    });
  });

  it('respects opt-out', () => {
    localStorage.setItem('analytics-opt-out', '1');

    track('share_click', { platform: 'twitter' });

    expect(mockVercelTrack).not.toHaveBeenCalled();
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
