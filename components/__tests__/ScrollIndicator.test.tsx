// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let currentPathname = '/blog/posts/test-slug';
let currentReducedMotion = false;

type ChangeListener = (event: { matches: boolean }) => void;

function createMatchMediaMock(matches: boolean) {
  const listeners: ChangeListener[] = [];

  return {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_event: string, callback: ChangeListener) => {
      listeners.push(callback);
    },
    removeEventListener: (_event: string, callback: ChangeListener) => {
      const index = listeners.indexOf(callback);
      if (index >= 0) listeners.splice(index, 1);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  };
}

const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      className,
      style,
    }: Pick<ComponentProps<'div'>, 'children' | 'className' | 'style'>) => (
      <div
        data-testid="scroll-indicator"
        className={className}
        style={style}
      >
        {children}
      </div>
    ),
  },
  useScroll: () => ({ scrollYProgress: 0 }),
  useSpring: () => 0,
}));

import { ScrollIndicator } from '@/components/ScrollIndicator';

beforeEach(() => {
  currentPathname = '/blog/posts/test-slug';
  currentReducedMotion = false;
  mockUsePathname.mockImplementation(() => currentPathname);

  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn((query: string) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return createMatchMediaMock(currentReducedMotion);
      }

      return createMatchMediaMock(false);
    }),
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('ScrollIndicator', () => {
  it('renders on blog post paths when reduced motion is off', () => {
    render(<ScrollIndicator />);

    expect(screen.queryByTestId('scroll-indicator')).toBeTruthy();
  });

  it('returns null on non-post paths', () => {
    currentPathname = '/blog/archive';

    render(<ScrollIndicator />);

    expect(screen.queryByTestId('scroll-indicator')).toBeNull();
  });

  it('returns null when reduced motion is enabled', () => {
    currentReducedMotion = true;

    render(<ScrollIndicator />);

    expect(screen.queryByTestId('scroll-indicator')).toBeNull();
  });
});
