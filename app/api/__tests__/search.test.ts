import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSearchResults = [
  {
    post: {
      slug: 'test-post-1',
      title: 'Test Post 1',
      created: '2025-01-15',
      updated: '2025-01-15',
      tags: ['typescript'],
    },
    score: 0.1,
    matches: [{ key: 'title', indices: [[0, 3] as [number, number]] }],
  },
];

const mockSearchPublic = vi.fn((query: string) => {
  if (query === 'test') return Promise.resolve(mockSearchResults);
  return Promise.resolve([]);
});
const mockEnsurePreprocessed = vi.fn(() => Promise.resolve());

vi.mock('@/lib/server', () => ({
  BackendService: {
    ensurePreprocessed: () => mockEnsurePreprocessed(),
    getInstance: () => ({
      searchPublic: mockSearchPublic,
    }),
  },
  jsonResponse: (data: unknown, _options?: unknown) =>
    Response.json({
      data,
      meta: { timestamp: new Date().toISOString() },
    }),
}));

vi.mock('@sentry/nextjs', () => ({
  withScope: vi.fn(),
  captureException: vi.fn(),
}));

import { GET } from '../blog/search/route';

describe('GET /api/blog/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns search results for a valid query', async () => {
    const request = new Request('http://localhost/api/blog/search?query=test');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].post.slug).toBe('test-post-1');
    expect(body.data[0].post).not.toHaveProperty('content');
  });

  it('calls searchPublic with the provided query', async () => {
    const request = new Request('http://localhost/api/blog/search?query=test');
    await GET(request);

    expect(mockSearchPublic).toHaveBeenCalledWith('test');
  });

  it('calls ensurePreprocessed before searching', async () => {
    const request = new Request('http://localhost/api/blog/search?query=test');
    await GET(request);

    expect(mockEnsurePreprocessed).toHaveBeenCalledOnce();
  });

  it('returns 400 when query parameter is missing', async () => {
    const request = new Request('http://localhost/api/blog/search');
    const response = await GET(request);

    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error.message).toBe('Invalid request data');
  });

  it('returns 400 when query is empty string', async () => {
    const request = new Request('http://localhost/api/blog/search?query=');
    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('returns empty results for a query with no matches', async () => {
    const request = new Request(
      'http://localhost/api/blog/search?query=zzzznotfound'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toHaveLength(0);
  });

  it('returns 500 when search throws unexpectedly', async () => {
    mockSearchPublic.mockRejectedValueOnce(new Error('Search engine down'));
    const request = new Request('http://localhost/api/blog/search?query=test');
    const response = await GET(request);
    expect(response.status).toBe(500);
  });
});
