import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getConfig } from '@/lib/config';

const mockEnsurePreprocessed = vi.fn(() => Promise.resolve());
const mockGetAllPosts = vi.fn(() => Promise.resolve([
  {
    slug: 'test-post',
    title: 'Test Post',
    created: '2025-03-15',
    updated: '2025-03-16',
    tags: ['Data Science'],
    content: 'content',
    wordCount: 1,
    readingTime: '1 min read',
  },
]));
const mockGetAllTags = vi.fn(() => Promise.resolve(['Data Science']));

vi.mock('@/lib/server', () => ({
  BackendService: {
    ensurePreprocessed: () => mockEnsurePreprocessed(),
    getInstance: () => ({
      getAllPosts: mockGetAllPosts,
      getAllTags: mockGetAllTags,
    }),
  },
}));

import sitemap from '../sitemap';

const siteUrl = getConfig().site.url;

describe('sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('includes archive, privacy, and encoded tag routes', async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain(`${siteUrl}/blog/archive`);
    expect(urls).toContain(`${siteUrl}/privacy`);
    expect(urls).toContain(`${siteUrl}/blog/tags/${encodeURIComponent('Data Science')}`);
  });

  it('ensures content is preprocessed before sitemap generation', async () => {
    await sitemap();

    expect(mockEnsurePreprocessed).toHaveBeenCalledOnce();
  });
});
