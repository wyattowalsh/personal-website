import { describe, expect, it } from 'vitest';
import {
  getArchivedPosts,
  getStalePosts,
  generateArchiveSuggestions,
} from '../archive-mode';
import type { Post } from '@/lib/types';

function makePost(overrides: Partial<Post> & { slug: string; title: string }): Post {
  return {
    content: '',
    created: overrides.created ?? '2024-01-01',
    updated: overrides.updated,
    tags: overrides.tags ?? [],
    wordCount: 100,
    ...overrides,
  };
}

describe('getArchivedPosts', () => {
  it('returns posts older than 1 year', () => {
    const now = new Date();
    const oldDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    const recentDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const posts: Post[] = [
      makePost({ slug: 'old', title: 'Old Post', created: oldDate.toISOString().split('T')[0] }),
      makePost({ slug: 'recent', title: 'Recent Post', created: recentDate.toISOString().split('T')[0] }),
    ];

    const archived = getArchivedPosts(posts);
    expect(archived).toHaveLength(1);
    expect(archived[0].slug).toBe('old');
  });

  it('returns empty array when no posts are old enough', () => {
    const now = new Date();
    const recentDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const posts: Post[] = [
      makePost({ slug: 'recent', title: 'Recent Post', created: recentDate.toISOString().split('T')[0] }),
    ];

    expect(getArchivedPosts(posts)).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    expect(getArchivedPosts([])).toHaveLength(0);
  });
});

describe('getStalePosts', () => {
  it('returns posts not updated in 6 months', () => {
    const now = new Date();
    const staleDate = new Date(now.getFullYear(), now.getMonth() - 7, now.getDate());
    const freshDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const posts: Post[] = [
      makePost({ slug: 'stale', title: 'Stale Post', created: '2023-01-01', updated: staleDate.toISOString().split('T')[0] }),
      makePost({ slug: 'fresh', title: 'Fresh Post', created: '2023-01-01', updated: freshDate.toISOString().split('T')[0] }),
    ];

    const stale = getStalePosts(posts);
    expect(stale).toHaveLength(1);
    expect(stale[0].slug).toBe('stale');
  });

  it('falls back to created date when updated is missing', () => {
    const now = new Date();
    const staleDate = new Date(now.getFullYear(), now.getMonth() - 7, now.getDate());

    const posts: Post[] = [
      makePost({ slug: 'no-update', title: 'No Update', created: staleDate.toISOString().split('T')[0] }),
    ];

    expect(getStalePosts(posts)).toHaveLength(1);
  });

  it('returns empty array when all posts are fresh', () => {
    const now = new Date();
    const freshDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const posts: Post[] = [
      makePost({ slug: 'fresh', title: 'Fresh Post', created: freshDate.toISOString().split('T')[0] }),
    ];

    expect(getStalePosts(posts)).toHaveLength(0);
  });
});

describe('generateArchiveSuggestions', () => {
  it('suggests redirect for posts over 2 years old', () => {
    const now = new Date();
    const veryOld = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());

    const posts: Post[] = [
      makePost({ slug: 'ancient', title: 'Ancient Post', created: '2020-01-01', updated: veryOld.toISOString().split('T')[0] }),
    ];

    const suggestions = generateArchiveSuggestions(posts);
    expect(suggestions[0].action).toBe('redirect');
  });

  it('suggests merge for posts between 1 and 2 years old', () => {
    const now = new Date();
    const somewhatOld = new Date(now.getFullYear() - 1, now.getMonth() - 1, now.getDate());

    const posts: Post[] = [
      makePost({ slug: 'older', title: 'Older Post', created: '2022-01-01', updated: somewhatOld.toISOString().split('T')[0] }),
    ];

    const suggestions = generateArchiveSuggestions(posts);
    expect(suggestions[0].action).toBe('merge');
  });

  it('suggests update for posts stale under 1 year', () => {
    const now = new Date();
    const staleDate = new Date(now.getFullYear(), now.getMonth() - 7, now.getDate());

    const posts: Post[] = [
      makePost({ slug: 'stale', title: 'Stale Post', created: staleDate.toISOString().split('T')[0] }),
    ];

    const suggestions = generateArchiveSuggestions(posts);
    expect(suggestions[0].action).toBe('update');
  });

  it('sorts suggestions by age descending', () => {
    const now = new Date();
    const oldest = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
    const newer = new Date(now.getFullYear(), now.getMonth() - 7, now.getDate());

    const posts: Post[] = [
      makePost({ slug: 'newer', title: 'Newer', created: newer.toISOString().split('T')[0] }),
      makePost({ slug: 'oldest', title: 'Oldest', created: oldest.toISOString().split('T')[0] }),
    ];

    const suggestions = generateArchiveSuggestions(posts);
    expect(suggestions[0].slug).toBe('oldest');
    expect(suggestions[1].slug).toBe('newer');
  });

  it('returns empty array when no stale posts exist', () => {
    const now = new Date();
    const freshDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const posts: Post[] = [
      makePost({ slug: 'fresh', title: 'Fresh Post', created: freshDate.toISOString().split('T')[0] }),
    ];

    expect(generateArchiveSuggestions(posts)).toHaveLength(0);
  });
});
