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
  const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const apiHost = (process.env.POSTHOG_API_HOST || deriveApiHostFromCaptureHost(process.env.NEXT_PUBLIC_POSTHOG_HOST)).replace(/\/+$/, '');

  if (!process.env.NEXT_PUBLIC_POSTHOG_TOKEN) missingEnv.push('NEXT_PUBLIC_POSTHOG_TOKEN');
  if (!personalApiKey) missingEnv.push('POSTHOG_PERSONAL_API_KEY');
  if (!projectId) missingEnv.push('POSTHOG_PROJECT_ID');

  if (!personalApiKey || !projectId || !process.env.NEXT_PUBLIC_POSTHOG_TOKEN) {
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

  return Array.isArray(payload.results) ? payload.results : [];
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
    ]);

    const overview = overviewRows[0] ?? [];
    const interactionsTotal = interactionRows.reduce((sum, row) => sum + Number(row[1] ?? 0), 0);

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
    };
  } catch (error) {
    return emptySnapshot(
      'error',
      [],
      error instanceof Error ? error.message : 'PostHog analytics query failed'
    );
  }
}
