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

const mockGetAllPosts = vi.fn(() => Promise.resolve(mockPosts));
const mockGetPost = vi.fn((slug: string) => {
  const post = mockPosts.find((p) => p.slug === slug) ?? null;
  return Promise.resolve(post);
});
const mockEnsurePreprocessed = vi.fn(() => Promise.resolve());

vi.mock('@/lib/server', () => ({
  BackendService: {
    ensurePreprocessed: () => mockEnsurePreprocessed(),
    getInstance: () => ({
      getAllPosts: mockGetAllPosts,
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

import { GET as getAll } from '../blog/posts/route';
import { GET as getBySlug } from '../blog/posts/[slug]/route';

describe('GET /api/blog/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an array of posts', async () => {
    const request = new Request('http://localhost/api/blog/posts');
    const response = await getAll(request);

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].slug).toBe('test-post-1');
    expect(body.data[1].slug).toBe('test-post-2');
  });

  it('calls ensurePreprocessed before fetching', async () => {
    const request = new Request('http://localhost/api/blog/posts');
    await getAll(request);

    expect(mockEnsurePreprocessed).toHaveBeenCalledOnce();
  });

  it('includes meta timestamp in response', async () => {
    const request = new Request('http://localhost/api/blog/posts');
    const response = await getAll(request);
    const body = await response.json();

    expect(body.meta).toBeDefined();
    expect(body.meta.timestamp).toBeDefined();
  });

  it('returns 500 when BackendService throws unexpectedly', async () => {
    mockGetAllPosts.mockRejectedValueOnce(new Error('DB down'));
    const request = new Request('http://localhost/api/blog/posts');
    const response = await getAll(request);
    expect(response.status).toBe(500);
  });
});

describe('GET /api/blog/posts/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a single post by slug', async () => {
    const request = new Request('http://localhost/api/blog/posts/test-post-1');
    const response = await getBySlug(request, {
      params: Promise.resolve({ slug: 'test-post-1' }),
    });

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data.slug).toBe('test-post-1');
    expect(body.data.title).toBe('Test Post 1');
  });

  it('returns 404 for a missing slug', async () => {
    const request = new Request('http://localhost/api/blog/posts/nonexistent');
    const response = await getBySlug(request, {
      params: Promise.resolve({ slug: 'nonexistent' }),
    });

    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body.error.message).toBe('Post not found');
  });

  it('returns 400 for an invalid slug format', async () => {
    const request = new Request('http://localhost/api/blog/posts/bad slug!');
    const response = await getBySlug(request, {
      params: Promise.resolve({ slug: 'bad slug!' }),
    });

    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error.message).toBe('Invalid slug format');
  });

  it('calls ensurePreprocessed before fetching', async () => {
    const request = new Request('http://localhost/api/blog/posts/test-post-1');
    await getBySlug(request, {
      params: Promise.resolve({ slug: 'test-post-1' }),
    });

    expect(mockEnsurePreprocessed).toHaveBeenCalledOnce();
  });

  it('returns 500 when BackendService throws unexpectedly', async () => {
    mockGetPost.mockRejectedValueOnce(new Error('DB down'));
    const request = new Request('http://localhost/api/blog/posts/test-post-1');
    const response = await getBySlug(request, {
      params: Promise.resolve({ slug: 'test-post-1' }),
    });
    expect(response.status).toBe(500);
  });
});
