import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/admin/lib/analytics-rollups', () => ({
  refreshAnalyticsRollups: vi.fn(() => Promise.resolve({
    status: 'configured',
    windowDays: 8,
    dayRows: 1,
    dimensionRows: 2,
    startedAt: '2026-04-26T07:15:00.000Z',
    completedAt: '2026-04-26T07:16:00.000Z',
    missingEnv: [],
  })),
}));

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('admin analytics rollup route', () => {
  it('rejects requests without the cron secret bearer token', async () => {
    process.env.CRON_SECRET = 'secret';
    const { GET } = await import('@/app/api/admin/analytics-rollup/route');

    const response = await GET(new Request('http://localhost/api/admin/analytics-rollup'));

    expect(response.status).toBe(401);
  });

  it('accepts authorized cron requests and clamps oversized backfills', async () => {
    process.env.CRON_SECRET = 'secret';
    const { GET } = await import('@/app/api/admin/analytics-rollup/route');
    const { refreshAnalyticsRollups } = await import('@/app/admin/lib/analytics-rollups');

    const response = await GET(new Request('http://localhost/api/admin/analytics-rollup?days=999', {
      headers: {
        authorization: 'Bearer secret',
      },
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe('configured');
    expect(refreshAnalyticsRollups).toHaveBeenCalledWith(365);
  });
});
