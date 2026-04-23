// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LandingTitle } from '@/components/LandingTitle';
import { LANDING_TITLE_SUBTITLE_OPTIONS } from '@/components/landing-title/registry';

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

  it('supports locked previews via retired visible title lookup', () => {
    render(<LandingTitle forcedThemeText="systems seer" disableRotation />);

    expect(
      screen.getByRole('group', { name: /circuit seer/i }),
    ).toBeTruthy();
  });

  it('keeps homepage surface free of audit metadata', () => {
    render(<LandingTitle forcedSubtitleId="cybernetic-architect" disableRotation />);

    expect(screen.queryByText('adaptive command mesh')).toBeNull();
    expect(
      screen.getByRole('group', { name: /cyber tactician/i }).getAttribute('data-surface'),
    ).toBe('homepage');
  });

  it('shows metadata on the audit surface outside the card composition', () => {
    render(
      <LandingTitle
        forcedSubtitleId="cybernetic-architect"
        disableRotation
        surface="audit"
      />,
    );

    expect(screen.getByText('Architect')).toBeTruthy();
    expect(screen.getByText('adaptive command mesh')).toBeTruthy();
    expect(
      screen.getByRole('group', { name: /cyber tactician/i }).getAttribute('data-surface'),
    ).toBe('audit');
  });

  it('hides audit metadata when the audit surface signal deck is disabled', () => {
    render(
      <LandingTitle
        forcedSubtitleId="cybernetic-architect"
        disableRotation
        surface="audit"
        hideSignalDeck
      />,
    );

    expect(screen.queryByText('Architect')).toBeNull();
    expect(screen.queryByText('adaptive command mesh')).toBeNull();
  });

  it('renders every subtitle variant in compact audit mode without throwing', () => {
    for (const option of LANDING_TITLE_SUBTITLE_OPTIONS) {
      const { unmount } = render(
        <LandingTitle
          forcedSubtitleId={option.id}
          disableRotation
          surface="audit"
          compact
          showName={false}
        />,
      );

      expect(screen.getByRole('group', { name: new RegExp(option.text, 'i') })).toBeTruthy();
      unmount();
    }
  });
});
