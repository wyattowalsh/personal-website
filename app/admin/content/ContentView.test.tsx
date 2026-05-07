// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContentView } from './ContentView';
import { DEFAULT_FILTERS } from './filter-utils';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/content',
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('../components/ExportButton', () => ({
  ExportButton: ({ data, label }: { data: unknown[]; label: string }) => (
    <button type="button" data-testid="content-export" data-count={data.length}>
      {label}
    </button>
  ),
}));

const posts = [
  {
    slug: 'react-notes',
    title: 'React Notes',
    created: '2026-01-01',
    updated: '2026-01-02',
    wordCount: 1200,
    readingTime: '6 min read',
    tags: ['React', 'Frontend'],
    image: '/react.png',
    summary: 'Compiler and rendering details',
  },
  {
    slug: 'agent-admin',
    title: 'Admin Systems',
    created: '2025-01-01',
    wordCount: 800,
    readingTime: '4 min read',
    tags: ['Agents'],
    summary: 'Operational agents and dashboards',
  },
];

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('ContentView', () => {
  it('exports only posts in the current filtered view', () => {
    render(
      <ContentView
        posts={posts}
        allTags={['React', 'Frontend', 'Agents']}
        initialFilters={{ ...DEFAULT_FILTERS, search: 'compiler', scope: 'summary' }}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('1 post in current view');
    expect(screen.getByTestId('content-export')).toHaveAttribute('data-count', '1');
    expect(screen.getByRole('link', { name: 'React Notes' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin Systems' })).not.toBeInTheDocument();
  });

  it('syncs filter changes back to the content URL', () => {
    vi.useFakeTimers();
    const replaceState = vi.spyOn(window.history, 'replaceState');
    render(
      <ContentView
        posts={posts}
        allTags={['React', 'Frontend', 'Agents']}
        initialFilters={{ ...DEFAULT_FILTERS }}
      />
    );

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search posts' }), {
      target: { value: 'Admin' },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(replaceState).toHaveBeenCalledWith(null, '', '/admin/content?q=Admin');
  });

  it('removes default filter params from the content URL on reset', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState');
    render(
      <ContentView
        posts={posts}
        allTags={['React', 'Frontend', 'Agents']}
        initialFilters={{ ...DEFAULT_FILTERS, tag: 'Agents', search: 'Admin', scope: 'all', sort: 'a-z' }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(replaceState).toHaveBeenCalledWith(null, '', '/admin/content');
  });
});
