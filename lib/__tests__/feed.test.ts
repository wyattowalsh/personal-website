import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Post } from '@/lib/types';

// Mock BackendService
vi.mock('@/lib/server', () => ({
  BackendService: {
    ensurePreprocessed: vi.fn().mockResolvedValue(undefined),
    getInstance: vi.fn(),
  },
}));

import { BackendService } from '@/lib/server';
import { buildFeed } from '@/lib/feed';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    slug: 'test-post',
    title: 'Test Post',
    summary: 'A test summary',
    content: 'Hello world content',
    created: '2026-01-15',
    updated: '2026-01-20',
    tags: ['Testing', 'TypeScript'],
    image: '/test-hero.svg',
    caption: 'Test caption',
    readingTime: '3 min read',
    wordCount: 100,
    ...overrides,
  };
}

function makePosts(count: number): Post[] {
  return Array.from({ length: count }, (_, i) =>
    makePost({
      slug: `post-${i + 1}`,
      title: `Post ${i + 1}`,
      created: `2026-01-${String(i + 1).padStart(2, '0')}`,
      updated: `2026-02-${String(i + 1).padStart(2, '0')}`,
    }),
  );
}

describe('buildFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a Feed object with correct metadata', async () => {
    const posts = [makePost()];
    vi.mocked(BackendService.getInstance).mockReturnValue({
      getAllPosts: vi.fn().mockResolvedValue(posts),
    } as never);

    const feed = await buildFeed();
    const rss = feed.rss2();

    expect(rss).toContain('<title>Wyatt Walsh</title>');
    expect(rss).toContain('Articles about software engineering');
    expect(rss).toContain('w4w.dev');
  });

  it('populates feed items from posts array', async () => {
    const posts = [
      makePost({ slug: 'alpha', title: 'Alpha Post', tags: ['JS'] }),
      makePost({ slug: 'beta', title: 'Beta Post', tags: ['TS'] }),
    ];
    vi.mocked(BackendService.getInstance).mockReturnValue({
      getAllPosts: vi.fn().mockResolvedValue(posts),
    } as never);

    const feed = await buildFeed();
    const rss = feed.rss2();

    expect(rss).toContain('Alpha Post');
    expect(rss).toContain('Beta Post');
    expect(rss).toContain('/blog/posts/alpha');
    expect(rss).toContain('/blog/posts/beta');
  });

  it('limits to 20 most recent posts', async () => {
    const posts = makePosts(25);
    vi.mocked(BackendService.getInstance).mockReturnValue({
      getAllPosts: vi.fn().mockResolvedValue(posts),
    } as never);

    const feed = await buildFeed();
    const rss = feed.rss2();

    // Posts 1-20 should be present
    expect(rss).toContain('Post 1');
    expect(rss).toContain('Post 20');
    // Posts 21-25 should NOT be present
    expect(rss).not.toContain('Post 21');
    expect(rss).not.toContain('Post 25');
  });

  it('throws when no posts are found', async () => {
    vi.mocked(BackendService.getInstance).mockReturnValue({
      getAllPosts: vi.fn().mockResolvedValue([]),
    } as never);

    await expect(buildFeed()).rejects.toThrow('No posts found for feed');
  });

  it('throws when getAllPosts returns null', async () => {
    vi.mocked(BackendService.getInstance).mockReturnValue({
      getAllPosts: vi.fn().mockResolvedValue(null),
    } as never);

    await expect(buildFeed()).rejects.toThrow('No posts found for feed');
  });

  it('handles posts without updated date', async () => {
    const posts = [makePost({ updated: undefined, created: '2026-03-01' })];
    vi.mocked(BackendService.getInstance).mockReturnValue({
      getAllPosts: vi.fn().mockResolvedValue(posts),
    } as never);

    const feed = await buildFeed();
    const rss = feed.rss2();
    expect(rss).toContain('Test Post');
  });

  it('handles posts without image', async () => {
    const posts = [makePost({ image: undefined })];
    vi.mocked(BackendService.getInstance).mockReturnValue({
      getAllPosts: vi.fn().mockResolvedValue(posts),
    } as never);

    const feed = await buildFeed();
    // Should not throw
    const rss = feed.rss2();
    expect(rss).toContain('Test Post');
  });

  it('produces valid rss2 output with channel metadata', async () => {
    const posts = [makePost()];
    vi.mocked(BackendService.getInstance).mockReturnValue({
      getAllPosts: vi.fn().mockResolvedValue(posts),
    } as never);

    const feed = await buildFeed();
    const rss = feed.rss2();

    expect(rss).toContain('<rss version="2.0"');
    expect(rss).toContain('<channel>');
    expect(rss).toContain('<title>Wyatt Walsh</title>');
  });

  it('produces valid atom output with self link', async () => {
    const posts = [makePost()];
    vi.mocked(BackendService.getInstance).mockReturnValue({
      getAllPosts: vi.fn().mockResolvedValue(posts),
    } as never);

    const feed = await buildFeed();
    const atom = feed.atom1();

    expect(atom).toContain('feed.atom');
    expect(atom).toContain('xmlns="http://www.w3.org/2005/Atom"');
  });

  it('produces valid json1 output', async () => {
    const posts = [makePost()];
    vi.mocked(BackendService.getInstance).mockReturnValue({
      getAllPosts: vi.fn().mockResolvedValue(posts),
    } as never);

    const feed = await buildFeed();
    const json = JSON.parse(feed.json1());

    expect(json.title).toBe('Wyatt Walsh');
    expect(json.feed_url).toContain('feed.json');
    expect(json.items).toHaveLength(1);
    expect(json.items[0].title).toBe('Test Post');
  });

  it('maps post tags to feed categories', async () => {
    const posts = [makePost({ tags: ['JavaScript', 'React'] })];
    vi.mocked(BackendService.getInstance).mockReturnValue({
      getAllPosts: vi.fn().mockResolvedValue(posts),
    } as never);

    const feed = await buildFeed();
    const rss = feed.rss2();

    expect(rss).toContain('JavaScript');
    expect(rss).toContain('React');
  });
});
