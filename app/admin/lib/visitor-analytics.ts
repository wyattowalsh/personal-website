import 'server-only';

const DEFAULT_POSTHOG_API_HOST = 'https://us.posthog.com';
const ANALYTICS_WINDOW_DAYS = 30;
const POSTHOG_QUERY_TIMEOUT_MS = 10_000;
const INTERACTION_EVENTS = [
  'reading_progress',
  'time_on_page',
  'search_query',
  'search_no_results',
  'share_click',
  'scroll_depth',
  'link_click',
  'code_copied',
  'theme_changed',
] as const;

export type AnalyticsStatus = 'configured' | 'missing_config' | 'error';

export interface AnalyticsMetric {
  label: string;
  value: string;
  description: string;
}

export interface AnalyticsRow {
  label: string;
  value: string;
  detail?: string;
}

export interface TrafficPoint {
  date: string;
  pageviews: number;
  visitors: number;
  sessions: number;
}

export interface PageEngagementRow {
  page: string;
  pageviews: number;
  visitors: number;
  interactions: Record<string, number>;
}

export interface VisitorAnalyticsSnapshot {
  status: AnalyticsStatus;
  generatedAt: string;
  windowDays: number;
  missingEnv: string[];
  error?: string;
  overview: AnalyticsMetric[];
  topPages: AnalyticsRow[];
  referrers: AnalyticsRow[];
  devices: AnalyticsRow[];
  interactions: AnalyticsRow[];
  searches: AnalyticsRow[];
  outboundLinks: AnalyticsRow[];
  readingProgress: AnalyticsRow[];
  trafficSeries: TrafficPoint[];
  eventMix: AnalyticsRow[];
  pageEngagement: PageEngagementRow[];
}

interface PostHogConfig {
  apiHost: string;
  personalApiKey: string;
  projectId: string;
}

interface PostHogQueryResponse {
  results?: unknown[][];
  error?: string;
  detail?: string;
}

function cleanEnvValue(value: string | undefined): string | undefined {
  const cleaned = value?.trim().replace(/\\n$/g, '');
  return cleaned || undefined;
}

function deriveApiHostFromCaptureHost(captureHost?: string): string {
  if (!captureHost) return DEFAULT_POSTHOG_API_HOST;

  try {
    const url = new URL(captureHost);
    url.hostname = url.hostname.replace('.i.posthog.com', '.posthog.com');
    return url.origin;
  } catch {
    return DEFAULT_POSTHOG_API_HOST;
  }
}

function getPostHogConfig(): { config: PostHogConfig | null; missingEnv: string[] } {
  const missingEnv: string[] = [];
  const publicToken = cleanEnvValue(process.env.NEXT_PUBLIC_POSTHOG_TOKEN);
  const personalApiKey = cleanEnvValue(process.env.POSTHOG_PERSONAL_API_KEY);
  const projectId = cleanEnvValue(process.env.POSTHOG_PROJECT_ID);
  const apiHost = (
    cleanEnvValue(process.env.POSTHOG_API_HOST)
    || deriveApiHostFromCaptureHost(cleanEnvValue(process.env.NEXT_PUBLIC_POSTHOG_HOST))
  ).replace(/\/+$/, '');

  if (!publicToken) missingEnv.push('NEXT_PUBLIC_POSTHOG_TOKEN');
  if (!personalApiKey) missingEnv.push('POSTHOG_PERSONAL_API_KEY');
  if (!projectId) missingEnv.push('POSTHOG_PROJECT_ID');

  if (!personalApiKey || !projectId || !publicToken) {
    return { config: null, missingEnv };
  }

  return {
    config: { apiHost, personalApiKey, projectId },
    missingEnv,
  };
}

function emptySnapshot(status: AnalyticsStatus, missingEnv: string[] = [], error?: string): VisitorAnalyticsSnapshot {
  return {
    status,
    generatedAt: new Date().toISOString(),
    windowDays: ANALYTICS_WINDOW_DAYS,
    missingEnv,
    error,
    overview: [
      { label: 'Visitors', value: 'n/a', description: 'Unique anonymous browsers' },
      { label: 'Sessions', value: 'n/a', description: 'Per-tab visit sessions' },
      { label: 'Pageviews', value: 'n/a', description: 'Tracked PostHog page views' },
      { label: 'Interactions', value: 'n/a', description: 'Custom site events' },
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
  };
}

function formatCount(value: unknown): string {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return '0';
  return Math.round(numeric).toLocaleString();
}

function asText(value: unknown, fallback = 'Unknown'): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function eventList(): string {
  return INTERACTION_EVENTS.map((event) => `'${event}'`).join(', ');
}

function toNumber(value: unknown): number {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

async function queryPostHog(config: PostHogConfig, name: string, query: string): Promise<unknown[][]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), POSTHOG_QUERY_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${config.apiHost}/api/projects/${config.projectId}/query/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.personalApiKey}`,
      },
      body: JSON.stringify({
        name,
        query: {
          kind: 'HogQLQuery',
          query,
        },
      }),
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`PostHog query timed out after ${Math.round(POSTHOG_QUERY_TIMEOUT_MS / 1000)}s`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await response.json().catch(() => ({}))) as PostHogQueryResponse;

  if (!response.ok) {
    throw new Error(payload.detail || payload.error || `PostHog query failed with ${response.status}`);
  }

  if (!Array.isArray(payload.results)) {
    throw new Error('PostHog query response did not include results');
  }

  return payload.results;
}

function rowsToAnalyticsRows(
  rows: unknown[][],
  labelFallback: string,
  detail?: (row: unknown[]) => string | undefined
): AnalyticsRow[] {
  return rows.map((row) => ({
    label: asText(row[0], labelFallback),
    value: formatCount(row[1]),
    detail: detail?.(row),
  }));
}

export async function getVisitorAnalyticsSnapshot(): Promise<VisitorAnalyticsSnapshot> {
  const { config, missingEnv } = getPostHogConfig();
  if (!config) return emptySnapshot('missing_config', missingEnv);

  try {
    const [
      overviewRows,
      interactionRows,
      topPageRows,
      referrerRows,
      deviceRows,
      searchRows,
      outboundRows,
      readingRows,
      trafficRows,
      eventMixRows,
      pageEventRows,
    ] = await Promise.all([
      queryPostHog(
        config,
        'admin overview',
        `SELECT count() AS pageviews, uniqExact(distinct_id) AS visitors, uniqExact(properties.session_id) AS sessions
         FROM events
         WHERE timestamp >= now() - INTERVAL ${ANALYTICS_WINDOW_DAYS} DAY AND event = '$pageview'`
      ),
      queryPostHog(
        config,
        'admin interaction totals',
        `SELECT event, count() AS count
         FROM events
         WHERE timestamp >= now() - INTERVAL ${ANALYTICS_WINDOW_DAYS} DAY AND event IN (${eventList()})
         GROUP BY event
         ORDER BY count DESC`
      ),
      queryPostHog(
        config,
        'admin top pages',
        `SELECT properties.$pathname AS path, count() AS views, uniqExact(distinct_id) AS visitors
         FROM events
         WHERE timestamp >= now() - INTERVAL ${ANALYTICS_WINDOW_DAYS} DAY AND event = '$pageview'
         GROUP BY path
         ORDER BY views DESC
         LIMIT 10`
      ),
      queryPostHog(
        config,
        'admin referrers',
        `SELECT properties.$referrer AS referrer, count() AS visits
         FROM events
         WHERE timestamp >= now() - INTERVAL ${ANALYTICS_WINDOW_DAYS} DAY
           AND event = '$pageview'
           AND properties.$referrer != ''
         GROUP BY referrer
         ORDER BY visits DESC
         LIMIT 10`
      ),
      queryPostHog(
        config,
        'admin devices',
        `SELECT properties.device_category AS device, count() AS views
         FROM events
         WHERE timestamp >= now() - INTERVAL ${ANALYTICS_WINDOW_DAYS} DAY AND event = '$pageview'
         GROUP BY device
         ORDER BY views DESC
         LIMIT 6`
      ),
      queryPostHog(
        config,
        'admin searches',
        `SELECT properties.query AS query, count() AS count, event
         FROM events
         WHERE timestamp >= now() - INTERVAL ${ANALYTICS_WINDOW_DAYS} DAY
           AND event IN ('search_query', 'search_no_results')
           AND properties.query != ''
         GROUP BY query, event
         ORDER BY count DESC
         LIMIT 10`
      ),
      queryPostHog(
        config,
        'admin outbound links',
        `SELECT properties.href AS href, count() AS clicks
         FROM events
         WHERE timestamp >= now() - INTERVAL ${ANALYTICS_WINDOW_DAYS} DAY
           AND event = 'link_click'
           AND properties.external = true
         GROUP BY href
         ORDER BY clicks DESC
         LIMIT 10`
      ),
      queryPostHog(
        config,
        'admin reading progress',
        `SELECT properties.slug AS slug, max(properties.percent) AS max_percent, count() AS events
         FROM events
         WHERE timestamp >= now() - INTERVAL ${ANALYTICS_WINDOW_DAYS} DAY
           AND event = 'reading_progress'
           AND properties.slug != ''
         GROUP BY slug
         ORDER BY max_percent DESC, events DESC
         LIMIT 10`
      ),
      queryPostHog(
        config,
        'admin traffic series',
        `SELECT toString(toDate(timestamp)) AS date, count() AS pageviews, uniqExact(distinct_id) AS visitors, uniqExact(properties.session_id) AS sessions
         FROM events
         WHERE timestamp >= now() - INTERVAL ${ANALYTICS_WINDOW_DAYS} DAY AND event = '$pageview'
         GROUP BY date
         ORDER BY date ASC`
      ),
      queryPostHog(
        config,
        'admin event mix',
        `SELECT event, count() AS count
         FROM events
         WHERE timestamp >= now() - INTERVAL ${ANALYTICS_WINDOW_DAYS} DAY
         GROUP BY event
         ORDER BY count DESC
         LIMIT 12`
      ),
      queryPostHog(
        config,
        'admin page event matrix',
        `SELECT properties.$pathname AS path, event, count() AS count
         FROM events
         WHERE timestamp >= now() - INTERVAL ${ANALYTICS_WINDOW_DAYS} DAY
           AND properties.$pathname != ''
           AND (event = '$pageview' OR event IN (${eventList()}))
         GROUP BY path, event
         ORDER BY count DESC
         LIMIT 80`
      ),
    ]);

    const overview = overviewRows[0] ?? [];
    const interactionsTotal = interactionRows.reduce((sum, row) => sum + Number(row[1] ?? 0), 0);
    const topPageVisitorCounts = new Map(topPageRows.map((row) => [asText(row[0], 'Unknown page'), toNumber(row[2])]));
    const pageEngagementMap = new Map<string, PageEngagementRow>();

    for (const row of pageEventRows) {
      const page = asText(row[0], 'Unknown page');
      const event = asText(row[1], 'unknown_event');
      const count = toNumber(row[2]);
      const current = pageEngagementMap.get(page) ?? {
        page,
        pageviews: 0,
        visitors: topPageVisitorCounts.get(page) ?? 0,
        interactions: {},
      };

      if (event === '$pageview') {
        current.pageviews = count;
      } else {
        current.interactions[event] = count;
      }

      pageEngagementMap.set(page, current);
    }

    return {
      status: 'configured',
      generatedAt: new Date().toISOString(),
      windowDays: ANALYTICS_WINDOW_DAYS,
      missingEnv: [],
      overview: [
        { label: 'Visitors', value: formatCount(overview[1]), description: 'Unique anonymous browsers' },
        { label: 'Sessions', value: formatCount(overview[2]), description: 'Per-tab visit sessions' },
        { label: 'Pageviews', value: formatCount(overview[0]), description: 'Tracked PostHog page views' },
        { label: 'Interactions', value: formatCount(interactionsTotal), description: 'Custom site events' },
      ],
      topPages: rowsToAnalyticsRows(topPageRows, 'Unknown page', (row) => `${formatCount(row[2])} visitors`),
      referrers: rowsToAnalyticsRows(referrerRows, 'Direct / unknown'),
      devices: rowsToAnalyticsRows(deviceRows, 'Unknown device'),
      interactions: rowsToAnalyticsRows(interactionRows, 'Unknown event'),
      searches: rowsToAnalyticsRows(searchRows, 'Unknown search', (row) => asText(row[2], 'search_query')),
      outboundLinks: rowsToAnalyticsRows(outboundRows, 'Unknown link'),
      readingProgress: readingRows.map((row) => ({
        label: asText(row[0], 'Unknown post'),
        value: `${formatCount(row[1])}%`,
        detail: `${formatCount(row[2])} events`,
      })),
      trafficSeries: trafficRows.map((row) => ({
        date: asText(row[0], 'Unknown date'),
        pageviews: toNumber(row[1]),
        visitors: toNumber(row[2]),
        sessions: toNumber(row[3]),
      })),
      eventMix: rowsToAnalyticsRows(eventMixRows, 'Unknown event'),
      pageEngagement: Array.from(pageEngagementMap.values())
        .sort((a, b) => (b.pageviews + Object.values(b.interactions).reduce((sum, value) => sum + value, 0)) - (a.pageviews + Object.values(a.interactions).reduce((sum, value) => sum + value, 0)))
        .slice(0, 10),
    };
  } catch (error) {
    return emptySnapshot(
      'error',
      [],
      error instanceof Error ? error.message : 'PostHog analytics query failed'
    );
  }
}
