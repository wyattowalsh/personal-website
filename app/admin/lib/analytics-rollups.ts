import 'server-only';

import { randomUUID } from 'node:crypto';
import { createClient, type Client, type InArgs, type Row } from '@libsql/client';
import { INTERACTION_EVENTS, POSTHOG_ROLLUP_QUERY_TIMEOUT_MS, ROLLUP_CHUNK_DAYS } from './analytics-constants';
import { MAX_ANALYTICS_WINDOW_DAYS, clampRollupRefreshDays, type AnalyticsWindowDays } from './analytics-windows';
import { cleanEnvValue, eventList, getPostHogConfig, queryPostHog } from './posthog-query';
import type { AnalyticsMetric, AnalyticsRollupSummary, AnalyticsRow, PageEngagementRow, TrafficPoint, VisitorAnalyticsSnapshot } from './visitor-analytics';

const ROLLUP_DATABASE_ENV = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'] as const;
const ROLLUP_SETUP_ENV = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'CRON_SECRET'] as const;

type RollupStatus = AnalyticsRollupSummary['status'];
type RollupDimensionKind = 'page' | 'referrer' | 'device' | 'event' | 'search' | 'outbound' | 'reading_progress' | 'page_event';

interface RollupConfig {
  url: string;
  authToken: string;
}

interface RollupDay {
  day: string;
  pageviews: number;
  visitors: number;
  sessions: number;
  interactions: number;
  searches: number;
  outboundClicks: number;
}

interface RollupDimension {
  day: string;
  kind: RollupDimensionKind;
  label: string;
  detailKey: string;
  value: number;
  detail?: string;
}

export interface RefreshAnalyticsRollupsResult {
  status: RollupStatus;
  windowDays: number;
  dayRows: number;
  dimensionRows: number;
  startedAt: string;
  completedAt: string;
  missingEnv: string[];
  error?: string;
}

function formatCount(value: number): string {
  return Math.round(value).toLocaleString();
}

function rowNumber(row: Row, key: string): number {
  const numeric = Number(row[key] ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function rowText(row: Row, key: string, fallback = ''): string {
  const value = row[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function toNumber(value: unknown): number {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function toText(value: unknown, fallback = 'Unknown'): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function getRollupConfig(): { config: RollupConfig | null; missingEnv: string[] } {
  const url = cleanEnvValue(process.env.TURSO_DATABASE_URL);
  const authToken = cleanEnvValue(process.env.TURSO_AUTH_TOKEN);
  const missingEnv = ROLLUP_DATABASE_ENV.filter((name) => !cleanEnvValue(process.env[name]));

  if (!url || !authToken) return { config: null, missingEnv };
  return { config: { url, authToken }, missingEnv: [] };
}

function getRollupSetupMissingEnv(): string[] {
  return ROLLUP_SETUP_ENV.filter((name) => !cleanEnvValue(process.env[name]));
}

function createRollupClient(config: RollupConfig): Client {
  return createClient({
    url: config.url,
    authToken: config.authToken,
  });
}

async function withRollupClient<T>(callback: (client: Client) => Promise<T>): Promise<T> {
  const { config, missingEnv } = getRollupConfig();
  if (!config) {
    throw new Error(`Missing analytics rollup env vars: ${missingEnv.join(', ')}`);
  }

  const client = createRollupClient(config);
  try {
    return await callback(client);
  } finally {
    client.close();
  }
}

export async function ensureAnalyticsRollupSchema(client: Client): Promise<void> {
  await client.batch([
    `CREATE TABLE IF NOT EXISTS analytics_rollup_days (
      day TEXT PRIMARY KEY,
      pageviews INTEGER NOT NULL,
      visitors INTEGER NOT NULL,
      sessions INTEGER NOT NULL,
      interactions INTEGER NOT NULL,
      searches INTEGER NOT NULL,
      outbound_clicks INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS analytics_rollup_dimensions (
      day TEXT NOT NULL,
      kind TEXT NOT NULL,
      label TEXT NOT NULL,
      detail_key TEXT NOT NULL DEFAULT '',
      value INTEGER NOT NULL,
      detail TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (day, kind, label, detail_key)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_analytics_rollup_dimensions_kind_day
      ON analytics_rollup_dimensions(kind, day)`,
    `CREATE TABLE IF NOT EXISTS analytics_rollup_runs (
      id TEXT PRIMARY KEY,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      status TEXT NOT NULL,
      window_days INTEGER NOT NULL,
      error TEXT
    )`,
  ], 'write');
}

function cutoffDay(windowDays: number, now = new Date()): string {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  date.setUTCDate(date.getUTCDate() - Math.max(0, windowDays - 1));
  return date.toISOString().slice(0, 10);
}

interface ChunkRange {
  startDay: string;
  endDay: string;
  spanDays: number;
  startDateTime: string;
  endExclusiveDateTime: string;
}

function utcDayOffset(now: Date, dayOffset: number): string {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date.toISOString().slice(0, 10);
}

function nextUtcDay(day: string): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function hogQlDateTime(day: string): string {
  return `${day} 00:00:00`;
}

function buildChunkRanges(totalDays: number, chunkDays = ROLLUP_CHUNK_DAYS, now = new Date()): ChunkRange[] {
  const total = Math.max(1, Math.floor(totalDays));
  const span = Math.max(1, Math.floor(chunkDays));
  const chunks: ChunkRange[] = [];
  let startOffset = -(total - 1);

  while (startOffset <= 0) {
    const remaining = 1 - startOffset;
    const chunkSpan = Math.min(span, remaining);
    const endOffset = startOffset + chunkSpan - 1;
    const startDay = utcDayOffset(now, startOffset);
    const endDay = utcDayOffset(now, endOffset);
    const endExclusiveDay = nextUtcDay(endDay);
    chunks.push({
      startDay,
      endDay,
      spanDays: chunkSpan,
      startDateTime: hogQlDateTime(startDay),
      endExclusiveDateTime: hogQlDateTime(endExclusiveDay),
    });
    startOffset += chunkSpan;
  }

  return chunks;
}

function dailyRowsFromPostHog(rows: unknown[][]): RollupDay[] {
  return rows.map((row) => ({
    day: toText(row[0], 'unknown'),
    pageviews: toNumber(row[1]),
    visitors: toNumber(row[2]),
    sessions: toNumber(row[3]),
    interactions: toNumber(row[4]),
    searches: toNumber(row[5]),
    outboundClicks: toNumber(row[6]),
  })).filter((row) => row.day !== 'unknown');
}

function dimensionRowsFromPostHog(rows: unknown[][], kind: RollupDimensionKind): RollupDimension[] {
  return rows.map((row) => ({
    day: toText(row[0], 'unknown'),
    kind,
    label: toText(row[1], 'Unknown'),
    detailKey: toText(row[2], ''),
    value: toNumber(row[3]),
    detail: typeof row[4] === 'string' && row[4] ? row[4] : undefined,
  })).filter((row) => row.day !== 'unknown' && row.label !== 'Unknown');
}

async function upsertDailyRows(client: Client, rows: RollupDay[], updatedAt: string): Promise<void> {
  if (rows.length === 0) return;

  await client.batch(rows.map((row) => ({
    sql: `INSERT INTO analytics_rollup_days
      (day, pageviews, visitors, sessions, interactions, searches, outbound_clicks, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(day) DO UPDATE SET
        pageviews = excluded.pageviews,
        visitors = excluded.visitors,
        sessions = excluded.sessions,
        interactions = excluded.interactions,
        searches = excluded.searches,
        outbound_clicks = excluded.outbound_clicks,
        updated_at = excluded.updated_at`,
    args: [
      row.day,
      row.pageviews,
      row.visitors,
      row.sessions,
      row.interactions,
      row.searches,
      row.outboundClicks,
      updatedAt,
    ],
  })), 'write');
}

async function insertDimensionRows(client: Client, rows: RollupDimension[], updatedAt: string): Promise<void> {
  if (rows.length === 0) return;

  await client.batch(rows.map((row) => ({
    sql: `INSERT INTO analytics_rollup_dimensions
      (day, kind, label, detail_key, value, detail, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(day, kind, label, detail_key) DO UPDATE SET
        value = excluded.value,
        detail = excluded.detail,
        updated_at = excluded.updated_at`,
    args: [
      row.day,
      row.kind,
      row.label,
      row.detailKey,
      row.value,
      row.detail ?? null,
      updatedAt,
    ],
  })), 'write');
}

function dimensionQuery(select: string, where: string, groupBy: string, orderBy = 'value DESC'): string {
  return `SELECT toString(toDate(timestamp)) AS day, ${select}
    FROM events
    WHERE timestamp >= toDateTime('{startDateTime}', 'UTC')
      AND timestamp < toDateTime('{endExclusiveDateTime}', 'UTC')
      AND ${where}
    GROUP BY day, ${groupBy}
    ORDER BY day ASC, ${orderBy}
    LIMIT 1000`;
}

async function fetchPostHogChunk(chunk: ChunkRange): Promise<{ days: RollupDay[]; dimensions: RollupDimension[] }> {
  const { config, missingEnv } = getPostHogConfig();
  if (!config) {
    throw new Error(`Missing PostHog env vars: ${missingEnv.join(', ')}`);
  }

  const interpolate = (query: string) =>
    query
      .replaceAll('{startDateTime}', chunk.startDateTime)
      .replaceAll('{endExclusiveDateTime}', chunk.endExclusiveDateTime);

  const [daily, pages, referrers, devices, events, searches, outbound, reading, pageEvents] = await Promise.all([
    queryPostHog(
      config,
      'admin rollup days',
      `SELECT toString(toDate(timestamp)) AS day,
        countIf(event = '$pageview') AS pageviews,
        uniqExactIf(distinct_id, event = '$pageview') AS visitors,
        uniqExactIf(properties.session_id, event = '$pageview') AS sessions,
        countIf(event IN (${eventList()})) AS interactions,
        countIf(event IN ('search_query', 'search_no_results')) AS searches,
        countIf(event = 'link_click' AND properties.external = true) AS outbound_clicks
      FROM events
      WHERE timestamp >= toDateTime('${chunk.startDateTime}', 'UTC')
        AND timestamp < toDateTime('${chunk.endExclusiveDateTime}', 'UTC')
      GROUP BY day
      ORDER BY day ASC`,
      POSTHOG_ROLLUP_QUERY_TIMEOUT_MS,
    ),
    queryPostHog(
      config,
      'admin rollup pages',
      interpolate(dimensionQuery(
        `properties.$pathname AS label, '' AS detail_key, count() AS value, concat(toString(uniqExact(distinct_id)), ' visitors') AS detail`,
        `event = '$pageview' AND properties.$pathname != ''`,
        'label',
      )),
      POSTHOG_ROLLUP_QUERY_TIMEOUT_MS,
    ),
    queryPostHog(
      config,
      'admin rollup referrers',
      interpolate(dimensionQuery(
        `properties.$referrer AS label, '' AS detail_key, count() AS value, '' AS detail`,
        `event = '$pageview' AND properties.$referrer != ''`,
        'label',
      )),
      POSTHOG_ROLLUP_QUERY_TIMEOUT_MS,
    ),
    queryPostHog(
      config,
      'admin rollup devices',
      interpolate(dimensionQuery(
        `properties.device_category AS label, '' AS detail_key, count() AS value, '' AS detail`,
        `event = '$pageview'`,
        'label',
      )),
      POSTHOG_ROLLUP_QUERY_TIMEOUT_MS,
    ),
    queryPostHog(
      config,
      'admin rollup events',
      interpolate(dimensionQuery(
        `event AS label, '' AS detail_key, count() AS value, '' AS detail`,
        `event != ''`,
        'label',
      )),
      POSTHOG_ROLLUP_QUERY_TIMEOUT_MS,
    ),
    queryPostHog(
      config,
      'admin rollup searches',
      interpolate(dimensionQuery(
        `properties.query AS label, event AS detail_key, count() AS value, event AS detail`,
        `event IN ('search_query', 'search_no_results') AND properties.query != ''`,
        'label, detail_key',
      )),
      POSTHOG_ROLLUP_QUERY_TIMEOUT_MS,
    ),
    queryPostHog(
      config,
      'admin rollup outbound',
      interpolate(dimensionQuery(
        `properties.href AS label, '' AS detail_key, count() AS value, '' AS detail`,
        `event = 'link_click' AND properties.external = true`,
        'label',
      )),
      POSTHOG_ROLLUP_QUERY_TIMEOUT_MS,
    ),
    queryPostHog(
      config,
      'admin rollup reading',
      interpolate(dimensionQuery(
        `properties.slug AS label, '' AS detail_key, max(properties.percent) AS value, concat(toString(count()), ' events') AS detail`,
        `event = 'reading_progress' AND properties.slug != ''`,
        'label',
        'value DESC',
      )),
      POSTHOG_ROLLUP_QUERY_TIMEOUT_MS,
    ),
    queryPostHog(
      config,
      'admin rollup page events',
      interpolate(dimensionQuery(
        `properties.$pathname AS label, event AS detail_key, count() AS value, '' AS detail`,
        `properties.$pathname != '' AND (event = '$pageview' OR event IN (${eventList()}))`,
        'label, detail_key',
      )),
      POSTHOG_ROLLUP_QUERY_TIMEOUT_MS,
    ),
  ]);

  return {
    days: dailyRowsFromPostHog(daily),
    dimensions: [
      ...dimensionRowsFromPostHog(pages, 'page'),
      ...dimensionRowsFromPostHog(referrers, 'referrer'),
      ...dimensionRowsFromPostHog(devices, 'device'),
      ...dimensionRowsFromPostHog(events, 'event'),
      ...dimensionRowsFromPostHog(searches, 'search'),
      ...dimensionRowsFromPostHog(outbound, 'outbound'),
      ...dimensionRowsFromPostHog(reading, 'reading_progress'),
      ...dimensionRowsFromPostHog(pageEvents, 'page_event'),
    ],
  };
}

export async function refreshAnalyticsRollups(inputDays: unknown = undefined): Promise<RefreshAnalyticsRollupsResult> {
  const days = clampRollupRefreshDays(inputDays);
  const startedAt = new Date().toISOString();
  const runId = randomUUID();
  const chunks = buildChunkRanges(days);

  try {
    return await withRollupClient(async (client) => {
      await ensureAnalyticsRollupSchema(client);
      await client.execute({
        sql: 'INSERT INTO analytics_rollup_runs (id, started_at, status, window_days) VALUES (?, ?, ?, ?)',
        args: [runId, startedAt, 'running', days],
      });

      let totalDayRows = 0;
      let totalDimensionRows = 0;

      for (const chunk of chunks) {
        try {
          const { days: dayRows, dimensions } = await fetchPostHogChunk(chunk);
          await upsertDailyRows(client, dayRows, startedAt);
          await client.execute({
            sql: 'DELETE FROM analytics_rollup_dimensions WHERE day BETWEEN ? AND ?',
            args: [chunk.startDay, chunk.endDay],
          });
          await insertDimensionRows(client, dimensions, startedAt);
          totalDayRows += dayRows.length;
          totalDimensionRows += dimensions.length;
        } catch (chunkError) {
          const completedAt = new Date().toISOString();
          const message = chunkError instanceof Error
            ? chunkError.message
            : 'Analytics rollup chunk failed';
          const errorDetail = `${message} (chunk ${chunk.startDay}..${chunk.endDay})`;
          await client.execute({
            sql: 'UPDATE analytics_rollup_runs SET completed_at = ?, status = ?, error = ? WHERE id = ?',
            args: [completedAt, 'error', errorDetail, runId],
          });
          return {
            status: 'error' as const,
            windowDays: days,
            dayRows: totalDayRows,
            dimensionRows: totalDimensionRows,
            startedAt,
            completedAt,
            missingEnv: [],
            error: errorDetail,
          };
        }
      }

      const completedAt = new Date().toISOString();
      await client.execute({
        sql: 'UPDATE analytics_rollup_runs SET completed_at = ?, status = ? WHERE id = ?',
        args: [completedAt, 'success', runId],
      });

      return {
        status: 'configured' as const,
        windowDays: days,
        dayRows: totalDayRows,
        dimensionRows: totalDimensionRows,
        startedAt,
        completedAt,
        missingEnv: [],
      };
    });
  } catch (error) {
    const completedAt = new Date().toISOString();
    return {
      status: 'error',
      windowDays: days,
      dayRows: 0,
      dimensionRows: 0,
      startedAt,
      completedAt,
      missingEnv: [],
      error: error instanceof Error ? error.message : 'Analytics rollup refresh failed',
    };
  }
}

function aggregateRows(rows: Row[]): Pick<RollupDay, 'pageviews' | 'visitors' | 'sessions' | 'interactions' | 'searches' | 'outboundClicks'> {
  return rows.reduce((totals, row) => ({
    pageviews: totals.pageviews + rowNumber(row, 'pageviews'),
    visitors: totals.visitors + rowNumber(row, 'visitors'),
    sessions: totals.sessions + rowNumber(row, 'sessions'),
    interactions: totals.interactions + rowNumber(row, 'interactions'),
    searches: totals.searches + rowNumber(row, 'searches'),
    outboundClicks: totals.outboundClicks + rowNumber(row, 'outbound_clicks'),
  }), {
    pageviews: 0,
    visitors: 0,
    sessions: 0,
    interactions: 0,
    searches: 0,
    outboundClicks: 0,
  });
}

function rowsByKind(rows: Row[], kind: RollupDimensionKind): Row[] {
  return rows.filter((row) => rowText(row, 'kind') === kind);
}

function aggregateDimensionRows(rows: Row[], limit: number): AnalyticsRow[] {
  const values = new Map<string, { value: number; detail?: string }>();

  for (const row of rows) {
    const label = rowText(row, 'label', 'Unknown');
    const current = values.get(label) ?? { value: 0, detail: undefined };
    current.value += rowNumber(row, 'value');
    current.detail = rowText(row, 'detail') || current.detail;
    values.set(label, current);
  }

  return Array.from(values.entries())
    .map(([label, item]) => ({
      label,
      value: formatCount(item.value),
      detail: item.detail,
    }))
    .sort((a, b) => Number.parseFloat(b.value.replace(/,/g, '')) - Number.parseFloat(a.value.replace(/,/g, '')))
    .slice(0, limit);
}

function buildPageEngagement(rows: Row[]): PageEngagementRow[] {
  const pages = new Map<string, PageEngagementRow>();

  for (const row of rows) {
    const page = rowText(row, 'label', 'Unknown page');
    const detailKey = rowText(row, 'detail_key', 'unknown_event');
    const value = rowNumber(row, 'value');
    const current = pages.get(page) ?? {
      page,
      pageviews: 0,
      visitors: 0,
      interactions: {},
    };

    if (detailKey === '$pageview') {
      current.pageviews += value;
    } else {
      current.interactions[detailKey] = (current.interactions[detailKey] ?? 0) + value;
    }

    pages.set(page, current);
  }

  return Array.from(pages.values())
    .sort((a, b) => (b.pageviews + Object.values(b.interactions).reduce((sum, value) => sum + value, 0)) - (a.pageviews + Object.values(a.interactions).reduce((sum, value) => sum + value, 0)))
    .slice(0, 10);
}

function buildRollupSummary(status: RollupStatus, missingEnv: string[], dayRows: Row[] = [], runRows: Row[] = [], error?: string): AnalyticsRollupSummary {
  const latestDay = dayRows.at(-1);
  const latestRun = runRows[0];

  return {
    status,
    latestDay: latestDay ? rowText(latestDay, 'day') : undefined,
    coveredDays: dayRows.length,
    lastRunStatus: latestRun ? rowText(latestRun, 'status') : undefined,
    lastRunAt: latestRun ? rowText(latestRun, 'completed_at') || rowText(latestRun, 'started_at') : undefined,
    missingEnv,
    error,
  };
}

export async function getAnalyticsRollupHealth(): Promise<AnalyticsRollupSummary> {
  const { config, missingEnv } = getRollupConfig();
  if (!config) return buildRollupSummary('missing_config', getRollupSetupMissingEnv().length ? getRollupSetupMissingEnv() : missingEnv);

  try {
    return await withRollupClient(async (client) => {
      await ensureAnalyticsRollupSchema(client);
      const [daysResult, runsResult] = await Promise.all([
        client.execute('SELECT day FROM analytics_rollup_days ORDER BY day ASC'),
        client.execute('SELECT status, started_at, completed_at FROM analytics_rollup_runs ORDER BY started_at DESC LIMIT 1'),
      ]);
      return buildRollupSummary('configured', getRollupSetupMissingEnv(), daysResult.rows, runsResult.rows);
    });
  } catch (error) {
    return buildRollupSummary('error', [], [], [], error instanceof Error ? error.message : 'Analytics rollup health check failed');
  }
}

export async function getRollupAnalyticsSnapshot(windowDays: AnalyticsWindowDays): Promise<VisitorAnalyticsSnapshot> {
  const { config } = getRollupConfig();
  const generatedAt = new Date().toISOString();
  const source = 'turso_rollup' as const;

  if (!config) {
    return {
      status: 'missing_config',
      generatedAt,
      windowDays,
      source,
      missingEnv: getRollupSetupMissingEnv(),
      overview: [
        { label: 'Visitors', value: 'n/a', description: 'Daily unique browser sum' },
        { label: 'Sessions', value: 'n/a', description: 'Daily session sum' },
        { label: 'Pageviews', value: 'n/a', description: 'Persisted page views' },
        { label: 'Interactions', value: 'n/a', description: 'Persisted custom events' },
      ],
      topPages: [],
      referrers: [],
      devices: [],
      interactions: [],
      searches: [],
      outboundLinks: [],
      readingProgress: [],
      trafficSeries: [],
      eventMix: [],
      pageEngagement: [],
      rollup: buildRollupSummary('missing_config', getRollupSetupMissingEnv()),
    };
  }

  try {
    return await withRollupClient(async (client) => {
      await ensureAnalyticsRollupSchema(client);
      const cutoff = cutoffDay(Math.min(windowDays, MAX_ANALYTICS_WINDOW_DAYS));
      const args: InArgs = [cutoff];
      const [daysResult, dimensionsResult, runsResult] = await Promise.all([
        client.execute({
          sql: `SELECT day, pageviews, visitors, sessions, interactions, searches, outbound_clicks
            FROM analytics_rollup_days
            WHERE day >= ?
            ORDER BY day ASC`,
          args,
        }),
        client.execute({
          sql: `SELECT day, kind, label, detail_key, value, detail
            FROM analytics_rollup_dimensions
            WHERE day >= ?
            ORDER BY day ASC, value DESC`,
          args,
        }),
        client.execute('SELECT status, started_at, completed_at FROM analytics_rollup_runs ORDER BY started_at DESC LIMIT 1'),
      ]);
      const totals = aggregateRows(daysResult.rows);
      const dimensions = dimensionsResult.rows;
      const eventRows = aggregateDimensionRows(rowsByKind(dimensions, 'event'), 12);

      return {
        status: 'configured',
        generatedAt,
        windowDays,
        source,
        missingEnv: [],
        overview: [
          { label: 'Visitors', value: formatCount(totals.visitors), description: 'Daily unique browser sum' },
          { label: 'Sessions', value: formatCount(totals.sessions), description: 'Daily session sum' },
          { label: 'Pageviews', value: formatCount(totals.pageviews), description: 'Persisted page views' },
          { label: 'Interactions', value: formatCount(totals.interactions), description: 'Persisted custom events' },
        ] satisfies AnalyticsMetric[],
        topPages: aggregateDimensionRows(rowsByKind(dimensions, 'page'), 10),
        referrers: aggregateDimensionRows(rowsByKind(dimensions, 'referrer'), 10),
        devices: aggregateDimensionRows(rowsByKind(dimensions, 'device'), 6),
        interactions: eventRows.filter((row) => INTERACTION_EVENTS.includes(row.label as typeof INTERACTION_EVENTS[number])),
        searches: aggregateDimensionRows(rowsByKind(dimensions, 'search'), 10),
        outboundLinks: aggregateDimensionRows(rowsByKind(dimensions, 'outbound'), 10),
        readingProgress: aggregateDimensionRows(rowsByKind(dimensions, 'reading_progress'), 10).map((row) => ({
          ...row,
          value: `${row.value}%`,
        })),
        trafficSeries: daysResult.rows.map((row) => ({
          date: rowText(row, 'day', 'Unknown date'),
          pageviews: rowNumber(row, 'pageviews'),
          visitors: rowNumber(row, 'visitors'),
          sessions: rowNumber(row, 'sessions'),
        })) satisfies TrafficPoint[],
        eventMix: eventRows,
        pageEngagement: buildPageEngagement(rowsByKind(dimensions, 'page_event')),
        rollup: buildRollupSummary('configured', getRollupSetupMissingEnv(), daysResult.rows, runsResult.rows),
      };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analytics rollup query failed';
    return {
      status: 'error',
      generatedAt,
      windowDays,
      source,
      missingEnv: [],
      error: message,
      overview: [
        { label: 'Visitors', value: 'n/a', description: 'Daily unique browser sum' },
        { label: 'Sessions', value: 'n/a', description: 'Daily session sum' },
        { label: 'Pageviews', value: 'n/a', description: 'Persisted page views' },
        { label: 'Interactions', value: 'n/a', description: 'Persisted custom events' },
      ],
      topPages: [],
      referrers: [],
      devices: [],
      interactions: [],
      searches: [],
      outboundLinks: [],
      readingProgress: [],
      trafficSeries: [],
      eventMix: [],
      pageEngagement: [],
      rollup: buildRollupSummary('error', [], [], [], message),
    };
  }
}
