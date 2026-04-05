// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PostMetadata } from '@/lib/types';

const { navigationState, replaceMock, trackMock, fuseImportControl, fuseSearchMock } = vi.hoisted(() => {
  const fuseImportControl = {
    promise: Promise.resolve(),
    resolve: () => {},
    reset() {
      this.promise = new Promise<void>((resolve) => {
        this.resolve = resolve;
      });
    },
  };

  return {
    navigationState: {
      pathname: '/blog',
      search: '',
    },
    replaceMock: vi.fn(),
    trackMock: vi.fn(),
    fuseImportControl,
    fuseSearchMock: vi.fn((query: string) => {
      void query;
      return [];
    }),
  };
});

vi.mock('next/navigation', () => ({
  usePathname: () => navigationState.pathname,
  useRouter: () => ({
    replace: replaceMock,
  }),
  useSearchParams: () => new URLSearchParams(navigationState.search),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<React.AnchorHTMLAttributes<HTMLAnchorElement>>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}));

vi.mock('@/lib/analytics', () => ({
  track: trackMock,
}));

vi.mock('../PostCard', () => ({
  PostCard: ({ post }: { post: PostMetadata }) => <article>{post.title}</article>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    variant: _variant,
    size: _size,
    ...props
  }: React.PropsWithChildren<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }
  >) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({
    children,
    ...props
  }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode; value: string }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

vi.mock('fuse.js', async () => {
  await fuseImportControl.promise;

  return {
    default: class MockFuse {
      search(query: string) {
        return fuseSearchMock(query);
      }
    },
  };
});

vi.mock('motion/react', () => ({
  motion: {
    button: ({
      children,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...props
    }: React.PropsWithChildren<
      React.ButtonHTMLAttributes<HTMLButtonElement> & {
        whileHover?: unknown;
        whileTap?: unknown;
      }
    >) => <button {...props}>{children}</button>,
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      transition: _transition,
      ...props
    }: React.PropsWithChildren<
      React.HTMLAttributes<HTMLDivElement> & {
        initial?: unknown;
        animate?: unknown;
        transition?: unknown;
      }
    >) => <div {...props}>{children}</div>,
  },
}));

import { SearchBar } from '../SearchBar';

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

describe('SearchBar blog query regression coverage', () => {
  beforeEach(() => {
    navigationState.pathname = '/blog';
    navigationState.search = '';
    replaceMock.mockReset();
    replaceMock.mockImplementation((url: string) => {
      navigationState.search = url.split('?')[1] ?? '';
    });
    trackMock.mockReset();
    fuseSearchMock.mockReset();
    fuseSearchMock.mockReturnValue([]);
    fuseImportControl.reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    fuseImportControl.resolve();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should keep first-load /blog?q= results filtered before Fuse resolves', () => {
    navigationState.search = 'q=python';

    render(<SearchBar posts={posts} tags={['Python', 'React']} initialQuery="python" />);

    expect((screen.getByLabelText(/search blog posts/i) as HTMLInputElement).value).toBe('python');
    expect(screen.getByText('Python Intro')).toBeTruthy();
    expect(screen.queryByText('React Patterns')).toBeNull();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('should trim and sync the q param when the search input changes', () => {
    const view = render(<SearchBar posts={posts} tags={['Python', 'React']} initialQuery="" />);

    const input = screen.getByLabelText(/search blog posts/i);

    fireEvent.change(input, { target: { value: '  react  ' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(replaceMock).toHaveBeenLastCalledWith('/blog?q=react', { scroll: false });

    act(() => {
      view.rerender(<SearchBar posts={posts} tags={['Python', 'React']} initialQuery="" />);
    });

    const syncedInput = screen.getByLabelText(/search blog posts/i);
    expect((syncedInput as HTMLInputElement).value).toBe('react');

    fireEvent.change(syncedInput, { target: { value: '' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(replaceMock).toHaveBeenLastCalledWith('/blog', { scroll: false });
  });
});
