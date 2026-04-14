// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LandingTitle } from '@/components/LandingTitle';

const mockUseReducedMotion = vi.fn(() => false);

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'dark',
    setTheme: vi.fn(),
    theme: 'system',
  }),
}));

vi.mock('@/components/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}));

describe('LandingTitle locked previews', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockUseReducedMotion.mockReset();
    mockUseReducedMotion.mockReturnValue(false);
  });

  it('skips rotation scheduling and visibility listeners when a subtitle is locked', () => {
    const visibilityListenerSpy = vi.spyOn(document, 'addEventListener');
    const timeoutSpy = vi.spyOn(window, 'setTimeout');
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');

    render(
      <LandingTitle
        forcedSubtitleId="cybernetic-architect"
        disableRotation
      />,
    );

    expect(rafSpy).not.toHaveBeenCalled();
    expect(timeoutSpy).not.toHaveBeenCalled();
    expect(visibilityListenerSpy).not.toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
  });

  it('skips rotation scheduling when forceReducedMotion is enabled', () => {
    const visibilityListenerSpy = vi.spyOn(document, 'addEventListener');
    const timeoutSpy = vi.spyOn(window, 'setTimeout');
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');

    render(<LandingTitle forceReducedMotion />);

    expect(rafSpy).not.toHaveBeenCalled();
    expect(timeoutSpy).not.toHaveBeenCalled();
    expect(visibilityListenerSpy).not.toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
  });

  it('supports locked previews via legacy theme text lookup', () => {
    render(<LandingTitle forcedThemeText="emergence mystic" disableRotation />);

    expect(
      screen.getByRole('group', { name: /systems seer/i }),
    ).toBeTruthy();
  });
});
