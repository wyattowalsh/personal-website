// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Helper: fresh import after module reset
async function freshImport() {
  return import('@/lib/device') as Promise<typeof import('@/lib/device')>;
}

describe('lib/device', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  // ---------- getDeviceContextSlim ----------

  describe('getDeviceContextSlim', () => {
    it('returns an object with expected shape', async () => {
      const { getDeviceContextSlim } = await freshImport();
      const ctx = getDeviceContextSlim();

      expect(ctx).toHaveProperty('screen');
      expect(ctx).toHaveProperty('dpr');
      expect(ctx).toHaveProperty('viewport');
      expect(ctx).toHaveProperty('orientation');
      expect(ctx).toHaveProperty('language');
      expect(ctx).toHaveProperty('timezone');
      expect(ctx).toHaveProperty('touchPoints');
      expect(ctx).toHaveProperty('cores');
      expect(ctx).toHaveProperty('connection');
      expect(ctx).toHaveProperty('platform');
    });

    it('caches result on subsequent calls', async () => {
      const { getDeviceContextSlim } = await freshImport();
      const first = getDeviceContextSlim();
      const second = getDeviceContextSlim();
      expect(first).toBe(second); // same reference
    });

    it('returns string values for screen and viewport', async () => {
      const { getDeviceContextSlim } = await freshImport();
      const ctx = getDeviceContextSlim();

      expect(typeof ctx.screen).toBe('string');
      expect(typeof ctx.viewport).toBe('string');
      expect(ctx.screen).toMatch(/^\d+x\d+$/);
      expect(ctx.viewport).toMatch(/^\d+x\d+$/);
    });

    it('returns numeric value for dpr', async () => {
      const { getDeviceContextSlim } = await freshImport();
      const ctx = getDeviceContextSlim();

      expect(typeof ctx.dpr).toBe('number');
    });
  });
});
