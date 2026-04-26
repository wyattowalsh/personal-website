import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureAnalyticsRollupSchema, getRollupAnalyticsSnapshot } from './analytics-rollups';

const mockClient = {
  batch: vi.fn(),
  execute: vi.fn(),
  close: vi.fn(),
};

vi.mock('@libsql/client', () => ({
  createClient: vi.fn(() => mockClient),
}));

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
  mockClient.batch.mockResolvedValue([]);
  mockClient.execute.mockReset();
  mockClient.close.mockReset();
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('analytics rollups', () => {
  it('creates the rollup schema idempotently', async () => {
    await ensureAnalyticsRollupSchema(mockClient as never);

    expect(mockClient.batch).toHaveBeenCalledOnce();
    const [statements, mode] = mockClient.batch.mock.calls[0];
    expect(mode).toBe('write');
    expect(statements.join('\n')).toContain('CREATE TABLE IF NOT EXISTS analytics_rollup_days');
    expect(statements.join('\n')).toContain('CREATE TABLE IF NOT EXISTS analytics_rollup_dimensions');
    expect(statements.join('\n')).toContain('CREATE TABLE IF NOT EXISTS analytics_rollup_runs');
  });

  it('returns missing setup state when Turso env vars are absent', async () => {
    delete process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_AUTH_TOKEN;

    const snapshot = await getRollupAnalyticsSnapshot(90);

    expect(snapshot.status).toBe('missing_config');
    expect(snapshot.source).toBe('turso_rollup');
    expect(snapshot.missingEnv).toEqual(['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'CRON_SECRET']);
    expect(snapshot.rollup?.status).toBe('missing_config');
  });

  it('maps persisted daily and dimension rows into the admin snapshot', async () => {
    process.env.TURSO_DATABASE_URL = 'libsql://example.turso.io';
    process.env.TURSO_AUTH_TOKEN = 'token';
    mockClient.execute
      .mockResolvedValueOnce({
        rows: [
          { day: '2026-04-25', pageviews: 2, visitors: 1, sessions: 1, interactions: 3, searches: 1, outbound_clicks: 1 },
          { day: '2026-04-26', pageviews: 4, visitors: 2, sessions: 2, interactions: 5, searches: 2, outbound_clicks: 1 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { day: '2026-04-26', kind: 'page', label: '/blog', detail_key: '', value: 4, detail: '2 visitors' },
          { day: '2026-04-26', kind: 'event', label: '$pageview', detail_key: '', value: 4, detail: '' },
          { day: '2026-04-26', kind: 'event', label: 'search_query', detail_key: '', value: 2, detail: '' },
          { day: '2026-04-26', kind: 'search', label: 'nextjs', detail_key: 'search_query', value: 2, detail: 'search_query' },
          { day: '2026-04-26', kind: 'page_event', label: '/blog', detail_key: '$pageview', value: 4, detail: '' },
          { day: '2026-04-26', kind: 'page_event', label: '/blog', detail_key: 'search_query', value: 2, detail: '' },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ status: 'success', started_at: '2026-04-26T07:15:00.000Z', completed_at: '2026-04-26T07:16:00.000Z' }],
      });

    const snapshot = await getRollupAnalyticsSnapshot(90);

    expect(snapshot.status).toBe('configured');
    expect(snapshot.overview).toEqual([
      { label: 'Visitors', value: '3', description: 'Daily unique browser sum' },
      { label: 'Sessions', value: '3', description: 'Daily session sum' },
      { label: 'Pageviews', value: '6', description: 'Persisted page views' },
      { label: 'Interactions', value: '8', description: 'Persisted custom events' },
    ]);
    expect(snapshot.topPages).toEqual([{ label: '/blog', value: '4', detail: '2 visitors' }]);
    expect(snapshot.eventMix).toEqual([
      { label: '$pageview', value: '4', detail: undefined },
      { label: 'search_query', value: '2', detail: undefined },
    ]);
    expect(snapshot.pageEngagement).toEqual([{
      page: '/blog',
      pageviews: 4,
      visitors: 0,
      interactions: { search_query: 2 },
    }]);
    expect(snapshot.rollup).toMatchObject({
      status: 'configured',
      latestDay: '2026-04-26',
      coveredDays: 2,
      lastRunStatus: 'success',
    });
  });
});
