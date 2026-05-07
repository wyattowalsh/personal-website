import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, filterContentPosts, parseContentFilters } from './filter-utils';

const posts = [
  {
    slug: 'react-notes',
    title: 'React Notes',
    summary: 'Compiler and rendering details',
    tags: ['React', 'Frontend'],
    created: '2026-01-01',
    wordCount: 1200,
  },
  {
    slug: 'agent-admin',
    title: 'Admin Systems',
    summary: 'Operational agents and dashboards',
    tags: ['Agents'],
    created: '2025-01-01',
    wordCount: 800,
  },
];

describe('content filter helpers', () => {
  it('normalizes invalid URL filters to defaults', () => {
    expect(parseContentFilters({ q: ['react'], tag: [], sort: 'unknown', scope: 'bad' })).toEqual({
      ...DEFAULT_FILTERS,
      search: 'react',
    });
  });

  it('parses valid URL filters from first values', () => {
    expect(parseContentFilters({
      q: [' compiler ', 'ignored'],
      tag: ['React', 'Agents'],
      sort: ['least-words', 'newest'],
      scope: ['summary', 'title'],
    })).toEqual({
      search: 'compiler',
      tag: 'React',
      sort: 'least-words',
      scope: 'summary',
    });
  });

  it('filters by search scope across title, summary, tags, and all fields', () => {
    expect(filterContentPosts(posts, { ...DEFAULT_FILTERS, search: 'compiler', scope: 'summary' }).map((post) => post.slug)).toEqual(['react-notes']);
    expect(filterContentPosts(posts, { ...DEFAULT_FILTERS, search: 'agents', scope: 'tags' }).map((post) => post.slug)).toEqual(['agent-admin']);
    expect(filterContentPosts(posts, { ...DEFAULT_FILTERS, search: 'agent-admin', scope: 'all' }).map((post) => post.slug)).toEqual(['agent-admin']);
    expect(filterContentPosts(posts, { ...DEFAULT_FILTERS, search: 'compiler', scope: 'title' })).toEqual([]);
  });

  it('sorts filtered posts using the requested order', () => {
    expect(filterContentPosts(posts, { ...DEFAULT_FILTERS, sort: 'oldest' }).map((post) => post.slug)).toEqual(['agent-admin', 'react-notes']);
    expect(filterContentPosts(posts, { ...DEFAULT_FILTERS, sort: 'most-words' }).map((post) => post.slug)).toEqual(['react-notes', 'agent-admin']);
    expect(filterContentPosts(posts, { ...DEFAULT_FILTERS, sort: 'least-words' }).map((post) => post.slug)).toEqual(['agent-admin', 'react-notes']);
    expect(filterContentPosts(posts, { ...DEFAULT_FILTERS, sort: 'a-z' }).map((post) => post.slug)).toEqual(['agent-admin', 'react-notes']);
  });

  it('filters by tag before applying sort order', () => {
    expect(filterContentPosts(posts, { ...DEFAULT_FILTERS, tag: 'React' }).map((post) => post.slug)).toEqual(['react-notes']);
  });
});
