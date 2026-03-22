// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ---------- matchMedia mock ----------

type ChangeListener = (e: { matches: boolean }) => void;

let currentMatches = false;
const listeners: ChangeListener[] = [];

function createMatchMediaMock(matches: boolean) {
  return {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_event: string, cb: ChangeListener) => {
      listeners.push(cb);
    },
    removeEventListener: (_event: string, cb: ChangeListener) => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  };
}

beforeEach(() => {
  vi.resetModules();
  currentMatches = false;
  listeners.length = 0;
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn((query: string) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return createMatchMediaMock(currentMatches);
      }
      return createMatchMediaMock(false);
    }),
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useReducedMotion', () => {
  it('returns false when prefers-reduced-motion is not set', async () => {
    const { useReducedMotion } = await import('@/components/hooks/useReducedMotion');
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when prefers-reduced-motion matches', async () => {
    currentMatches = true;
    const { useReducedMotion } = await import('@/components/hooks/useReducedMotion');
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('subscribes and unsubscribes on mount/unmount', async () => {
    const { useReducedMotion } = await import('@/components/hooks/useReducedMotion');
    const { unmount } = renderHook(() => useReducedMotion());
    expect(listeners.length).toBeGreaterThan(0);
    unmount();
    expect(listeners.length).toBe(0);
  });

  it('updates when media query changes', async () => {
    const { useReducedMotion } = await import('@/components/hooks/useReducedMotion');
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      currentMatches = true;
      for (const listener of [...listeners]) {
        listener({ matches: true });
      }
    });
    expect(result.current).toBe(true);
  });
});
