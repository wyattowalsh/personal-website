import { describe, expect, it } from 'vitest';
import { buildBlogStatsSummary, getInventoryChange, getInventoryTrend, getPostDateRange } from './summary';

describe('blog stats summary helpers', () => {
  it('derives oldest and newest posts from dates instead of array order', () => {
    const range = getPostDateRange([
      { created: '2026-04-25' },
      { created: '2021-01-12' },
      { created: '2024-08-01' },
    ]);

    expect(range).toEqual({
      oldestPost: '1/12/2021',
      newestPost: '4/25/2026',
    });
  });

  it('returns empty-state labels when no posts exist', () => {
    expect(getPostDateRange([])).toEqual({
      oldestPost: 'N/A',
      newestPost: 'N/A',
    });
  });

  it('does not invent percentage deltas for static inventory metrics', () => {
    expect(getInventoryChange()).toBeUndefined();
  });

  it('uses neutral inventory pulse state without historical comparison data', () => {
    expect(getInventoryTrend()).toBe('neutral');
  });

  it('derives year, tag, reading-time, and word-count summaries', () => {
    const summary = buildBlogStatsSummary([
      {
        slug: 'short-post',
        title: 'Short Post',
        created: '2024-01-15',
        tags: ['React', 'Admin'],
        readingTime: '2 min read',
        wordCount: 400,
      },
      {
        slug: 'long-post',
        title: 'A Very Long Post Title That Should Be Truncated',
        created: '2026-03-20',
        tags: ['React'],
        readingTime: '11 min read',
        wordCount: 2400,
      },
      {
        slug: 'middle-post',
        title: 'Middle Post',
        created: '2024-05-01',
        tags: ['TypeScript'],
        readingTime: 'bad data',
        wordCount: 800,
      },
    ], ['React', 'Admin', 'TypeScript']);

    expect(summary.totalWords).toBe(3600);
    expect(summary.avgWordCount).toBe(1200);
    expect(summary.minWordCount).toBe(400);
    expect(summary.maxWordCount).toBe(2400);
    expect(summary.avgReadingTime).toBe(4);
    expect(summary.avgPostsPerYear).toBe('1.5');
    expect(summary.postsByYear).toEqual([
      { year: '2024', count: 2 },
      { year: '2026', count: 1 },
    ]);
    expect(summary.tagData).toEqual([
      { tag: 'React', count: 2 },
      { tag: 'Admin', count: 1 },
      { tag: 'TypeScript', count: 1 },
    ]);
    expect(summary.uniqueTagCount).toBe(3);
    expect(summary.readingTimeDist).toEqual([
      { bucket: '1-3 min', count: 1 },
      { bucket: '4-6 min', count: 0 },
      { bucket: '7-10 min', count: 0 },
      { bucket: '10+ min', count: 1 },
    ]);
    expect(summary.wordData[1]).toEqual({ name: 'A Very Long Post Title Th...', words: 2400 });
    expect(summary.postsTableData[0]).toEqual({
      slug: 'short-post',
      title: 'Short Post',
      created: '2024-01-15',
      wordCount: 400,
      readingTime: '2 min read',
      tags: ['React', 'Admin'],
    });
  });
});
