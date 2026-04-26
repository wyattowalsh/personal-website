'use client';

import type { TargetAndTransition, Transition } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import type { CSSProperties, FocusEvent, ReactElement } from 'react';

import type { SignalDeckMeta } from '@/lib/landing-title-sequence';

export interface LandingTitleRendererContext {
  allowAnimatedEntrance: boolean;
  compact: boolean;
  isDark: boolean;
  prefersReducedMotion: boolean;
  shouldAnimateTagline: boolean;
  showName: boolean;
  surface: SubtitleSurface;
  wordIndex: number;
}

export interface SubtitleRendererShellProps {
  context: LandingTitleRendererContext;
  onBlur: (event: FocusEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  rotationStatusLabel: string;
}

export type SubtitleLane = 'systems' | 'arcane' | 'crafted' | 'performance';
export type SubtitleSurface = 'homepage' | 'audit';
export type SubtitleRenderMode = SubtitleSurface;

export interface SubtitleTheme {
  id: string;
  lane: SubtitleLane;
  text: string;
  signalDeck: SignalDeckMeta;
  gradient: string;
  darkGradient: string;
  glow: string;
  fontFamily: 'sans' | 'mono';
  fontWeight: number;
  letterSpacing: string;
  textTransform: 'uppercase' | 'lowercase' | 'none';
  fontStyle: 'italic' | 'normal';
  icon: LucideIcon;
  iconPosition: 'left' | 'right';
  iconClass: string;
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition: Transition;
}

export interface LandingTitleRendererEntry {
  readonly id: string;
  readonly lane: SubtitleLane;
  readonly render: (props: SubtitleRendererShellProps) => ReactElement;
  readonly signalDeck: SignalDeckMeta;
  readonly text: string;
  readonly theme: SubtitleTheme;
}

interface TypographyTheme {
  fontFamily: SubtitleTheme['fontFamily'];
  fontWeight: number;
  letterSpacing: string;
  textTransform: SubtitleTheme['textTransform'];
  fontStyle: SubtitleTheme['fontStyle'];
}

const anim = {
  blueprintFold: {
    initial: { opacity: 0, rotateY: -10, rotateX: 12, x: -10, y: 10 },
    animate: { opacity: 1, rotateY: 0, rotateX: 0, x: 0, y: 0 },
    exit: { opacity: 0, rotateY: 10, rotateX: -10, x: 10, y: -8 },
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } as Transition,
  },
  lockdownSweep: {
    initial: { opacity: 0, scaleX: 0.92, x: -10 },
    animate: { opacity: 1, scaleX: 1, x: 0 },
    exit: { opacity: 0, scaleX: 0.94, x: 8 },
    transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] } as Transition,
  },
  springOvershoot: {
    initial: { opacity: 0, y: 18, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -12, scale: 0.98 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } as Transition,
  },
  auroraBloom: {
    initial: { opacity: 0, y: 20, scale: 0.94 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -16, scale: 1.02 },
    transition: { duration: 0.46, ease: [0.25, 0.46, 0.45, 0.94] } as Transition,
  },
  cartographyTilt: {
    initial: { opacity: 0, rotateX: 12, rotateZ: -2, y: 16 },
    animate: { opacity: 1, rotateX: 0, rotateZ: 0, y: 0 },
    exit: { opacity: 0, rotateX: -8, rotateZ: 2, y: -12 },
    transition: { duration: 0.42, ease: [0.2, 0.8, 0.2, 1] } as Transition,
  },
  thunderExit: {
    initial: { opacity: 0, scale: 0.94, y: 18 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.03, y: -10 },
    transition: { duration: 0.36, ease: [0.33, 1, 0.68, 1] } as Transition,
  },
  dreamFloat: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.44, ease: [0.25, 0.46, 0.45, 0.94] } as Transition,
  },
} as const;

export function theme(
  identity: Pick<SubtitleTheme, 'id' | 'lane' | 'text' | 'signalDeck'>,
  colors: Pick<SubtitleTheme, 'gradient' | 'darkGradient' | 'glow'>,
  typoTheme: TypographyTheme,
  icon: LucideIcon,
  iconPosition: SubtitleTheme['iconPosition'],
  iconClass: string,
  animation: keyof typeof anim,
  _deprecatedEffectClass?: string,
  _deprecatedSurfaceTheme?: { border: string; shadow: string },
): SubtitleTheme {
  const motion = anim[animation];

  return {
    ...identity,
    ...colors,
    ...typoTheme,
    animate: motion.animate,
    exit: motion.exit,
    icon,
    iconClass,
    iconPosition,
    initial: motion.initial,
    transition: motion.transition,
  };
}

export const typo = {
  architect: {
    fontFamily: 'sans' as const,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    fontStyle: 'normal' as const,
  },
  architectBold: {
    fontFamily: 'sans' as const,
    fontWeight: 760,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    fontStyle: 'normal' as const,
  },
  architectNeural: {
    fontFamily: 'sans' as const,
    fontWeight: 620,
    letterSpacing: '0.045em',
    textTransform: 'none' as const,
    fontStyle: 'normal' as const,
  },
  designer: {
    fontFamily: 'sans' as const,
    fontWeight: 680,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    fontStyle: 'normal' as const,
  },
  mapper: {
    fontFamily: 'sans' as const,
    fontWeight: 560,
    letterSpacing: '0.075em',
    textTransform: 'none' as const,
    fontStyle: 'normal' as const,
  },
  mapperLight: {
    fontFamily: 'sans' as const,
    fontWeight: 520,
    letterSpacing: '0.09em',
    textTransform: 'uppercase' as const,
    fontStyle: 'normal' as const,
  },
  orchestrator: {
    fontFamily: 'sans' as const,
    fontWeight: 720,
    letterSpacing: '0.03em',
    textTransform: 'none' as const,
    fontStyle: 'normal' as const,
  },
  sorcerer: {
    fontFamily: 'sans' as const,
    fontWeight: 520,
    letterSpacing: '0.01em',
    textTransform: 'none' as const,
    fontStyle: 'normal' as const,
  },
  mage: {
    fontFamily: 'sans' as const,
    fontWeight: 560,
    letterSpacing: '0.04em',
    textTransform: 'none' as const,
    fontStyle: 'normal' as const,
  },
  visionaryItalic: {
    fontFamily: 'sans' as const,
    fontWeight: 420,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    fontStyle: 'italic' as const,
  },
  alchemist: {
    fontFamily: 'sans' as const,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    textTransform: 'none' as const,
    fontStyle: 'normal' as const,
  },
  sculptor: {
    fontFamily: 'sans' as const,
    fontWeight: 620,
    letterSpacing: '-0.02em',
    textTransform: 'none' as const,
    fontStyle: 'normal' as const,
  },
  sculptorMed: {
    fontFamily: 'sans' as const,
    fontWeight: 590,
    letterSpacing: '0.03em',
    textTransform: 'none' as const,
    fontStyle: 'normal' as const,
  },
  artisan: {
    fontFamily: 'sans' as const,
    fontWeight: 680,
    letterSpacing: '0.02em',
    textTransform: 'none' as const,
    fontStyle: 'normal' as const,
  },
  artisanBold: {
    fontFamily: 'sans' as const,
    fontWeight: 640,
    letterSpacing: '0.035em',
    textTransform: 'none' as const,
    fontStyle: 'normal' as const,
  },
  artisanMono: {
    fontFamily: 'mono' as const,
    fontWeight: 650,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    fontStyle: 'normal' as const,
  },
  crafter: {
    fontFamily: 'sans' as const,
    fontWeight: 620,
    letterSpacing: '0.04em',
    textTransform: 'none' as const,
    fontStyle: 'normal' as const,
  },
  virtuoso: {
    fontFamily: 'sans' as const,
    fontWeight: 720,
    letterSpacing: '0.03em',
    textTransform: 'none' as const,
    fontStyle: 'normal' as const,
  },
};

export function getTitleTextStyle(themeConfig: SubtitleTheme, isDark: boolean): CSSProperties {
  return {
    backgroundClip: 'text',
    backgroundImage: isDark ? themeConfig.darkGradient : themeConfig.gradient,
    color: 'transparent',
    fontFamily: themeConfig.fontFamily === 'mono'
      ? 'var(--font-monaspace), monospace'
      : 'var(--font-bricolage), sans-serif',
    fontStyle: themeConfig.fontStyle,
    fontWeight: themeConfig.fontWeight,
    letterSpacing: themeConfig.letterSpacing,
    hyphens: 'none',
    overflowWrap: 'break-word',
    textTransform: themeConfig.textTransform,
    textShadow: 'none',
    wordBreak: 'normal',
    WebkitBackgroundClip: 'text',
  };
}
