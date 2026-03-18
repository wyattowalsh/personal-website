import { describe, it, expect } from 'vitest';
import { generatePostMetadata } from '@/lib/metadata';
import type { Post } from '@/lib/types';

function createMockPost(overrides: Partial<Post> = {}): Post {
  return {
    slug: 'test-post',
    title: 'Test Post Title',
    summary: 'A summary of the test post',
    content: 'Post body content here.',
    created: '2025-03-15',
    updated: '2025-03-16',
    tags: ['TypeScript', 'Testing'],
    image: '/test-hero.png',
    caption: 'Test caption',
    readingTime: '5 min read',
    wordCount: 1200,
    ...overrides,
  };
}

describe('generatePostMetadata', () => {
  it('returns correct title and description', () => {
    const post = createMockPost();
    const meta = generatePostMetadata({ post, slug: 'test-post' });

    expect(meta.title).toBe('Test Post Title');
    expect(meta.description).toBe('A summary of the test post');
  });

  it('sets canonical URL in alternates', () => {
    const post = createMockPost();
    const meta = generatePostMetadata({ post, slug: 'test-post' });

    expect(meta.alternates?.canonical).toContain('/blog/posts/test-post');
  });

  it('includes feed discovery links', () => {
    const post = createMockPost();
    const meta = generatePostMetadata({ post, slug: 'test-post' });

    const types = meta.alternates?.types as Record<string, string> | undefined;
    expect(types?.['application/rss+xml']).toBe('/feed.xml');
    expect(types?.['application/atom+xml']).toBe('/feed.atom');
    expect(types?.['application/feed+json']).toBe('/feed.json');
  });

  it('sets OpenGraph metadata correctly', () => {
    const post = createMockPost();
    const meta = generatePostMetadata({ post, slug: 'test-post' });
    const og = meta.openGraph;

    expect(og).toBeDefined();
    expect((og as Record<string, unknown>)?.type).toBe('article');
    expect(og?.title).toBe('Test Post Title');
    expect(og?.description).toBe('A summary of the test post');
    expect(og?.url).toContain('/blog/posts/test-post');
    expect(og?.images).toHaveLength(1);
  });

  it('uses post image for OpenGraph when available', () => {
    const post = createMockPost({ image: '/custom-image.png' });
    const meta = generatePostMetadata({ post, slug: 'test-post' });
    const og = meta.openGraph;
    const images = og?.images as Array<{ url: string }>;

    expect(images?.[0]?.url).toContain('/custom-image.png');
  });

  it('falls back to default OG image when post has no image', () => {
    const post = createMockPost({ image: undefined });
    const meta = generatePostMetadata({ post, slug: 'test-post' });
    const og = meta.openGraph;
    const images = og?.images as Array<{ url: string }>;

    expect(images?.[0]?.url).toContain('/opengraph.png');
  });

  it('uses absolute URL for external post images', () => {
    const post = createMockPost({ image: 'https://cdn.example.com/hero.jpg' });
    const meta = generatePostMetadata({ post, slug: 'test-post' });
    const og = meta.openGraph;
    const images = og?.images as Array<{ url: string }>;

    expect(images?.[0]?.url).toBe('https://cdn.example.com/hero.jpg');
  });

  it('sets OpenGraph published and modified times', () => {
    const post = createMockPost({ created: '2025-01-10', updated: '2025-02-20' });
    const meta = generatePostMetadata({ post, slug: 'test-post' });
    const og = meta.openGraph;

    // OpenGraph type narrowing: 'article' type includes publishedTime/modifiedTime
    expect(og).toMatchObject({
      publishedTime: '2025-01-10',
      modifiedTime: '2025-02-20',
    });
  });

  it('uses created date as modifiedTime when updated is absent', () => {
    const post = createMockPost({ updated: undefined });
    const meta = generatePostMetadata({ post, slug: 'test-post' });
    const og = meta.openGraph;

    expect(og).toMatchObject({
      modifiedTime: post.created,
    });
  });

  it('sets Twitter card metadata', () => {
    const post = createMockPost();
    const meta = generatePostMetadata({ post, slug: 'test-post' });
    const twitter = meta.twitter;

    expect(twitter).toBeDefined();
    expect((twitter as Record<string, unknown>)?.card).toBe('summary_large_image');
    expect(twitter?.title).toBe('Test Post Title');
    expect(twitter?.description).toBe('A summary of the test post');
    expect(twitter?.images).toHaveLength(1);
    expect(twitter?.creator).toMatch(/^@/);
  });

  it('includes tags as keywords', () => {
    const post = createMockPost({ tags: ['Python', 'ML', 'Data Science'] });
    const meta = generatePostMetadata({ post, slug: 'test-post' });

    expect(meta.keywords).toEqual(['Python', 'ML', 'Data Science']);
  });

  it('sets first tag as OpenGraph section', () => {
    const post = createMockPost({ tags: ['Python', 'ML'] });
    const meta = generatePostMetadata({ post, slug: 'test-post' });
    const og = meta.openGraph;

    expect(og).toMatchObject({ section: 'Python' });
  });

  it('handles missing summary by falling back to site description', () => {
    const post = createMockPost({ summary: undefined });
    const meta = generatePostMetadata({ post, slug: 'test-post' });

    // Should fall back to config.site.description, not be undefined
    expect(meta.description).toBeTruthy();
    expect(meta.description).not.toBe('');
  });

  it('sets robots directives for indexing', () => {
    const post = createMockPost();
    const meta = generatePostMetadata({ post, slug: 'test-post' });

    expect(meta.robots).toMatchObject({
      index: true,
      follow: true,
    });
  });

  it('sets author information', () => {
    const post = createMockPost();
    const meta = generatePostMetadata({ post, slug: 'test-post' });

    expect(meta.authors).toHaveLength(1);
    expect((meta.authors as Array<{ name: string }>)?.[0]?.name).toBeTruthy();
    expect(meta.creator).toBeTruthy();
    expect(meta.publisher).toBeTruthy();
  });

  it('handles empty tags array', () => {
    const post = createMockPost({ tags: [] });
    const meta = generatePostMetadata({ post, slug: 'test-post' });

    expect(meta.keywords).toEqual([]);
    const og = meta.openGraph as Record<string, unknown> | undefined;
    expect(og?.tags).toEqual([]);
  });

  it('handles missing image', () => {
    const post = createMockPost({ image: undefined });
    const meta = generatePostMetadata({ post, slug: 'test-post' });

    expect(meta.openGraph).toBeDefined();
  });

  it('handles missing summary with fallback description', () => {
    const post = createMockPost({ summary: undefined });
    const meta = generatePostMetadata({ post, slug: 'test-post' });

    // Falls back to site description when post summary is missing
    expect(meta.description).toBeTruthy();
  });
});
