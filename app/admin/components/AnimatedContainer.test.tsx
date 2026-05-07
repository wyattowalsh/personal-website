// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { AnimatedContainer, CountUp, TextReveal } from './AnimatedContainer';

const reducedMotionMock = vi.hoisted(() => ({ value: true }));

vi.mock('@/components/hooks/useReducedMotion', () => ({
  useReducedMotion: () => reducedMotionMock.value,
}));

afterEach(() => {
  reducedMotionMock.value = true;
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('AnimatedContainer reduced motion', () => {
  it('renders content immediately without starting intersection observers', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    const IntersectionObserverMock = vi.fn(() => ({ observe, disconnect }));
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

    render(
      <AnimatedContainer animation="fade-slide" delay={500}>
        <p>Immediate content</p>
      </AnimatedContainer>
    );

    expect(screen.getByText('Immediate content').parentElement).toHaveAttribute('data-visible', 'true');
    expect(IntersectionObserverMock).not.toHaveBeenCalled();
  });

  it('renders count-up values at their final value immediately', () => {
    render(<CountUp end={42} />);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('keeps revealed characters out of the accessibility tree', () => {
    render(<TextReveal text="Admin" />);

    expect(screen.getByText('Admin')).toHaveClass('sr-only');
    expect(screen.getByText('Admin').nextElementSibling).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps animated content in the accessibility tree before it intersects', () => {
    reducedMotionMock.value = false;
    vi.useFakeTimers();
    const observe = vi.fn();
    const disconnect = vi.fn();
    let onIntersect: IntersectionObserverCallback | undefined;
    const IntersectionObserverMock = vi.fn(function IntersectionObserverMock(callback: IntersectionObserverCallback) {
      onIntersect = callback;
      return { observe, disconnect };
    });
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

    render(
      <AnimatedContainer animation="fade-slide" delay={150}>
        <button type="button">Delayed content</button>
      </AnimatedContainer>
    );

    const container = screen.getByRole('button', { name: 'Delayed content', hidden: true }).parentElement;
    expect(container).toHaveAttribute('data-visible', 'false');
    expect(container).not.toHaveAttribute('aria-hidden');
    expect(container).not.toHaveAttribute('inert');
    expect(observe).toHaveBeenCalled();

    act(() => {
      onIntersect?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      vi.advanceTimersByTime(150);
    });

    expect(container).toHaveAttribute('data-visible', 'true');
    expect(container).not.toHaveAttribute('aria-hidden');
    expect(container).not.toHaveAttribute('inert');
  });

  it('cancels delayed reveal when content exits before the timer fires', () => {
    reducedMotionMock.value = false;
    vi.useFakeTimers();
    let onIntersect: IntersectionObserverCallback | undefined;
    const IntersectionObserverMock = vi.fn(function IntersectionObserverMock(callback: IntersectionObserverCallback) {
      onIntersect = callback;
      return { observe: vi.fn(), disconnect: vi.fn() };
    });
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

    render(
      <AnimatedContainer animation="fade-slide" delay={150}>
        <button type="button">Cancelled content</button>
      </AnimatedContainer>
    );

    const container = screen.getByRole('button', { name: 'Cancelled content', hidden: true }).parentElement;

    act(() => {
      onIntersect?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      onIntersect?.([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
      vi.advanceTimersByTime(150);
    });

    expect(container).toHaveAttribute('data-visible', 'false');
    expect(container).not.toHaveAttribute('inert');
  });

  it('shows content when IntersectionObserver is unavailable', () => {
    reducedMotionMock.value = false;
    vi.useFakeTimers();
    vi.stubGlobal('IntersectionObserver', undefined);

    render(
      <AnimatedContainer animation="fade-slide">
        <button type="button">Fallback content</button>
      </AnimatedContainer>
    );

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const container = screen.getByRole('button', { name: 'Fallback content' }).parentElement;
    expect(container).toHaveAttribute('data-visible', 'true');
    expect(container).not.toHaveAttribute('aria-hidden');
    expect(container).not.toHaveAttribute('inert');
  });
});
