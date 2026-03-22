import { describe, it, expect } from 'vitest';
import { BackendService } from '@/lib/server';
import { buildFeed } from '@/lib/feed';

describe('Feed generation (integration)', () => {
  it('builds feed from real content/posts without errors', async () => {
    await BackendService.ensurePreprocessed();
    const posts = await BackendService.getInstance().getAllPosts();
    expect(posts.length).toBeGreaterThan(0);

    const feed = await buildFeed();

    // Verify all three output formats produce valid, non-empty output
    const rss = feed.rss2();
    expect(rss).toContain('<rss version="2.0"');
    expect(rss).toContain('<item>');

    const atom = feed.atom1();
    expect(atom).toContain('xmlns="http://www.w3.org/2005/Atom"');
    expect(atom).toContain('<entry>');

    const json = JSON.parse(feed.json1());
    expect(json.items.length).toBeGreaterThan(0);
    expect(json.items[0].title).toBeTruthy();
    expect(json.items[0].url).toContain('/blog/posts/');
  });

  it('feed items match real post slugs', async () => {
    await BackendService.ensurePreprocessed();
    const posts = await BackendService.getInstance().getAllPosts();
    const feed = await buildFeed();
    const json = JSON.parse(feed.json1());

    // Every feed item URL should correspond to a real post slug
    for (const item of json.items) {
      const slug = item.url.split('/blog/posts/')[1];
      const matchingPost = posts.find((p) => p.slug === slug);
      expect(matchingPost).toBeDefined();
    }
  });

  it('limits feed to at most 20 items', async () => {
    const feed = await buildFeed();
    const json = JSON.parse(feed.json1());
    expect(json.items.length).toBeLessThanOrEqual(20);
  });
});
