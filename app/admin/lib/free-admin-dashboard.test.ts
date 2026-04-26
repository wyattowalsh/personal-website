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
    missingEnv: ['POSTHOG_PERSONAL_API_KEY'],
    overview: [],
    topPages: [],
    referrers: [],
    devices: [],
    interactions: [],
    searches: [],
    outboundLinks: [],
    readingProgress: [],
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
    delete process.env.GOOGLE_CLIENT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;

    const snapshot = await getSearchConsoleSnapshot();

    expect(snapshot.status).toBe('missing_config');
    expect(snapshot.missingEnv).toEqual([
      'GOOGLE_SEARCH_CONSOLE_SITE_URL',
      'GOOGLE_CLIENT_EMAIL',
      'GOOGLE_PRIVATE_KEY',
    ]);
    expect(snapshot.setupSteps).toEqual([
      'vercel env add GOOGLE_SEARCH_CONSOLE_SITE_URL production',
      'vercel env add GOOGLE_CLIENT_EMAIL production',
      'vercel env add GOOGLE_PRIVATE_KEY production',
    ]);
    expect(snapshot.setupSteps.join('\n')).not.toContain('PRIVATE KEY');
    expect(fetch).not.toHaveBeenCalled();
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
    expect(snapshot.cards[3].value).toBe('Public');
  });

  it('builds a dashboard snapshot with content health and setup panels', async () => {
    delete process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
    delete process.env.GOOGLE_CLIENT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;
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
    expect(dashboard.operations.map((provider) => provider.id)).toEqual(['vercel', 'github', 'uptimerobot']);
    expect(dashboard.contentHealth.cards[0]).toEqual({
      label: 'Posts',
      value: '2',
      description: 'Published MDX posts',
    });
    expect(dashboard.contentHealth.rows.some((row) => row.label === 'Needs Work')).toBe(true);
  });
});
