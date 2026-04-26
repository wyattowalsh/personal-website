// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LandingTitle } from '@/components/LandingTitle';
import { LANDING_TITLE_SUBTITLE_OPTIONS } from '@/components/landing-title/registry';

const mockUseReducedMotion = vi.fn(() => false);
const VISIBLE_DASH_PATTERN = /[-\u2010-\u2015]/;
const LANDING_TITLE_CSS_MODULES = [
  'systems.module.css',
  'arcane.module.css',
  'crafted.module.css',
  'performance.module.css',
] as const;

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
    const group = screen.getByRole('group', { name: /cyber tactician/i });

    expect(group.getAttribute('data-surface')).toBe('homepage');
    expect(group.closest('[data-current-subtitle-id]')?.getAttribute('data-current-subtitle-id')).toBe(
      'cybernetic-architect',
    );
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

  it('keeps visible subtitle copy dashless while retaining kebab-case ids', () => {
    for (const option of LANDING_TITLE_SUBTITLE_OPTIONS) {
      expect(option.id).toContain('-');
      expect(option.text).not.toMatch(VISIBLE_DASH_PATTERN);
      expect(option.signalDeck.family).not.toMatch(VISIBLE_DASH_PATTERN);
      expect(option.signalDeck.descriptor).not.toMatch(VISIBLE_DASH_PATTERN);
    }
  });

  it('keeps subtitle design CSS free of visible dash primitives', () => {
    for (const fileName of LANDING_TITLE_CSS_MODULES) {
      const css = readFileSync(join(process.cwd(), 'components/landing-title', fileName), 'utf8');

      expect(css).not.toMatch(/\bdashed\b/);
      expect(css).not.toContain('repeating-linear-gradient');
      expect(css).not.toContain('hyphens: auto');
      expect(css).not.toContain('overflow-wrap: anywhere');
    }
  });
});
