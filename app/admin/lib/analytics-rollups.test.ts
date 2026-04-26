import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureAnalyticsRollupSchema, getRollupAnalyticsSnapshot, refreshAnalyticsRollups } from './analytics-rollups';

const mockClient = {
  batch: vi.fn(),
  execute: vi.fn(),
  close: vi.fn(),
};

vi.mock('@libsql/client', () => ({
  createClient: vi.fn(() => mockClient),
}));

const ORIGINAL_ENV = process.env;

function configureEnv(): void {
  process.env.TURSO_DATABASE_URL = 'libsql://example.turso.io';
  process.env.TURSO_AUTH_TOKEN = 'token';
  process.env.NEXT_PUBLIC_POSTHOG_TOKEN = 'phc_pub';
  process.env.POSTHOG_PERSONAL_API_KEY = 'phx_secret';
  process.env.POSTHOG_PROJECT_ID = '12345';
}

function emptyPostHogResponse(): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ results: [] }),
  } as Response;
}

function executeSql(call: unknown[]): string {
  const arg = call[0];
  if (arg && typeof arg === 'object' && 'sql' in arg) {
    return String((arg as { sql: string }).sql);
  }
  return typeof arg === 'string' ? arg : '';
}

function executeArgs(call: unknown[]): unknown[] {
  const arg = call[0];
  if (arg && typeof arg === 'object' && 'args' in arg) {
    const args = (arg as { args?: unknown }).args;
    return Array.isArray(args) ? args : [];
  }
  return [];
}

beforeEach(() => {
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
  mockClient.batch.mockReset();
  mockClient.batch.mockResolvedValue([]);
  mockClient.execute.mockReset();
  mockClient.close.mockReset();
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
  vi.unstubAllGlobals();
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

  describe('refreshAnalyticsRollups', () => {
    it('chunks a 365-day refresh into 13 ranges and writes a single run row', async () => {
      configureEnv();
      const fetchMock = vi.fn(async () => emptyPostHogResponse());
      vi.stubGlobal('fetch', fetchMock);
      mockClient.execute.mockResolvedValue({ rows: [] });

      const result = await refreshAnalyticsRollups(365);

      expect(result.status).toBe('configured');
      expect(result.windowDays).toBe(365);
      expect(fetchMock).toHaveBeenCalledTimes(13 * 9);

      const runInserts = mockClient.execute.mock.calls.filter((call) =>
        executeSql(call).includes('INSERT INTO analytics_rollup_runs'),
      );
      expect(runInserts).toHaveLength(1);
      expect(executeArgs(runInserts[0])).toEqual(expect.arrayContaining(['running', 365]));

      const runUpdates = mockClient.execute.mock.calls.filter((call) =>
        executeSql(call).includes('UPDATE analytics_rollup_runs'),
      );
      expect(runUpdates).toHaveLength(1);
      expect(executeArgs(runUpdates[0])).toContain('success');

      const dimensionDeletes = mockClient.execute.mock.calls.filter((call) =>
        executeSql(call).includes('DELETE FROM analytics_rollup_dimensions'),
      );
      expect(dimensionDeletes).toHaveLength(13);
    });

    it('isolates a chunk failure and records the failing range in the run error', async () => {
      configureEnv();
      let callCount = 0;
      const fetchMock = vi.fn(async () => {
        callCount += 1;
        if (callCount > 9) {
          throw new Error('PostHog timeout');
        }
        return emptyPostHogResponse();
      });
      vi.stubGlobal('fetch', fetchMock);
      mockClient.execute.mockResolvedValue({ rows: [] });

      const result = await refreshAnalyticsRollups(60);

      expect(result.status).toBe('error');
      expect(result.error).toContain('PostHog timeout');
      expect(result.error).toMatch(/chunk \d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}/);

      const dimensionDeletes = mockClient.execute.mock.calls.filter((call) =>
        executeSql(call).includes('DELETE FROM analytics_rollup_dimensions'),
      );
      expect(dimensionDeletes).toHaveLength(1);

      const runInserts = mockClient.execute.mock.calls.filter((call) =>
        executeSql(call).includes('INSERT INTO analytics_rollup_runs'),
      );
      expect(runInserts).toHaveLength(1);

      const errorUpdates = mockClient.execute.mock.calls.filter((call) =>
        executeSql(call).includes('UPDATE analytics_rollup_runs')
        && executeArgs(call).includes('error'),
      );
      expect(errorUpdates).toHaveLength(1);
    });

    it('never sends LIMIT 500 in any dimension query', async () => {
      configureEnv();
      const bodies: string[] = [];
      const fetchMock = vi.fn(async (_: unknown, init: RequestInit) => {
        bodies.push(typeof init.body === 'string' ? init.body : '');
        return emptyPostHogResponse();
      });
      vi.stubGlobal('fetch', fetchMock);
      mockClient.execute.mockResolvedValue({ rows: [] });

      await refreshAnalyticsRollups(8);

      expect(bodies.length).toBeGreaterThan(0);
      for (const body of bodies) {
        expect(body).not.toContain('LIMIT 500');
      }
    });

    it('uses explicit UTC calendar-day bounds for PostHog chunks', async () => {
      configureEnv();
      const bodies: string[] = [];
      const fetchMock = vi.fn(async (_: unknown, init: RequestInit) => {
        bodies.push(typeof init.body === 'string' ? init.body : '');
        return emptyPostHogResponse();
      });
      vi.stubGlobal('fetch', fetchMock);
      mockClient.execute.mockResolvedValue({ rows: [] });

      await refreshAnalyticsRollups(31);

      expect(fetchMock).toHaveBeenCalledTimes(2 * 9);
      for (const body of bodies) {
        expect(body).toContain("timestamp >= toDateTime('");
        expect(body).toContain("AND timestamp < toDateTime('");
        expect(body).toContain("', 'UTC')");
        expect(body).not.toContain('now() - INTERVAL');
        expect(body).not.toContain('BETWEEN now()');
      }

      const dimensionDeletes = mockClient.execute.mock.calls.filter((call) =>
        executeSql(call).includes('DELETE FROM analytics_rollup_dimensions'),
      );
      expect(dimensionDeletes).toHaveLength(2);

      const [olderStart, olderEnd] = executeArgs(dimensionDeletes[0]) as [string, string];
      const [newerStart, newerEnd] = executeArgs(dimensionDeletes[1]) as [string, string];
      expect(new Date(`${olderEnd}T00:00:00.000Z`).getTime() + 86_400_000)
        .toBe(new Date(`${newerStart}T00:00:00.000Z`).getTime());
      expect(new Date(`${olderStart}T00:00:00.000Z`).getTime())
        .toBeLessThanOrEqual(new Date(`${olderEnd}T00:00:00.000Z`).getTime());
      expect(newerStart).toBe(newerEnd);
    });

    it('does not group dimension queries by day', async () => {
      configureEnv();
      const bodies: string[] = [];
      const fetchMock = vi.fn(async (_: unknown, init: RequestInit) => {
        bodies.push(typeof init.body === 'string' ? init.body : '');
        return emptyPostHogResponse();
      });
      vi.stubGlobal('fetch', fetchMock);
      mockClient.execute.mockResolvedValue({ rows: [] });

      await refreshAnalyticsRollups(8);

      const dimensionBodies = bodies.filter((body) => !body.includes('pageviews'));
      expect(dimensionBodies.length).toBe(8);
      for (const body of dimensionBodies) {
        expect(body).not.toMatch(/GROUP BY[^"]*\bday\b/);
      }
    });
  });
});
