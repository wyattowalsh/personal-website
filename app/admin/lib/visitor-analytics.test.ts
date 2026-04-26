import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getVisitorAnalyticsSnapshot } from './visitor-analytics';

const ORIGINAL_ENV = process.env;

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

describe('getVisitorAnalyticsSnapshot()', () => {
  it('returns setup state when PostHog env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
    delete process.env.POSTHOG_PERSONAL_API_KEY;
    delete process.env.POSTHOG_PROJECT_ID;

    const snapshot = await getVisitorAnalyticsSnapshot();

    expect(snapshot.status).toBe('missing_config');
    expect(snapshot.missingEnv).toEqual([
      'NEXT_PUBLIC_POSTHOG_TOKEN',
      'POSTHOG_PERSONAL_API_KEY',
      'POSTHOG_PROJECT_ID',
    ]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('queries PostHog and maps aggregate analytics rows', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_TOKEN = 'phc_public';
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://eu.i.posthog.com';
    process.env.POSTHOG_PERSONAL_API_KEY = 'phx_secret';
    process.env.POSTHOG_PROJECT_ID = '12345';

    const payloads = [
      { results: [[42, 12, 9]] },
      { results: [['search_query', 8], ['reading_progress', 6]] },
      { results: [['/blog', 24, 10]] },
      { results: [['https://example.com', 5]] },
      { results: [['desktop', 30], ['mobile', 12]] },
      { results: [['nextjs', 4, 'search_query']] },
      { results: [['https://github.com/wyattowalsh', 3]] },
      { results: [['post-slug', 100, 5]] },
    ];

    vi.mocked(fetch).mockImplementation(() => Promise.resolve(mockJsonResponse(payloads.shift())));

    const snapshot = await getVisitorAnalyticsSnapshot();

    expect(snapshot.status).toBe('configured');
    expect(snapshot.overview).toEqual([
      { label: 'Visitors', value: '12', description: 'Unique anonymous browsers' },
      { label: 'Sessions', value: '9', description: 'Per-tab visit sessions' },
      { label: 'Pageviews', value: '42', description: 'Tracked PostHog page views' },
      { label: 'Interactions', value: '14', description: 'Custom site events' },
    ]);
    expect(snapshot.topPages).toEqual([{ label: '/blog', value: '24', detail: '10 visitors' }]);
    expect(snapshot.searches).toEqual([{ label: 'nextjs', value: '4', detail: 'search_query' }]);
    expect(snapshot.readingProgress).toEqual([{ label: 'post-slug', value: '100%', detail: '5 events' }]);

    expect(fetch).toHaveBeenCalledTimes(8);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('https://eu.posthog.com/api/projects/12345/query/');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer phx_secret',
    });
  });

  it('normalizes escaped newlines from env values before querying PostHog', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_TOKEN = 'phc_public\\n';
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://eu.i.posthog.com\\n';
    process.env.POSTHOG_PERSONAL_API_KEY = 'phx_secret\\n';
    process.env.POSTHOG_PROJECT_ID = '12345\\n';

    vi.mocked(fetch).mockResolvedValue(mockJsonResponse({ results: [] }));

    await getVisitorAnalyticsSnapshot();

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('https://eu.posthog.com/api/projects/12345/query/');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer phx_secret',
    });
  });

  it('returns error state when PostHog returns a non-query response', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_TOKEN = 'phc_public';
    process.env.POSTHOG_PERSONAL_API_KEY = 'phx_secret';
    process.env.POSTHOG_PROJECT_ID = '12345';

    vi.mocked(fetch).mockResolvedValue(mockJsonResponse({ html: '<!doctype html>' }));

    const snapshot = await getVisitorAnalyticsSnapshot();

    expect(snapshot.status).toBe('error');
    expect(snapshot.error).toBe('PostHog query response did not include results');
  });

  it('returns error state when the PostHog query API fails', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_TOKEN = 'phc_public';
    process.env.POSTHOG_PERSONAL_API_KEY = 'phx_secret';
    process.env.POSTHOG_PROJECT_ID = '12345';

    vi.mocked(fetch).mockResolvedValue(mockJsonResponse({ detail: 'invalid key' }, false, 401));

    const snapshot = await getVisitorAnalyticsSnapshot();

    expect(snapshot.status).toBe('error');
    expect(snapshot.error).toBe('invalid key');
  });
});
