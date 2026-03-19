// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Helper: fresh import after module reset
async function freshImport() {
  return import('@/lib/device') as Promise<typeof import('@/lib/device')>;
}

// ---------- Storage mock ----------
// Node 25 ships a built-in `localStorage` on globalThis that is a bare object
// without getItem/setItem/removeItem/clear. This shadows jsdom's proper
// Storage implementation. We replace it with a spec-compliant mock.

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
let mockLocalStorage: Storage;
let mockSessionStorage: Storage;

beforeEach(() => {
  origLocalStorage = globalThis.localStorage;
  origSessionStorage = globalThis.sessionStorage;
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
});

describe('lib/device', () => {
  beforeEach(() => {
    vi.resetModules();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
  });

  // ---------- getVisitorId ----------

  describe('getVisitorId', () => {
    it('returns a UUID string', async () => {
      const { getVisitorId } = await freshImport();
      const id = getVisitorId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    it('caches the result — second call skips localStorage', async () => {
      const { getVisitorId } = await freshImport();
      const first = getVisitorId();

      const getSpy = vi.spyOn(mockLocalStorage, 'getItem');
      const second = getVisitorId();

      expect(second).toBe(first);
      // Cached: should not read localStorage again
      expect(getSpy).not.toHaveBeenCalled();
    });

    it('reads from localStorage if present', async () => {
      const storedId = '00000000-1111-2222-3333-444444444444';
      mockLocalStorage.setItem('analytics_visitor_id', storedId);

      const { getVisitorId } = await freshImport();
      expect(getVisitorId()).toBe(storedId);
    });

    it('handles localStorage being unavailable', async () => {
      vi.spyOn(mockLocalStorage, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });
      vi.spyOn(mockLocalStorage, 'setItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const { getVisitorId } = await freshImport();
      const id = getVisitorId();

      // Should still return a valid UUID even without storage
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });
  });

  // ---------- getVisitorInfo ----------

  describe('getVisitorInfo', () => {
    const testId = 'test-visitor-id';
    const storageKey = `v_${testId}`;

    it('returns first-visit defaults on first call', async () => {
      const { getVisitorInfo } = await freshImport();
      const info = getVisitorInfo(testId);

      expect(info).toMatchObject({
        visitorId: testId,
        isReturning: false,
        visitCount: 1,
        daysSinceFirstVisit: 0,
      });
      expect(info.firstSeen).toBeTruthy();
    });

    it('returns isReturning: true on second call within 30 min, same visitCount', async () => {
      const { getVisitorInfo } = await freshImport();
      getVisitorInfo(testId); // first
      const second = getVisitorInfo(testId);

      expect(second.isReturning).toBe(true);
      expect(second.visitCount).toBe(1);
    });

    it('increments visitCount after 30+ min gap', async () => {
      const { getVisitorInfo } = await freshImport();
      getVisitorInfo(testId); // first visit

      // Manipulate stored lastSession to 31 minutes ago
      const raw = JSON.parse(mockLocalStorage.getItem(storageKey)!);
      raw.lastSession = new Date(Date.now() - 31 * 60 * 1000).toISOString();
      mockLocalStorage.setItem(storageKey, JSON.stringify(raw));

      const info = getVisitorInfo(testId);
      expect(info.isReturning).toBe(true);
      expect(info.visitCount).toBe(2);
    });

    it('handles corrupted localStorage data (invalid dates) — HR-S-008', async () => {
      mockLocalStorage.setItem(
        storageKey,
        JSON.stringify({
          firstSeen: 'not-a-date',
          visitCount: 3,
          lastSession: 'also-not-a-date',
        })
      );

      const { getVisitorInfo } = await freshImport();
      const info = getVisitorInfo(testId);

      // Should reset to first-visit defaults, not produce NaN
      expect(info.isReturning).toBe(false);
      expect(info.visitCount).toBe(1);
      expect(info.daysSinceFirstVisit).toBe(0);
      expect(Number.isNaN(info.daysSinceFirstVisit)).toBe(false);
    });

    it('handles corrupted visitCount (non-number)', async () => {
      mockLocalStorage.setItem(
        storageKey,
        JSON.stringify({
          firstSeen: new Date().toISOString(),
          visitCount: 'not-a-number',
          lastSession: new Date().toISOString(),
        })
      );

      const { getVisitorInfo } = await freshImport();
      const info = getVisitorInfo(testId);

      expect(info.isReturning).toBe(false);
      expect(info.visitCount).toBe(1);
    });
  });

  // ---------- getSessionId ----------

  describe('getSessionId', () => {
    it('returns a UUID string', async () => {
      const { getSessionId } = await freshImport();
      const id = getSessionId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    it('stores in sessionStorage', async () => {
      const { getSessionId } = await freshImport();
      const id = getSessionId();
      expect(mockSessionStorage.getItem('analytics_session_id')).toBe(id);
    });

    it('returns cached value on second call', async () => {
      const { getSessionId } = await freshImport();
      const first = getSessionId();

      const getSpy = vi.spyOn(mockSessionStorage, 'getItem');
      const second = getSessionId();

      expect(second).toBe(first);
      expect(getSpy).not.toHaveBeenCalled();
    });
  });

  // ---------- getDeviceContext ----------

  describe('getDeviceContext', () => {
    it('returns an object with expected shape', async () => {
      const { getDeviceContext } = await freshImport();
      const ctx = getDeviceContext();

      expect(ctx).toHaveProperty('screenWidth');
      expect(ctx).toHaveProperty('screenHeight');
      expect(ctx).toHaveProperty('userAgent');
      expect(ctx).toHaveProperty('language');
      expect(ctx).toHaveProperty('timezone');
      expect(ctx).toHaveProperty('orientation');
      expect(ctx).toHaveProperty('hardwareConcurrency');
      expect(typeof ctx.screenWidth).toBe('number');
      expect(typeof ctx.userAgent).toBe('string');
    });

    it('caches result on subsequent calls', async () => {
      const { getDeviceContext } = await freshImport();
      const first = getDeviceContext();
      const second = getDeviceContext();
      expect(first).toBe(second); // same reference
    });
  });
});
