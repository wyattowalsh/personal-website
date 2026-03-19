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
  getVisitorId: vi.fn(() => 'test-visitor-id'),
  getSessionId: vi.fn(() => 'test-session-id'),
  getVisitorInfo: vi.fn(() => ({
    visitorId: 'test-visitor-id',
    isReturning: false,
    visitCount: 1,
    firstSeen: '2025-01-01T00:00:00.000Z',
    daysSinceFirstVisit: 0,
  })),
  getDeviceContext: vi.fn(() => ({
    screenWidth: 1920,
    screenHeight: 1080,
    devicePixelRatio: 2,
    colorDepth: 24,
    touchPoints: 0,
    userAgent: 'test',
    platform: 'MacIntel',
    language: 'en-US',
    languages: ['en-US'],
    cookieEnabled: true,
    connectionType: '4g',
    connectionDownlink: 10,
    hardwareConcurrency: 8,
    deviceMemory: 16,
    viewportWidth: 1024,
    viewportHeight: 768,
    orientation: 'landscape',
    timezone: 'America/Los_Angeles',
    timezoneOffset: 480,
    webglRenderer: 'test',
    webglVendor: 'test',
    pdfViewerEnabled: true,
  })),
}));

// Must import after mocks are set up
import {
  track,
  sendBeacon,
  setAnalyticsOptOut,
  getAnalyticsOptOut,
} from '@/lib/analytics';

const mockFetch = vi.fn(() => Promise.resolve(new Response()));

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
  globalThis.fetch = mockFetch;
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

// ---------- sendBeacon() ----------

describe('sendBeacon()', () => {
  it('calls fetch for non-page_exit events', async () => {
    await sendBeacon({
      event: 'page_view',
      url: '/test',
      referrer: 'https://google.com',
      title: 'Test Page',
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = (mockFetch.mock.calls[0] as unknown as [string, { method: string; body: string; keepalive: boolean }]);
    expect(url).toBe('/api/analytics/beacon');
    expect(init.method).toBe('POST');
    expect(init.keepalive).toBe(true);

    const body = JSON.parse(init.body);
    expect(body.event).toBe('page_view');
    expect(body.url).toBe('/test');
    expect(body.referrer).toBe('https://google.com');
    expect(body.title).toBe('Test Page');
  });

  it('uses navigator.sendBeacon for page_exit events', async () => {
    const mockNavSendBeacon = vi.fn(() => true);
    Object.defineProperty(window.navigator, 'sendBeacon', {
      value: mockNavSendBeacon,
      writable: true,
      configurable: true,
    });

    await sendBeacon({
      event: 'page_exit',
      url: '/test',
      data: { timeSpent: 30 },
    });

    expect(mockNavSendBeacon).toHaveBeenCalledOnce();
    const [url, blob] = (mockNavSendBeacon.mock.calls[0] as unknown as [string, Blob]);
    expect(url).toBe('/api/analytics/beacon');
    expect(blob).toBeInstanceOf(Blob);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('respects opt-out', async () => {
    localStorage.setItem('analytics-opt-out', '1');

    await sendBeacon({ event: 'page_view', url: '/test' });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('includes visitor info and device context in payload', async () => {
    await sendBeacon({ event: 'scroll_depth', url: '/test', data: { depth: 75 } });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = (mockFetch.mock.calls[0] as unknown as [string, { body: string }]);
    const body = JSON.parse(init.body);

    expect(body.visitorId).toBe('test-visitor-id');
    expect(body.sessionId).toBe('test-session-id');
    expect(body.isReturning).toBe(false);
    expect(body.visitCount).toBe(1);
    expect(body.daysSinceFirstVisit).toBe(0);
    expect(body.device).toMatchObject({
      screenWidth: 1920,
      platform: 'MacIntel',
      hardwareConcurrency: 8,
    });
    expect(body.data).toEqual({ depth: 75 });
    expect(typeof body.timestamp).toBe('number');
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
