import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAdminDashboardSnapshot,
  getGitHubSnapshot,
  getPerformanceSnapshot,
  getSearchConsoleSnapshot,
} from './free-admin-dashboard';

const ORIGINAL_ENV = process.env;

vi.mock('@/lib/server', () => ({
  BackendService: {
    ensurePreprocessed: vi.fn(() => Promise.resolve()),
    getInstance: vi.fn(() => ({
      getAllPosts: vi.fn(() => Promise.resolve([
        {
          slug: 'complete-post',
          title: 'Complete Post',
          summary: 'Summary',
          content: 'Body',
          created: '2026-01-01',
          updated: '2026-01-02',
          tags: ['Admin'],
          image: '/image.png',
          caption: 'Caption',
          wordCount: 900,
        },
        {
          slug: 'needs-work',
          title: 'Needs Work',
          content: 'Body',
          created: '2024-01-01',
          tags: [],
          wordCount: 300,
        },
      ])),
      getAllTags: vi.fn(() => Promise.resolve(['Admin'])),
    })),
  },
}));

vi.mock('./visitor-analytics', () => ({
  getVisitorAnalyticsSnapshot: vi.fn(() => Promise.resolve({
    status: 'missing_config',
    generatedAt: '2026-04-25T12:00:00.000Z',
    windowDays: 30,
    source: 'posthog_live',
    missingEnv: ['POSTHOG_PERSONAL_API_KEY'],
    overview: [],
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
  })),
}));

vi.mock('./analytics-rollups', () => ({
  getAnalyticsRollupHealth: vi.fn(() => Promise.resolve({
    status: 'missing_config',
    coveredDays: 0,
    missingEnv: ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'CRON_SECRET'],
  })),
}));

function mockJsonResponse(payload: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(payload),
  } as Response;
}

beforeEach(() => {
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
  vi.unstubAllGlobals();
});

describe('free admin dashboard providers', () => {
  it('returns Search Console setup state without rendering secret values', async () => {
    delete process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
    delete process.env.GOOGLE_OAUTH_CLIENT_ID;
    delete process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    delete process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

    const snapshot = await getSearchConsoleSnapshot();

    expect(snapshot.status).toBe('missing_config');
    expect(snapshot.missingEnv).toEqual([
      'GOOGLE_SEARCH_CONSOLE_SITE_URL',
      'GOOGLE_OAUTH_CLIENT_ID',
      'GOOGLE_OAUTH_CLIENT_SECRET',
      'GOOGLE_OAUTH_REFRESH_TOKEN',
    ]);
    expect(snapshot.setupSteps).toEqual([
      'vercel env add GOOGLE_SEARCH_CONSOLE_SITE_URL production',
      'vercel env add GOOGLE_OAUTH_CLIENT_ID production',
      'vercel env add GOOGLE_OAUTH_CLIENT_SECRET production',
      'vercel env add GOOGLE_OAUTH_REFRESH_TOKEN production',
    ]);
    expect(snapshot.setupSteps.join('\n')).not.toContain('client_secret');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('queries Search Console using OAuth refresh-token credentials', async () => {
    process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL = 'sc-domain:w4w.dev';
    process.env.GOOGLE_OAUTH_CLIENT_ID = 'client-id';
    process.env.GOOGLE_OAUTH_CLIENT_SECRET = 'client-secret';
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN = 'refresh-token';
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockJsonResponse({ access_token: 'access-token' }))
      .mockResolvedValueOnce(mockJsonResponse({
        rows: [{
          keys: ['admin dashboard'],
          clicks: 12,
          impressions: 100,
          ctr: 0.12,
          position: 4.2,
        }],
      }))
      .mockResolvedValueOnce(mockJsonResponse({
        rows: [{
          keys: ['https://www.w4w.dev/admin'],
          clicks: 3,
          impressions: 40,
          ctr: 0.075,
          position: 8.1,
        }],
      }));

    const snapshot = await getSearchConsoleSnapshot();

    expect(snapshot.status).toBe('configured');
    expect(snapshot.cards[0]).toEqual({
      label: 'Clicks',
      value: '12',
      description: 'Top query clicks, 28 days',
    });
    const [tokenUrl, tokenInit] = vi.mocked(fetch).mock.calls[0];
    expect(tokenUrl).toBe('https://oauth2.googleapis.com/token');
    expect(String((tokenInit as RequestInit).body)).toContain('grant_type=refresh_token');
    const [queryUrl] = vi.mocked(fetch).mock.calls[1];
    expect(String(queryUrl)).toContain(encodeURIComponent('sc-domain:w4w.dev'));
  });

  it('maps PageSpeed results and treats missing CrUX as partial setup', async () => {
    delete process.env.CRUX_API_KEY;
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse({
      lighthouseResult: {
        categories: {
          performance: { score: 0.91 },
          accessibility: { score: 0.98 },
          'best-practices': { score: 0.95 },
          seo: { score: 1 },
        },
        audits: {
          'unused-javascript': {
            id: 'unused-javascript',
            title: 'Reduce unused JavaScript',
            score: 0.72,
            displayValue: '25 KiB',
          },
        },
      },
    }));

    const snapshot = await getPerformanceSnapshot();

    expect(snapshot.status).toBe('partial');
    expect(snapshot.missingEnv).toEqual(['CRUX_API_KEY']);
    expect(snapshot.cards).toEqual([
      { label: 'Mobile Perf', value: '91', description: 'Lighthouse mobile performance' },
      { label: 'Desktop Perf', value: '91', description: 'Lighthouse desktop performance' },
      { label: 'Accessibility', value: '98', description: 'Mobile accessibility score' },
      { label: 'SEO', value: '100', description: 'Mobile SEO score' },
    ]);
    expect(snapshot.rows[0]).toEqual({
      label: 'Reduce unused JavaScript',
      value: '72',
      detail: '25 KiB',
    });
  });

  it('treats absent CrUX field data as configured when the API key exists', async () => {
    process.env.CRUX_API_KEY = 'test-crux-key';
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockJsonResponse({
        lighthouseResult: {
          categories: {
            performance: { score: 0.88 },
            accessibility: { score: 0.99 },
            seo: { score: 1 },
          },
          audits: {},
        },
      }))
      .mockResolvedValueOnce(mockJsonResponse({
        lighthouseResult: {
          categories: {
            performance: { score: 0.94 },
          },
          audits: {},
        },
      }))
      .mockResolvedValueOnce(mockJsonResponse({
        error: { code: 404, status: 'NOT_FOUND', message: 'chrome ux report data not found' },
      }, false, 404));

    const snapshot = await getPerformanceSnapshot();

    expect(snapshot.status).toBe('configured');
    expect(snapshot.missingEnv).toEqual([]);
    expect(snapshot.rows[0]).toEqual({
      label: 'CrUX field data',
      value: 'No data',
      detail: 'Google has no public 28-day field dataset for this origin yet',
    });
  });

  it('uses public GitHub workflow data without requiring a token', async () => {
    delete process.env.GITHUB_TOKEN;
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse({
      workflow_runs: [
        {
          name: 'Deploy',
          status: 'completed',
          conclusion: 'success',
          head_branch: 'master',
          head_sha: '1234567890abcdef',
          run_started_at: '2026-04-25T12:00:00Z',
        },
      ],
    }));

    const snapshot = await getGitHubSnapshot();

    expect(snapshot.status).toBe('partial');
    expect(snapshot.missingEnv).toEqual(['GITHUB_TOKEN']);
    expect(snapshot.cards[0]).toEqual({
      label: 'Workflow Runs',
      value: '1',
      description: 'Recent GitHub Actions runs',
    });
    expect(snapshot.cards[2]).toEqual({
      label: 'Repo Views',
      value: 'n/a',
      description: 'GitHub traffic views, token required',
    });
  });

  it('adds free GitHub traffic rows when a token is present', async () => {
    process.env.GITHUB_TOKEN = 'github-token';
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockJsonResponse({
        workflow_runs: [{
          name: 'Deploy',
          status: 'completed',
          conclusion: 'success',
          head_branch: 'master',
          head_sha: 'abcdef1234567890',
          run_started_at: '2026-04-25T12:00:00Z',
        }],
      }))
      .mockResolvedValueOnce(mockJsonResponse([]))
      .mockResolvedValueOnce(mockJsonResponse({ count: 42, uniques: 20 }))
      .mockResolvedValueOnce(mockJsonResponse({ count: 7, uniques: 4 }))
      .mockResolvedValueOnce(mockJsonResponse([{ path: '/wyattowalsh/personal-website', count: 12, uniques: 8 }]))
      .mockResolvedValueOnce(mockJsonResponse([{ referrer: 'github.com', count: 5, uniques: 3 }]));

    const snapshot = await getGitHubSnapshot();

    expect(snapshot.status).toBe('configured');
    expect(snapshot.cards[2]).toEqual({
      label: 'Repo Views',
      value: '42',
      description: 'GitHub traffic views, token required',
    });
    expect(snapshot.cards[3]).toEqual({
      label: 'Repo Clones',
      value: '7',
      description: 'GitHub traffic clones, token required',
    });
    expect(snapshot.rows[0]).toEqual({
      label: '/wyattowalsh/personal-website',
      value: '12',
      detail: '8 unique GitHub visitors',
    });
    expect(snapshot.rows[1]).toEqual({
      label: 'github.com',
      value: '5',
      detail: '3 unique GitHub visitors',
    });
  });

  it('keeps GitHub workflows when a traffic endpoint fails', async () => {
    process.env.GITHUB_TOKEN = 'github-token';
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockJsonResponse({
        workflow_runs: [{
          name: 'Deploy',
          status: 'completed',
          conclusion: 'success',
          head_branch: 'master',
          head_sha: 'abcdef1234567890',
          run_started_at: '2026-04-25T12:00:00Z',
        }],
      }))
      .mockResolvedValueOnce(mockJsonResponse([]))
      .mockRejectedValueOnce(new Error('GitHub traffic timeout'))
      .mockResolvedValueOnce(mockJsonResponse({ count: 7, uniques: 4 }))
      .mockResolvedValueOnce(mockJsonResponse([{ path: '/wyattowalsh/personal-website', count: 12, uniques: 8 }]))
      .mockResolvedValueOnce(mockJsonResponse([{ referrer: 'github.com', count: 5, uniques: 3 }]));

    const snapshot = await getGitHubSnapshot();

    expect(snapshot.status).toBe('partial');
    expect(snapshot.error).toContain('GitHub traffic timeout');
    expect(snapshot.cards[0]).toEqual({
      label: 'Workflow Runs',
      value: '1',
      description: 'Recent GitHub Actions runs',
    });
    expect(snapshot.rows.some((row) => row.label === 'Deploy')).toBe(true);
    expect(snapshot.rows.some((row) => row.label === '/wyattowalsh/personal-website')).toBe(true);
  });

  it('keeps successful GitHub traffic when Dependabot is unavailable', async () => {
    process.env.GITHUB_TOKEN = 'github-token';
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockJsonResponse({
        workflow_runs: [{
          name: 'Deploy',
          status: 'completed',
          conclusion: 'success',
          head_branch: 'master',
          head_sha: 'abcdef1234567890',
          run_started_at: '2026-04-25T12:00:00Z',
        }],
      }))
      .mockResolvedValueOnce(mockJsonResponse({ message: 'Resource not accessible by integration' }, false, 403))
      .mockResolvedValueOnce(mockJsonResponse({ count: 42, uniques: 20 }))
      .mockResolvedValueOnce(mockJsonResponse({ count: 7, uniques: 4 }))
      .mockResolvedValueOnce(mockJsonResponse([{ path: '/wyattowalsh/personal-website', count: 12, uniques: 8 }]))
      .mockResolvedValueOnce(mockJsonResponse([{ referrer: 'github.com', count: 5, uniques: 3 }]));

    const snapshot = await getGitHubSnapshot();

    expect(snapshot.status).toBe('configured');
    expect(snapshot.error).toBe('Resource not accessible by integration');
    expect(snapshot.cards[2]).toEqual({
      label: 'Repo Views',
      value: '42',
      description: 'GitHub traffic views, token required',
    });
    expect(snapshot.rows[0]).toEqual({
      label: '/wyattowalsh/personal-website',
      value: '12',
      detail: '8 unique GitHub visitors',
    });
  });

  it('builds a dashboard snapshot with content health and setup panels', async () => {
    delete process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
    delete process.env.GOOGLE_OAUTH_CLIENT_ID;
    delete process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    delete process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
    delete process.env.VERCEL_TOKEN;
    delete process.env.VERCEL_PROJECT_ID;
    delete process.env.UPTIMEROBOT_API_KEY;
    delete process.env.INDEXNOW_KEY;
    delete process.env.GITHUB_TOKEN;
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse({
      lighthouseResult: {
        categories: {
          performance: { score: 0.8 },
          accessibility: { score: 1 },
          seo: { score: 1 },
        },
        audits: {},
      },
    }));

    const dashboard = await getAdminDashboardSnapshot();

    expect(dashboard.growth.map((provider) => provider.id)).toEqual(['search-console', 'indexnow']);
    expect(dashboard.operations.map((provider) => provider.id)).toEqual(['analytics-rollups', 'vercel', 'github', 'uptimerobot']);
    expect(dashboard.rollupStorage.missingEnv).toEqual(['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'CRON_SECRET']);
    expect(dashboard.costLedger.map((item) => item.id)).toContain('cloudflare-analytics');
    expect(dashboard.costLedger.find((item) => item.id === 'cloudflare-analytics')).toMatchObject({
      status: 'disabled_paid_risk',
      usage: '0 calls',
    });
    expect(dashboard.signals.some((signal) => signal.id === 'paid-risk-disabled')).toBe(true);
    expect(dashboard.signals.some((signal) => signal.id === 'provider-setup-search-console')).toBe(true);
    expect(dashboard.contentHealth.cards[0]).toEqual({
      label: 'Posts',
      value: '2',
      description: 'Published MDX posts',
    });
    expect(dashboard.contentHealth.rows.some((row) => row.label === 'Needs Work')).toBe(true);
  });
});
