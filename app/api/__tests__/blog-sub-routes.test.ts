import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Post } from '@/lib/types';

const mockPosts: Post[] = [
  {
    slug: 'test-post-1',
    title: 'Test Post 1',
    created: '2025-01-15',
    updated: '2025-01-15',
    tags: ['typescript', 'testing'],
    content: 'Test content one',
    wordCount: 3,
    readingTime: '1 min read',
  },
  {
    slug: 'test-post-2',
    title: 'Test Post 2',
    created: '2025-01-10',
    updated: '2025-01-10',
    tags: ['python'],
    content: 'Test content two',
    wordCount: 3,
    readingTime: '1 min read',
  },
];

const mockGetAdjacentPosts = vi.fn((slug: string) => {
  const idx = mockPosts.findIndex((p) => p.slug === slug);
  return Promise.resolve({
    previous: idx > 0 ? mockPosts[idx - 1] : null,
    next: idx < mockPosts.length - 1 ? mockPosts[idx + 1] : null,
  });
});

const mockGetRelatedPosts = vi.fn((_slug: string) =>
  Promise.resolve([mockPosts[1]])
);

const mockGetPost = vi.fn((slug: string) => {
  const post = mockPosts.find((p) => p.slug === slug) ?? null;
  return Promise.resolve(post);
});

const mockEnsurePreprocessed = vi.fn(() => Promise.resolve());

vi.mock('@/lib/server', () => ({
  BackendService: {
    ensurePreprocessed: () => mockEnsurePreprocessed(),
    getInstance: () => ({
      getAdjacentPosts: mockGetAdjacentPosts,
      getRelatedPosts: mockGetRelatedPosts,
      getPost: mockGetPost,
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

import { GET as getAdjacent } from '../blog/posts/[slug]/adjacent/route';
import { GET as getRelated } from '../blog/posts/[slug]/related/route';
import { GET as getMetadata } from '../blog/posts/[slug]/metadata/route';

// Helper to create props with slug
function makeProps(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

describe('GET /api/blog/posts/[slug]/adjacent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns adjacent posts for a valid slug', async () => {
    const request = new Request('http://localhost/api/blog/posts/test-post-1/adjacent');
    const response = await getAdjacent(request, makeProps('test-post-1'));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.previous).toBeNull();
    expect(body.data.next).toBeDefined();
    expect(body.data.next.slug).toBe('test-post-2');
  });

  it('returns 400 for an invalid slug', async () => {
    const request = new Request('http://localhost/api/blog/posts/bad slug!/adjacent');
    const response = await getAdjacent(request, makeProps('bad slug!'));
    expect(response.status).toBe(400);
  });

  it('calls ensurePreprocessed', async () => {
    const request = new Request('http://localhost/api/blog/posts/test-post-1/adjacent');
    await getAdjacent(request, makeProps('test-post-1'));
    expect(mockEnsurePreprocessed).toHaveBeenCalledOnce();
  });
});

describe('GET /api/blog/posts/[slug]/related', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns related posts for a valid slug', async () => {
    const request = new Request('http://localhost/api/blog/posts/test-post-1/related');
    const response = await getRelated(request, makeProps('test-post-1'));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].slug).toBe('test-post-2');
  });

  it('returns 400 for an invalid slug', async () => {
    const request = new Request('http://localhost/api/blog/posts/bad slug!/related');
    const response = await getRelated(request, makeProps('bad slug!'));
    expect(response.status).toBe(400);
  });

  it('calls ensurePreprocessed', async () => {
    const request = new Request('http://localhost/api/blog/posts/test-post-1/related');
    await getRelated(request, makeProps('test-post-1'));
    expect(mockEnsurePreprocessed).toHaveBeenCalledOnce();
  });
});

describe('GET /api/blog/posts/[slug]/metadata', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns post metadata for a valid slug', async () => {
    const request = new Request('http://localhost/api/blog/posts/test-post-1/metadata');
    const response = await getMetadata(request, makeProps('test-post-1'));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.slug).toBe('test-post-1');
  });

  it('returns 404 for a missing slug', async () => {
    const request = new Request('http://localhost/api/blog/posts/nonexistent/metadata');
    const response = await getMetadata(request, makeProps('nonexistent'));
    expect(response.status).toBe(404);
  });

  it('returns 400 for an invalid slug format', async () => {
    const request = new Request('http://localhost/api/blog/posts/bad slug!/metadata');
    const response = await getMetadata(request, makeProps('bad slug!'));
    expect(response.status).toBe(400);
  });

  it('calls ensurePreprocessed', async () => {
    const request = new Request('http://localhost/api/blog/posts/test-post-1/metadata');
    await getMetadata(request, makeProps('test-post-1'));
    expect(mockEnsurePreprocessed).toHaveBeenCalledOnce();
  });
});
