import 'server-only';

import { createSign } from 'node:crypto';
import { BackendService } from '@/lib/server';
import type { Post } from '@/lib/types';
import { getVisitorAnalyticsSnapshot, type AnalyticsMetric, type AnalyticsRow, type VisitorAnalyticsSnapshot } from './visitor-analytics';

const DEFAULT_SITE_URL = 'https://www.w4w.dev';
const DEFAULT_GITHUB_REPOSITORY = 'wyattowalsh/personal-website';
const SEARCH_CONSOLE_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export type AdminProviderStatus = 'configured' | 'missing_config' | 'error' | 'partial';

export interface AdminProviderSnapshot {
  id: string;
  title: string;
  status: AdminProviderStatus;
  lastCheckedAt: string;
  freeTier: string;
  missingEnv: string[];
  cards: AnalyticsMetric[];
  rows: AnalyticsRow[];
  setupSteps: string[];
  sourceUrl: string;
  error?: string;
}

export interface AdminDashboardSnapshot {
  generatedAt: string;
  visitors: VisitorAnalyticsSnapshot;
  growth: AdminProviderSnapshot[];
  performance: AdminProviderSnapshot[];
  operations: AdminProviderSnapshot[];
  contentHealth: AdminProviderSnapshot;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface SearchConsoleRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

interface SearchConsoleResponse {
  rows?: SearchConsoleRow[];
  responseAggregationType?: string;
  error?: {
    message?: string;
  };
}

interface PageSpeedResponse {
  lighthouseResult?: {
    categories?: Record<string, { score?: number }>;
    audits?: Record<string, {
      id?: string;
      title?: string;
      score?: number | null;
      displayValue?: string;
    }>;
  };
  loadingExperience?: {
    metrics?: Record<string, {
      category?: string;
      percentile?: number;
    }>;
  };
  error?: {
    message?: string;
  };
}

interface CruxResponse {
  record?: {
    metrics?: Record<string, {
      percentiles?: {
        p75?: number | string;
      };
      histogram?: Array<{
        density?: number;
      }>;
    }>;
  };
  error?: {
    message?: string;
  };
}

interface VercelDeploymentsResponse {
  deployments?: Array<{
    name?: string;
    url?: string;
    state?: string;
    readyState?: string;
    target?: string;
    createdAt?: number;
    buildingAt?: number;
    ready?: number;
    meta?: Record<string, string | undefined>;
  }>;
  error?: {
    message?: string;
  };
}

interface GitHubWorkflowRunsResponse {
  workflow_runs?: Array<{
    name?: string;
    status?: string;
    conclusion?: string | null;
    html_url?: string;
    created_at?: string;
    updated_at?: string;
    run_started_at?: string;
    head_branch?: string;
    head_sha?: string;
  }>;
  message?: string;
}

interface GitHubDependabotResponseItem {
  state?: string;
  security_advisory?: {
    severity?: string;
  };
  dependency?: {
    package?: {
      name?: string;
    };
  };
}

interface UptimeRobotResponse {
  stat?: string;
  error?: {
    message?: string;
  };
  monitors?: Array<{
    friendly_name?: string;
    status?: number;
    uptime_ratio?: string;
    average_response_time?: number;
    url?: string;
    logs?: Array<{
      type?: number;
      datetime?: number;
      duration?: number;
      reason?: {
        detail?: string;
      };
    }>;
  }>;
}

function nowIso(): string {
  return new Date().toISOString();
}

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
}

function setupCommand(name: string): string {
  return `vercel env add ${name} production`;
}

function isMissing(value: string | undefined): boolean {
  return !value || value.trim() === '';
}

function configuredProvider(input: Omit<AdminProviderSnapshot, 'status' | 'lastCheckedAt' | 'missingEnv' | 'setupSteps' | 'error'>): AdminProviderSnapshot {
  return {
    ...input,
    status: 'configured',
    lastCheckedAt: nowIso(),
    missingEnv: [],
    setupSteps: [],
  };
}

function missingProvider(input: Omit<AdminProviderSnapshot, 'status' | 'lastCheckedAt' | 'cards' | 'rows' | 'setupSteps' | 'error'>): AdminProviderSnapshot {
  return {
    ...input,
    status: 'missing_config',
    lastCheckedAt: nowIso(),
    cards: [],
    rows: [],
    setupSteps: input.missingEnv.map(setupCommand),
  };
}

function errorProvider(
  input: Omit<AdminProviderSnapshot, 'status' | 'lastCheckedAt' | 'missingEnv' | 'cards' | 'rows' | 'setupSteps'>,
  error: unknown
): AdminProviderSnapshot {
  return {
    ...input,
    status: 'error',
    lastCheckedAt: nowIso(),
    missingEnv: [],
    cards: [],
    rows: [],
    setupSteps: [],
    error: error instanceof Error ? error.message : String(error),
  };
}

function formatNumber(value: number | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '0';
  return Math.round(value).toLocaleString();
}

function formatPercent(value: number | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '0%';
  return `${(value * 100).toFixed(1)}%`;
}

function formatScore(value: number | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'n/a';
  return `${Math.round(value * 100)}`;
}

function formatDate(value: string | number | undefined): string {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function dayString(offsetDays: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function base64Url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getGoogleAccessToken(): Promise<string> {
  const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const oauthRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (oauthClientId && oauthClientSecret && oauthRefreshToken) {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: oauthClientId,
        client_secret: oauthClientSecret,
        refresh_token: oauthRefreshToken,
        grant_type: 'refresh_token',
      }),
      next: { revalidate: 3300 },
    });
    const payload = (await response.json().catch(() => ({}))) as GoogleTokenResponse;
    if (!response.ok || !payload.access_token) {
      throw new Error(payload.error_description || payload.error || `Google OAuth token refresh failed with ${response.status}`);
    }
    return payload.access_token;
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) {
    throw new Error('Google OAuth refresh-token credentials are missing');
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64Url(JSON.stringify({
    iss: clientEmail,
    scope: SEARCH_CONSOLE_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: issuedAt + 3600,
    iat: issuedAt,
  }));
  const unsigned = `${header}.${claim}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = base64Url(signer.sign(privateKey));
  const assertion = `${unsigned}.${signature}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    next: { revalidate: 3300 },
  });
  const payload = (await response.json().catch(() => ({}))) as GoogleTokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || `Google token request failed with ${response.status}`);
  }
  return payload.access_token;
}

async function querySearchConsole(accessToken: string, dimension: 'query' | 'page'): Promise<SearchConsoleRow[]> {
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || getSiteUrl();
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: dayString(-28),
        endDate: dayString(-1),
        dimensions: [dimension],
        rowLimit: 8,
        startRow: 0,
      }),
      next: { revalidate: 6 * 60 * 60 },
    }
  );
  const payload = (await response.json().catch(() => ({}))) as SearchConsoleResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || `Search Console query failed with ${response.status}`);
  }
  return payload.rows ?? [];
}

export async function getSearchConsoleSnapshot(): Promise<AdminProviderSnapshot> {
  const missingEnv = ['GOOGLE_SEARCH_CONSOLE_SITE_URL'].filter((name) => isMissing(process.env[name]));
  const oauthEnv = [
    'GOOGLE_OAUTH_CLIENT_ID',
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'GOOGLE_OAUTH_REFRESH_TOKEN',
  ];
  const serviceAccountEnv = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY'];
  const hasCompleteOAuthConfig = oauthEnv.every((name) => !isMissing(process.env[name]));
  const hasCompleteServiceAccountConfig = serviceAccountEnv.every((name) => !isMissing(process.env[name]));
  if (!hasCompleteOAuthConfig && !hasCompleteServiceAccountConfig) {
    missingEnv.push(...oauthEnv.filter((name) => isMissing(process.env[name])));
  }

  if (missingEnv.length > 0) {
    return missingProvider({
      id: 'search-console',
      title: 'Google Search Console',
      freeTier: 'Free API, subject to Google usage limits',
      missingEnv,
      sourceUrl: 'https://developers.google.com/webmaster-tools/pricing',
    });
  }

  try {
    const accessToken = await getGoogleAccessToken();
    const [queries, pages] = await Promise.all([
      querySearchConsole(accessToken, 'query'),
      querySearchConsole(accessToken, 'page'),
    ]);
    const totals = queries.reduce<{ clicks: number; impressions: number }>(
      (acc, row) => ({
        clicks: acc.clicks + (row.clicks ?? 0),
        impressions: acc.impressions + (row.impressions ?? 0),
      }),
      { clicks: 0, impressions: 0 }
    );

    return configuredProvider({
      id: 'search-console',
      title: 'Google Search Console',
      freeTier: 'Free API, subject to Google usage limits',
      sourceUrl: 'https://developers.google.com/webmaster-tools/pricing',
      cards: [
        { label: 'Clicks', value: formatNumber(totals.clicks), description: 'Top query clicks, 28 days' },
        { label: 'Impressions', value: formatNumber(totals.impressions), description: 'Top query impressions, 28 days' },
        { label: 'Queries', value: formatNumber(queries.length), description: 'Queries returned by API' },
        { label: 'Pages', value: formatNumber(pages.length), description: 'Pages returned by API' },
      ],
      rows: [
        ...queries.slice(0, 5).map((row) => ({
          label: row.keys?.[0] ?? 'Unknown query',
          value: formatNumber(row.clicks),
          detail: `${formatNumber(row.impressions)} impressions, ${formatPercent(row.ctr)} CTR, avg ${row.position?.toFixed(1) ?? 'n/a'}`,
        })),
        ...pages.slice(0, 3).map((row) => ({
          label: row.keys?.[0] ?? 'Unknown page',
          value: formatNumber(row.clicks),
          detail: `${formatNumber(row.impressions)} impressions`,
        })),
      ],
    });
  } catch (error) {
    return errorProvider({
      id: 'search-console',
      title: 'Google Search Console',
      freeTier: 'Free API, subject to Google usage limits',
      sourceUrl: 'https://developers.google.com/webmaster-tools/pricing',
    }, error);
  }
}

async function fetchPageSpeed(strategy: 'mobile' | 'desktop'): Promise<PageSpeedResponse> {
  const url = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  url.searchParams.set('url', getSiteUrl());
  url.searchParams.set('strategy', strategy);
  for (const category of ['performance', 'accessibility', 'best-practices', 'seo']) {
    url.searchParams.append('category', category);
  }
  if (process.env.PAGESPEED_API_KEY) url.searchParams.set('key', process.env.PAGESPEED_API_KEY);

  const response = await fetch(url, { next: { revalidate: 12 * 60 * 60 } });
  const payload = (await response.json().catch(() => ({}))) as PageSpeedResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || `PageSpeed request failed with ${response.status}`);
  }
  return payload;
}

async function fetchCrux(): Promise<CruxResponse | null> {
  if (isMissing(process.env.CRUX_API_KEY)) return null;

  const url = new URL('https://chromeuxreport.googleapis.com/v1/records:queryRecord');
  url.searchParams.set('key', process.env.CRUX_API_KEY ?? '');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin: getSiteUrl(), formFactor: 'ALL_FORM_FACTORS' }),
    next: { revalidate: 12 * 60 * 60 },
  });
  const payload = (await response.json().catch(() => ({}))) as CruxResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || `CrUX request failed with ${response.status}`);
  }
  return payload;
}

export async function getPerformanceSnapshot(): Promise<AdminProviderSnapshot> {
  try {
    const [mobile, desktop, crux] = await Promise.all([
      fetchPageSpeed('mobile'),
      fetchPageSpeed('desktop'),
      fetchCrux(),
    ]);
    const mobileCategories = mobile.lighthouseResult?.categories ?? {};
    const desktopCategories = desktop.lighthouseResult?.categories ?? {};
    const cruxMetrics = crux?.record?.metrics ?? {};
    const mobileAudits = Object.values(mobile.lighthouseResult?.audits ?? {})
      .filter((audit) => typeof audit.score === 'number' && audit.score < 0.9)
      .slice(0, 6);

    return {
      id: 'pagespeed-crux',
      title: 'PageSpeed + CrUX',
      status: crux ? 'configured' : 'partial',
      lastCheckedAt: nowIso(),
      freeTier: 'PageSpeed is free with optional API key; CrUX uses a free Google API key',
      missingEnv: crux ? [] : ['CRUX_API_KEY'],
      setupSteps: crux ? [] : [setupCommand('CRUX_API_KEY')],
      sourceUrl: 'https://developers.google.com/speed/docs/insights/v5/get-started',
      cards: [
        { label: 'Mobile Perf', value: formatScore(mobileCategories.performance?.score), description: 'Lighthouse mobile performance' },
        { label: 'Desktop Perf', value: formatScore(desktopCategories.performance?.score), description: 'Lighthouse desktop performance' },
        { label: 'Accessibility', value: formatScore(mobileCategories.accessibility?.score), description: 'Mobile accessibility score' },
        { label: 'SEO', value: formatScore(mobileCategories.seo?.score), description: 'Mobile SEO score' },
      ],
      rows: [
        ...Object.entries(cruxMetrics).map(([name, metric]) => ({
          label: name.replace(/_/g, ' '),
          value: String(metric.percentiles?.p75 ?? 'n/a'),
          detail: 'CrUX p75, 28-day rolling field data',
        })),
        ...mobileAudits.map((audit) => ({
          label: audit.title ?? audit.id ?? 'Lighthouse audit',
          value: formatScore(typeof audit.score === 'number' ? audit.score : undefined),
          detail: audit.displayValue ?? 'Needs attention',
        })),
      ],
    };
  } catch (error) {
    return errorProvider({
      id: 'pagespeed-crux',
      title: 'PageSpeed + CrUX',
      freeTier: 'PageSpeed is free with optional API key; CrUX uses a free Google API key',
      sourceUrl: 'https://developers.google.com/speed/docs/insights/v5/get-started',
    }, error);
  }
}

export async function getVercelSnapshot(): Promise<AdminProviderSnapshot> {
  const missingEnv = ['VERCEL_TOKEN', 'VERCEL_PROJECT_ID'].filter((name) => isMissing(process.env[name]));
  if (missingEnv.length > 0) {
    return missingProvider({
      id: 'vercel',
      title: 'Vercel Deployments',
      freeTier: 'Uses existing Vercel account REST API; Hobby plan is free for personal projects',
      missingEnv,
      sourceUrl: 'https://vercel.com/docs/rest-api/reference/welcome',
    });
  }

  try {
    const url = new URL('https://api.vercel.com/v6/deployments');
    url.searchParams.set('projectId', process.env.VERCEL_PROJECT_ID ?? '');
    url.searchParams.set('limit', '6');
    url.searchParams.set('target', 'production');
    if (process.env.VERCEL_TEAM_ID) url.searchParams.set('teamId', process.env.VERCEL_TEAM_ID);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
      next: { revalidate: 5 * 60 },
    });
    const payload = (await response.json().catch(() => ({}))) as VercelDeploymentsResponse;
    if (!response.ok) {
      throw new Error(payload.error?.message || `Vercel request failed with ${response.status}`);
    }
    const deployments = payload.deployments ?? [];
    const latest = deployments[0];
    const failed = deployments.filter((deployment) => {
      const state = deployment.state ?? deployment.readyState ?? '';
      return state.toUpperCase().includes('ERROR') || state.toUpperCase().includes('FAILED');
    }).length;

    return configuredProvider({
      id: 'vercel',
      title: 'Vercel Deployments',
      freeTier: 'Uses existing Vercel account REST API; Hobby plan is free for personal projects',
      sourceUrl: 'https://vercel.com/docs/rest-api/reference/welcome',
      cards: [
        { label: 'Latest', value: latest?.readyState ?? latest?.state ?? 'n/a', description: latest?.name ?? 'No deployments returned' },
        { label: 'Recent Failed', value: formatNumber(failed), description: 'Recent production deployments' },
        { label: 'Branch', value: latest?.meta?.githubCommitRef ?? 'n/a', description: 'Latest production branch' },
        { label: 'Commit', value: latest?.meta?.githubCommitSha?.slice(0, 7) ?? 'n/a', description: 'Latest production SHA' },
      ],
      rows: deployments.map((deployment) => ({
        label: deployment.url ? `https://${deployment.url}` : deployment.name ?? 'Deployment',
        value: deployment.readyState ?? deployment.state ?? 'unknown',
        detail: `${deployment.meta?.githubCommitRef ?? 'unknown branch'} at ${formatDate(deployment.createdAt)}`,
      })),
    });
  } catch (error) {
    return errorProvider({
      id: 'vercel',
      title: 'Vercel Deployments',
      freeTier: 'Uses existing Vercel account REST API; Hobby plan is free for personal projects',
      sourceUrl: 'https://vercel.com/docs/rest-api/reference/welcome',
    }, error);
  }
}

export async function getGitHubSnapshot(): Promise<AdminProviderSnapshot> {
  const repository = process.env.GITHUB_REPOSITORY || DEFAULT_GITHUB_REPOSITORY;
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const runsResponse = await fetch(`https://api.github.com/repos/${repository}/actions/runs?per_page=8`, {
      headers,
      next: { revalidate: 5 * 60 },
    });
    const runsPayload = (await runsResponse.json().catch(() => ({}))) as GitHubWorkflowRunsResponse;
    if (!runsResponse.ok) {
      throw new Error(runsPayload.message || `GitHub workflow request failed with ${runsResponse.status}`);
    }

    let dependabotAlerts: GitHubDependabotResponseItem[] = [];
    let dependabotError: string | undefined;
    if (process.env.GITHUB_TOKEN) {
      const dependabotResponse = await fetch(`https://api.github.com/repos/${repository}/dependabot/alerts?state=open&per_page=10`, {
        headers,
        next: { revalidate: 5 * 60 },
      });
      if (dependabotResponse.ok) {
        dependabotAlerts = (await dependabotResponse.json().catch(() => [])) as GitHubDependabotResponseItem[];
      } else {
        const payload = (await dependabotResponse.json().catch(() => ({}))) as { message?: string };
        dependabotError = payload.message || `Dependabot request failed with ${dependabotResponse.status}`;
      }
    }

    const runs = runsPayload.workflow_runs ?? [];
    const failed = runs.filter((run) => run.conclusion && run.conclusion !== 'success').length;

    return {
      id: 'github',
      title: 'GitHub Health',
      status: process.env.GITHUB_TOKEN ? 'configured' : 'partial',
      lastCheckedAt: nowIso(),
      freeTier: 'Public REST data is free; token raises rate limits and enables security endpoints',
      missingEnv: process.env.GITHUB_TOKEN ? [] : ['GITHUB_TOKEN'],
      setupSteps: process.env.GITHUB_TOKEN ? [] : [setupCommand('GITHUB_TOKEN')],
      sourceUrl: 'https://docs.github.com/v3/actions/workflow-runs/',
      error: dependabotError,
      cards: [
        { label: 'Workflow Runs', value: formatNumber(runs.length), description: 'Recent GitHub Actions runs' },
        { label: 'Failed Runs', value: formatNumber(failed), description: 'Recent non-success conclusions' },
        { label: 'Dependabot', value: process.env.GITHUB_TOKEN ? formatNumber(dependabotAlerts.length) : 'n/a', description: 'Open alerts, token required' },
        { label: 'Rate Mode', value: process.env.GITHUB_TOKEN ? 'Token' : 'Public', description: process.env.GITHUB_TOKEN ? '5,000/hour class' : '60/hour class' },
      ],
      rows: [
        ...runs.map((run) => ({
          label: run.name ?? 'Workflow run',
          value: run.conclusion ?? run.status ?? 'unknown',
          detail: `${run.head_branch ?? 'unknown branch'} ${run.head_sha?.slice(0, 7) ?? ''} at ${formatDate(run.run_started_at ?? run.created_at)}`,
        })),
        ...dependabotAlerts.slice(0, 5).map((alert) => ({
          label: alert.dependency?.package?.name ?? 'Dependency alert',
          value: alert.security_advisory?.severity ?? alert.state ?? 'open',
          detail: 'Dependabot security alert',
        })),
      ],
    };
  } catch (error) {
    return errorProvider({
      id: 'github',
      title: 'GitHub Health',
      freeTier: 'Public REST data is free; token raises rate limits and enables security endpoints',
      sourceUrl: 'https://docs.github.com/v3/actions/workflow-runs/',
    }, error);
  }
}

function uptimeStatus(value: number | undefined): string {
  switch (value) {
    case 0:
      return 'Paused';
    case 1:
      return 'Not checked';
    case 2:
      return 'Up';
    case 8:
      return 'Seems down';
    case 9:
      return 'Down';
    default:
      return 'Unknown';
  }
}

export async function getUptimeRobotSnapshot(): Promise<AdminProviderSnapshot> {
  const missingEnv = ['UPTIMEROBOT_API_KEY'].filter((name) => isMissing(process.env[name]));
  if (missingEnv.length > 0) {
    return missingProvider({
      id: 'uptimerobot',
      title: 'UptimeRobot',
      freeTier: 'API is included on the Free plan with published free rate limits',
      missingEnv,
      sourceUrl: 'https://uptimerobot.com/api/',
    });
  }

  try {
    const body = new URLSearchParams({
      api_key: process.env.UPTIMEROBOT_API_KEY ?? '',
      format: 'json',
      response_times: '1',
      logs: '1',
    });
    if (process.env.UPTIMEROBOT_MONITOR_ID) {
      body.set('monitors', process.env.UPTIMEROBOT_MONITOR_ID);
    }

    const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      next: { revalidate: 5 * 60 },
    });
    const payload = (await response.json().catch(() => ({}))) as UptimeRobotResponse;
    if (!response.ok || payload.stat === 'fail') {
      throw new Error(payload.error?.message || `UptimeRobot request failed with ${response.status}`);
    }
    const monitors = payload.monitors ?? [];
    const primary = monitors[0];
    const down = monitors.filter((monitor) => monitor.status === 8 || monitor.status === 9).length;

    return configuredProvider({
      id: 'uptimerobot',
      title: 'UptimeRobot',
      freeTier: 'API is included on the Free plan with published free rate limits',
      sourceUrl: 'https://uptimerobot.com/api/',
      cards: [
        { label: 'Status', value: uptimeStatus(primary?.status), description: primary?.friendly_name ?? 'Primary monitor' },
        { label: 'Uptime', value: primary?.uptime_ratio ? `${primary.uptime_ratio}%` : 'n/a', description: 'Monitor reported uptime ratio' },
        { label: 'Avg Response', value: primary?.average_response_time ? `${primary.average_response_time}ms` : 'n/a', description: 'Average response time' },
        { label: 'Down', value: formatNumber(down), description: 'Monitors currently down' },
      ],
      rows: monitors.map((monitor) => ({
        label: monitor.friendly_name ?? monitor.url ?? 'Monitor',
        value: uptimeStatus(monitor.status),
        detail: `${monitor.uptime_ratio ?? 'n/a'}% uptime${monitor.average_response_time ? `, ${monitor.average_response_time}ms avg` : ''}`,
      })),
    });
  } catch (error) {
    return errorProvider({
      id: 'uptimerobot',
      title: 'UptimeRobot',
      freeTier: 'API is included on the Free plan with published free rate limits',
      sourceUrl: 'https://uptimerobot.com/api/',
    }, error);
  }
}

export async function getIndexNowSnapshot(): Promise<AdminProviderSnapshot> {
  const missingEnv = ['INDEXNOW_KEY'].filter((name) => isMissing(process.env[name]));
  if (missingEnv.length > 0) {
    return missingProvider({
      id: 'indexnow',
      title: 'IndexNow',
      freeTier: 'Free open protocol for notifying participating search engines',
      missingEnv,
      sourceUrl: 'https://www.indexnow.org/documentation',
    });
  }

  return configuredProvider({
    id: 'indexnow',
    title: 'IndexNow',
    freeTier: 'Free open protocol for notifying participating search engines',
    sourceUrl: 'https://www.indexnow.org/documentation',
    cards: [
      { label: 'Key', value: 'Configured', description: 'Server-only key is available' },
      { label: 'Endpoint', value: 'Ready', description: 'Admin can add submit actions later' },
      { label: 'Batch Limit', value: '10,000', description: 'URLs per protocol POST' },
      { label: 'Cost', value: '$0', description: 'No paid plan required' },
    ],
    rows: [
      { label: `${getSiteUrl()}/indexnow-key.txt`, value: 'Key file', detail: 'Verification route is served from the app when INDEXNOW_KEY is set' },
      { label: '/api/admin/indexnow', value: 'Admin action', detail: 'Authenticated endpoint submits changed URLs to IndexNow' },
      { label: 'https://api.indexnow.org/indexnow', value: 'Protocol', detail: 'Participating engines share accepted submissions' },
    ],
  });
}

function ageInDays(post: Post): number {
  const basis = post.updated || post.created;
  const timestamp = new Date(basis).getTime();
  if (Number.isNaN(timestamp)) return 0;
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
}

function missingMetadata(post: Post): string[] {
  const missing: string[] = [];
  if (!post.summary) missing.push('summary');
  if (!post.image) missing.push('image');
  if (!post.caption) missing.push('caption');
  if (post.tags.length === 0) missing.push('tags');
  return missing;
}

export async function getContentHealthSnapshot(): Promise<AdminProviderSnapshot> {
  try {
    await BackendService.ensurePreprocessed();
    const posts = await BackendService.getInstance().getAllPosts();
    const tags = await BackendService.getInstance().getAllTags();
    const stalePosts = posts.filter((post) => ageInDays(post) >= 365);
    const metadataIssues = posts
      .map((post) => ({ post, missing: missingMetadata(post) }))
      .filter((entry) => entry.missing.length > 0);
    const thinPosts = posts.filter((post) => post.wordCount < 500);
    const rows: AnalyticsRow[] = [
      ...metadataIssues.slice(0, 8).map(({ post, missing }) => ({
        label: post.title,
        value: missing.length.toString(),
        detail: `Missing ${missing.join(', ')}`,
      })),
      ...stalePosts.slice(0, 5).map((post) => ({
        label: post.title,
        value: `${ageInDays(post)}d`,
        detail: 'Not updated in the last year',
      })),
      ...thinPosts.slice(0, 5).map((post) => ({
        label: post.title,
        value: formatNumber(post.wordCount),
        detail: 'Short post, review for depth',
      })),
    ];

    return configuredProvider({
      id: 'content-health',
      title: 'Content Health',
      freeTier: 'Computed locally from MDX content and generated site surfaces',
      sourceUrl: 'local:content/posts',
      cards: [
        { label: 'Posts', value: formatNumber(posts.length), description: 'Published MDX posts' },
        { label: 'Tags', value: formatNumber(tags.length), description: 'Unique content tags' },
        { label: 'Metadata Gaps', value: formatNumber(metadataIssues.length), description: 'Posts missing key metadata' },
        { label: 'Stale Posts', value: formatNumber(stalePosts.length), description: 'Not updated in 365+ days' },
      ],
      rows,
    });
  } catch (error) {
    return errorProvider({
      id: 'content-health',
      title: 'Content Health',
      freeTier: 'Computed locally from MDX content and generated site surfaces',
      sourceUrl: 'local:content/posts',
    }, error);
  }
}

export async function getAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  const [
    visitors,
    searchConsole,
    indexNow,
    performance,
    vercel,
    github,
    uptimeRobot,
    contentHealth,
  ] = await Promise.all([
    getVisitorAnalyticsSnapshot(),
    getSearchConsoleSnapshot(),
    getIndexNowSnapshot(),
    getPerformanceSnapshot(),
    getVercelSnapshot(),
    getGitHubSnapshot(),
    getUptimeRobotSnapshot(),
    getContentHealthSnapshot(),
  ]);

  return {
    generatedAt: nowIso(),
    visitors,
    growth: [searchConsole, indexNow],
    performance: [performance],
    operations: [vercel, github, uptimeRobot],
    contentHealth,
  };
}
