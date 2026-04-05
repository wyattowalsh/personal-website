import { describe, expect, it } from 'vitest';
import type { PostMetadata } from '@/lib/types';
import { getInitialResults } from '../SearchBar';

const posts: PostMetadata[] = [
  {
    slug: 'python-intro',
    title: 'Python Intro',
    summary: 'Learn the Python basics.',
    created: '2025-03-20',
    updated: '2025-03-20',
    tags: ['Python'],
    readingTime: '3 min read',
  },
  {
    slug: 'react-patterns',
    title: 'React Patterns',
    summary: 'Composable UI patterns for React apps.',
    created: '2025-03-10',
    updated: '2025-03-10',
    tags: ['React'],
    readingTime: '4 min read',
  },
];

describe('getInitialResults', () => {
  it('filters posts before Fuse finishes loading', () => {
    const results = getInitialResults(posts, 'python');

    expect(results).toHaveLength(1);
    expect(results[0]?.slug).toBe('python-intro');
  });

  it('returns posts sorted by created date when query is empty', () => {
    const results = getInitialResults(posts, '');

    expect(results.map((post) => post.slug)).toEqual([
      'python-intro',
      'react-patterns',
    ]);
  });
});
