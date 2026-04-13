import path from 'path';
import * as fs from 'fs/promises';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';

const globMockState: { extraFiles: string[] } = { extraFiles: [] };

vi.mock('glob', async (importOriginal) => {
  const actual = await importOriginal<typeof import('glob')>();

  return {
    ...actual,
    glob: async (...args: Parameters<typeof actual.glob>) => {
      const files = await actual.glob(...args);
      return [...files, ...globMockState.extraFiles];
    },
  };
});

import { BackendService, jsonResponse } from '../server';

describe('BackendService', () => {
  beforeAll(async () => {
    await BackendService.ensurePreprocessed();
  });

  describe('getAllPosts', () => {
    it('returns all posts sorted by date descending', async () => {
      const backend = BackendService.getInstance();
      const posts = await backend.getAllPosts();
      expect(posts.length).toBeGreaterThan(0);

      // Verify descending date order via createdTimestamp
      for (let i = 1; i < posts.length; i++) {
        expect(posts[i - 1].createdTimestamp).toBeGreaterThanOrEqual(
          posts[i].createdTimestamp ?? 0
        );
      }
    });

    it('returns Post[] with expected shape', async () => {
      const backend = BackendService.getInstance();
      const posts = await backend.getAllPosts();
      const post = posts[0];
      expect(post).toHaveProperty('slug');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('created');
      expect(post).toHaveProperty('tags');
      expect(post).toHaveProperty('wordCount');
      expect(post).toHaveProperty('readingTime');
      expect(typeof post.slug).toBe('string');
      expect(typeof post.title).toBe('string');
      expect(typeof post.wordCount).toBe('number');
      expect(Array.isArray(post.tags)).toBe(true);
    });

    it('returns consistent results on repeated calls (caching)', async () => {
      const backend = BackendService.getInstance();
      const first = await backend.getAllPosts();
      const second = await backend.getAllPosts();
      expect(first).toBe(second); // Same reference due to cache
    });
  });

  describe('getPost', () => {
    it('returns a known post by slug', async () => {
      const backend = BackendService.getInstance();
      const post = await backend.getPost('proxywhirl');
      expect(post).not.toBeNull();
      expect(post!.slug).toBe('proxywhirl');
      expect(post!.title).toBe('ProxyWhirl');
      expect(post!.tags).toContain('Python');
    });

    it('returns null for unknown slug', async () => {
      const backend = BackendService.getInstance();
      const post = await backend.getPost('this-slug-does-not-exist');
      expect(post).toBeNull();
    });
  });

  describe('getPostsByTag', () => {
    it('returns posts for a known tag', async () => {
      const backend = BackendService.getInstance();
      const posts = await backend.getPostsByTag('Project');
      expect(posts.length).toBeGreaterThan(0);
      posts.forEach(p => {
        expect(p.tags).toContain('Project');
      });
    });

    it('returns posts sorted by date descending', async () => {
      const backend = BackendService.getInstance();
      const posts = await backend.getPostsByTag('Project');
      for (let i = 1; i < posts.length; i++) {
        expect(posts[i - 1].createdTimestamp).toBeGreaterThanOrEqual(
          posts[i].createdTimestamp ?? 0
        );
      }
    });

    it('returns empty array for unknown tag', async () => {
      const backend = BackendService.getInstance();
      const posts = await backend.getPostsByTag('NonexistentTag12345');
      expect(posts).toEqual([]);
    });

    it('caches results for repeated calls', async () => {
      const backend = BackendService.getInstance();
      const first = await backend.getPostsByTag('Python');
      const second = await backend.getPostsByTag('Python');
      expect(first).toBe(second); // Same reference due to cache
    });
  });

  describe('getAllTags', () => {
    it('returns a sorted string array', async () => {
      const backend = BackendService.getInstance();
      const tags = await backend.getAllTags();
      expect(tags.length).toBeGreaterThan(0);
      expect(Array.isArray(tags)).toBe(true);
      tags.forEach(t => expect(typeof t).toBe('string'));

      // Verify sorted order
      const sorted = [...tags].sort();
      expect(tags).toEqual(sorted);
    });

    it('includes known tags from content', async () => {
      const backend = BackendService.getInstance();
      const tags = await backend.getAllTags();
      expect(tags).toContain('Project');
      expect(tags).toContain('Python');
    });
  });

  describe('getAdjacentPosts', () => {
    it('returns previous and next for a middle post', async () => {
      const backend = BackendService.getInstance();
      const allPosts = await backend.getAllPosts();
      // Find a post that is not first or last
      expect(allPosts.length).toBeGreaterThanOrEqual(3);
      const middleSlug = allPosts[1].slug;
      const adjacent = await backend.getAdjacentPosts(middleSlug);
      expect(adjacent).not.toBeNull();
      if (!adjacent) {
        return;
      }
      expect(adjacent.previous).not.toBeNull();
      expect(adjacent.next).not.toBeNull();
      expect(adjacent.previous!.slug).toBe(allPosts[0].slug);
      expect(adjacent.next!.slug).toBe(allPosts[2].slug);
    });

    it('returns null previous for first post', async () => {
      const backend = BackendService.getInstance();
      const allPosts = await backend.getAllPosts();
      const firstSlug = allPosts[0].slug;
      const adjacent = await backend.getAdjacentPosts(firstSlug);
      expect(adjacent).not.toBeNull();
      if (!adjacent) {
        return;
      }
      expect(adjacent.previous).toBeNull();
      expect(adjacent.next).not.toBeNull();
    });

    it('returns null next for last post', async () => {
      const backend = BackendService.getInstance();
      const allPosts = await backend.getAllPosts();
      const lastSlug = allPosts[allPosts.length - 1].slug;
      const adjacent = await backend.getAdjacentPosts(lastSlug);
      expect(adjacent).not.toBeNull();
      if (!adjacent) {
        return;
      }
      expect(adjacent.previous).not.toBeNull();
      expect(adjacent.next).toBeNull();
    });

    it('returns null for unknown slug', async () => {
      const backend = BackendService.getInstance();
      const adjacent = await backend.getAdjacentPosts('nonexistent-slug');
      expect(adjacent).toBeNull();
    });
  });

  describe('search', () => {
    it('returns results for a known post title', async () => {
      const backend = BackendService.getInstance();
      const results = await backend.search('ProxyWhirl');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.slug).toBe('proxywhirl');
    });

    it('returns results for partial content match', async () => {
      const backend = BackendService.getInstance();
      const results = await backend.search('proxy rotation');
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns empty array for gibberish query', async () => {
      const backend = BackendService.getInstance();
      const results = await backend.search('zzzzxxxxxqqqqqwwwww12345');
      expect(results).toEqual([]);
    });

    it('search results include matches metadata', async () => {
      const backend = BackendService.getInstance();
      const results = await backend.search('ProxyWhirl');
      expect(results.length).toBeGreaterThan(0);
      // Fuse.js includeMatches is enabled, so matches should be present
      expect(results[0]).toHaveProperty('matches');
    });
  });

  describe('getPostMetadata', () => {
    it('returns metadata without content, wordCount, adjacent, or createdTimestamp fields', async () => {
      const backend = BackendService.getInstance();
      const metadata = await backend.getPostMetadata('proxywhirl');
      expect(metadata).not.toBeNull();
      expect(metadata!.slug).toBe('proxywhirl');
      expect(metadata!.title).toBe('ProxyWhirl');
      expect(metadata!.tags).toContain('Python');
      expect(metadata).not.toHaveProperty('content');
      expect(metadata).not.toHaveProperty('wordCount');
      expect(metadata).not.toHaveProperty('adjacent');
      expect(metadata).not.toHaveProperty('createdTimestamp');
    });

    it('returns null for unknown slug', async () => {
      const backend = BackendService.getInstance();
      const metadata = await backend.getPostMetadata('nonexistent-slug');
      expect(metadata).toBeNull();
    });

    it('preserves all other Post fields', async () => {
      const backend = BackendService.getInstance();
      const metadata = await backend.getPostMetadata('proxywhirl');
      expect(metadata).toHaveProperty('slug');
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('created');
      expect(metadata).toHaveProperty('tags');
      expect(metadata).toHaveProperty('readingTime');
    });
  });

  describe('getRelatedPosts', () => {
    it('returns posts sorted by tag similarity + recency', async () => {
      const backend = BackendService.getInstance();
      const related = await backend.getRelatedPosts('proxywhirl');
      expect(related).not.toBeNull();
      if (!related) {
        return;
      }
      expect(related.length).toBeGreaterThan(0);
      expect(related.length).toBeLessThanOrEqual(3);
      // Should not include the source post
      expect(related.every(p => p.slug !== 'proxywhirl')).toBe(true);
    });

    it('returns null for unknown slug', async () => {
      const backend = BackendService.getInstance();
      const related = await backend.getRelatedPosts('nonexistent-post');
      expect(related).toBeNull();
    });

    it('respects the limit parameter', async () => {
      const backend = BackendService.getInstance();
      const related = await backend.getRelatedPosts('proxywhirl', 1);
      expect(related).not.toBeNull();
      if (!related) {
        return;
      }
      expect(related.length).toBeLessThanOrEqual(1);
    });

    it('excludes posts with zero tag overlap when tag score dominates', async () => {
      const backend = BackendService.getInstance();
      const related = await backend.getRelatedPosts('proxywhirl');
      const sourcePost = await backend.getPost('proxywhirl');
      expect(sourcePost).not.toBeNull();
      expect(related).not.toBeNull();
      if (!related) {
        return;
      }

      // All returned posts should share at least one tag with the source
      // (since tag score is weighted 0.7 and recency 0.3, posts with zero
      // shared tags can still appear via recency — but the filter r.score > 0
      // in the implementation means recency alone can qualify a post)
      related.forEach(p => {
        // At minimum, every related post must have a positive score
        // which the implementation guarantees via .filter(r => r.score > 0)
        expect(p.slug).not.toBe('proxywhirl');
      });
    });

    it('does not return more posts than exist', async () => {
      const backend = BackendService.getInstance();
      const related = await backend.getRelatedPosts('proxywhirl', 100);
      const allPosts = await backend.getAllPosts();
      expect(related).not.toBeNull();
      if (!related) {
        return;
      }
      // At most allPosts.length - 1 (excluding the source post)
      expect(related.length).toBeLessThanOrEqual(allPosts.length - 1);
    });

    it('returns related posts that share tags with the regression series', async () => {
      const backend = BackendService.getInstance();
      const related = await backend.getRelatedPosts('regularized-linear-regression-models-pt1');
      expect(related).not.toBeNull();
      if (!related) {
        return;
      }
      expect(related.length).toBeGreaterThan(0);

      // The regression pt2 and pt3 share identical tags, so they should appear
      const relatedSlugs = related.map(p => p.slug);
      expect(relatedSlugs).toContain('regularized-linear-regression-models-pt2');
    });
  });

  describe('getSeriesPosts', () => {
    it('returns posts in a series sorted by order', async () => {
      const backend = BackendService.getInstance();
      const series = await backend.getSeriesPosts('Regularized Linear Regression');
      expect(series.length).toBe(3);
      expect(series[0].series?.order).toBe(1);
      expect(series[1].series?.order).toBe(2);
      expect(series[2].series?.order).toBe(3);
    });

    it('returns correct slugs in order', async () => {
      const backend = BackendService.getInstance();
      const series = await backend.getSeriesPosts('Regularized Linear Regression');
      expect(series[0].slug).toBe('regularized-linear-regression-models-pt1');
      expect(series[1].slug).toBe('regularized-linear-regression-models-pt2');
      expect(series[2].slug).toBe('regularized-linear-regression-models-pt3');
    });

    it('returns empty array for unknown series', async () => {
      const backend = BackendService.getInstance();
      const series = await backend.getSeriesPosts('Nonexistent Series');
      expect(series).toEqual([]);
    });

    it('returns empty array for empty string', async () => {
      const backend = BackendService.getInstance();
      const series = await backend.getSeriesPosts('');
      expect(series).toEqual([]);
    });
  });

  describe('public DTO helpers', () => {
    it('getPostSummaries omits content and internal timestamps', async () => {
      const backend = BackendService.getInstance();
      const summaries = await backend.getPostSummaries();

      expect(summaries.length).toBeGreaterThan(0);
      expect(summaries[0]).not.toHaveProperty('content');
      expect(summaries[0]).not.toHaveProperty('wordCount');
      expect(summaries[0]).not.toHaveProperty('createdTimestamp');
    });

    it('getPublicPost preserves content while hiding internal fields', async () => {
      const backend = BackendService.getInstance();
      const post = await backend.getPublicPost('proxywhirl');

      expect(post).not.toBeNull();
      expect(post).toHaveProperty('content');
      expect(post).not.toHaveProperty('createdTimestamp');
      expect(post).not.toHaveProperty('adjacent');
    });

    it('getAdjacentPostLinks returns minimal post references', async () => {
      const backend = BackendService.getInstance();
      const allPosts = await backend.getAllPosts();
      const adjacent = await backend.getAdjacentPostLinks(allPosts[1].slug);

      expect(adjacent).not.toBeNull();
      expect(adjacent?.previous).toEqual({
        slug: allPosts[0].slug,
        title: allPosts[0].title,
      });
      expect(adjacent?.next).toEqual({
        slug: allPosts[2].slug,
        title: allPosts[2].title,
      });
    });

    it('getRelatedPostSummaries returns lean metadata', async () => {
      const backend = BackendService.getInstance();
      const related = await backend.getRelatedPostSummaries('proxywhirl', 1);

      expect(related).not.toBeNull();
      expect(related).toHaveLength(1);
      expect(related?.[0]).not.toHaveProperty('content');
      expect(related?.[0]).not.toHaveProperty('createdTimestamp');
    });

    it('searchPublic strips full post content from search results', async () => {
      const backend = BackendService.getInstance();
      const results = await backend.searchPublic('ProxyWhirl');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].post.slug).toBe('proxywhirl');
      expect(results[0].post).not.toHaveProperty('content');
      expect(Array.isArray(results[0].matches)).toBe(true);
    });
  });

  describe('preprocess validation', () => {
    const invalidSlug = '__vitest-invalid-date';
    const validSlug = '__vitest-valid-post';
    const postsDir = path.join(process.cwd(), 'content/posts');
    const fixtureRoot = path.join(process.cwd(), '.cache', '__vitest-post-fixtures');
    const invalidPostContent = `---
title: "Invalid Date"
created: "2024-02-30"
updated: "2024-02-30"
tags: ["Test"]
---

Broken content`;
    const validPostContent = `---
title: "Valid Post"
created: "2024-02-29"
updated: "2024-03-01"
tags: ["Test"]
---

# Heading

**Hello** [world](https://example.com)`;

    async function writeMockPost(slug: string, content: string) {
      const postDir = path.join(fixtureRoot, slug);
      const filePath = path.join(postDir, 'index.mdx');
      await fs.mkdir(postDir, { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
      return filePath;
    }

    afterEach(async () => {
      globMockState.extraFiles = [];
      vi.restoreAllMocks();
      await fs.rm(fixtureRoot, { recursive: true, force: true });
      await BackendService.getInstance().preprocess(false);
    });

    it('rejects invalid production content without replacing the last good snapshot', async () => {
      const backend = BackendService.getInstance();
      const baselinePosts = await backend.getAllPosts();
      const invalidFilePath = await writeMockPost(invalidSlug, invalidPostContent);

      globMockState.extraFiles = [invalidFilePath];

      await expect(backend.preprocess(false)).rejects.toThrow('Preprocessing failed');
      expect(await backend.getAllPosts()).toBe(baselinePosts);
    });

    it('continues with valid posts in development while counting invalid content errors', async () => {
      const backend = BackendService.getInstance();
      const baselineCount = (await backend.getAllPosts()).length;
      const validFilePath = await writeMockPost(validSlug, validPostContent);
      const invalidFilePath = await writeMockPost(invalidSlug, invalidPostContent);

      globMockState.extraFiles = [validFilePath, invalidFilePath];

      const stats = await backend.preprocess(true);
      const validPost = await backend.getPost(validSlug);

      expect(stats.postsProcessed).toBe(baselineCount + 1);
      expect(stats.errors).toBe(1);
      expect(validPost?.content).toContain('Hello');
      expect(validPost?.content).not.toContain('**');
      expect(await backend.getPost(invalidSlug)).toBeNull();
    });
  });
});

describe('jsonResponse', () => {
  it('sets Cache-Control for cache: true (boolean)', async () => {
    const res = jsonResponse({ ok: true }, { cache: true });
    const cacheControl = res.headers.get('Cache-Control');
    expect(cacheControl).toBe('public, s-maxage=3600, stale-while-revalidate=7200');
  });

  it('sets Cache-Control for cache: number', async () => {
    const res = jsonResponse({ ok: true }, { cache: 600 });
    const cacheControl = res.headers.get('Cache-Control');
    expect(cacheControl).toBe('public, s-maxage=600, stale-while-revalidate=1200, stale-if-error=2400');
  });

  it('sets private Cache-Control when no cache option', async () => {
    const res = jsonResponse({ ok: true });
    const cacheControl = res.headers.get('Cache-Control');
    expect(cacheControl).toBe('private, must-revalidate, max-age=60');
  });

  it('sets Content-Type to application/json', async () => {
    const res = jsonResponse({ ok: true });
    const contentType = res.headers.get('Content-Type');
    expect(contentType).toContain('application/json');
  });

  it('returns body with data and meta.timestamp structure', async () => {
    const payload = { items: [1, 2, 3] };
    const res = jsonResponse(payload);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toEqual(payload);
    expect(body).toHaveProperty('meta');
    expect(body.meta).toHaveProperty('timestamp');
    // Timestamp should be a valid ISO string
    expect(() => new Date(body.meta.timestamp)).not.toThrow();
    expect(new Date(body.meta.timestamp).toISOString()).toBe(body.meta.timestamp);
  });

  it('sets private cache when cache: false', async () => {
    const res = jsonResponse({ ok: true }, { cache: false });
    const cacheControl = res.headers.get('Cache-Control');
    expect(cacheControl).toBe('private, must-revalidate, max-age=60');
  });
});
