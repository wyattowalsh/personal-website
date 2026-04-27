import { describe, expect, it } from 'vitest';
import { findRelatedPosts, getPostSimilarityScore } from '../related-posts';
import type { Post } from '@/lib/types';

function makePost(overrides: Partial<Post> & { slug: string; title: string }): Post {
  return {
    content: '',
    created: '2024-01-01',
    tags: overrides.tags ?? [],
    wordCount: 100,
    ...overrides,
  };
}

describe('getPostSimilarityScore', () => {
  it('returns 1 for identical tags', () => {
    const postA = makePost({ slug: 'a', title: 'A', tags: ['react', 'nextjs'] });
    const postB = makePost({ slug: 'b', title: 'B', tags: ['react', 'nextjs'] });
    expect(getPostSimilarityScore(postA, postB)).toBe(1);
  });

  it('returns 0 for no shared tags', () => {
    const postA = makePost({ slug: 'a', title: 'A', tags: ['react'] });
    const postB = makePost({ slug: 'b', title: 'B', tags: ['python'] });
    expect(getPostSimilarityScore(postA, postB)).toBe(0);
  });

  it('returns 0.5 for half overlap', () => {
    const postA = makePost({ slug: 'a', title: 'A', tags: ['react', 'nextjs', 'typescript'] });
    const postB = makePost({ slug: 'b', title: 'B', tags: ['react', 'nextjs', 'vue'] });
    expect(getPostSimilarityScore(postA, postB)).toBe(0.5);
  });

  it('returns 0 when both have no tags', () => {
    const postA = makePost({ slug: 'a', title: 'A', tags: [] });
    const postB = makePost({ slug: 'b', title: 'B', tags: [] });
    expect(getPostSimilarityScore(postA, postB)).toBe(0);
  });
});

describe('findRelatedPosts', () => {
  it('returns related posts sorted by similarity', () => {
    const posts: Post[] = [
      makePost({ slug: 'target', title: 'Target', tags: ['react', 'nextjs'] }),
      makePost({ slug: 'related', title: 'Related', tags: ['react', 'nextjs', 'typescript'] }),
      makePost({ slug: 'somewhat', title: 'Somewhat', tags: ['react'] }),
      makePost({ slug: 'unrelated', title: 'Unrelated', tags: ['python'] }),
    ];

    const related = findRelatedPosts('target', posts);
    expect(related).toHaveLength(2);
    expect(related[0].slug).toBe('related');
    expect(related[1].slug).toBe('somewhat');
  });

  it('respects the limit parameter', () => {
    const posts: Post[] = [
      makePost({ slug: 'target', title: 'Target', tags: ['react'] }),
      makePost({ slug: 'a', title: 'A', tags: ['react'] }),
      makePost({ slug: 'b', title: 'B', tags: ['react'] }),
      makePost({ slug: 'c', title: 'C', tags: ['react'] }),
    ];

    const related = findRelatedPosts('target', posts, 2);
    expect(related).toHaveLength(2);
  });

  it('excludes the target post from results', () => {
    const posts: Post[] = [
      makePost({ slug: 'target', title: 'Target', tags: ['react'] }),
    ];

    expect(findRelatedPosts('target', posts)).toHaveLength(0);
  });

  it('returns empty array for unknown slug', () => {
    const posts: Post[] = [
      makePost({ slug: 'a', title: 'A', tags: ['react'] }),
    ];

    expect(findRelatedPosts('unknown', posts)).toHaveLength(0);
  });

  it('includes shared tags in results', () => {
    const posts: Post[] = [
      makePost({ slug: 'target', title: 'Target', tags: ['react', 'nextjs'] }),
      makePost({ slug: 'related', title: 'Related', tags: ['react', 'nextjs'] }),
    ];

    const related = findRelatedPosts('target', posts);
    expect(related[0].sharedTags).toEqual(['react', 'nextjs']);
  });
});
