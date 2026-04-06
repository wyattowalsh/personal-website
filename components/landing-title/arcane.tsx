'use client';

import { AnimatePresence, motion, type Transition } from 'motion/react';
import {
  Cpu,
  Database,
  Factory,
  GitBranch,
  Lightbulb,
  Moon,
  Radar,
  Telescope,
  Workflow,
} from 'lucide-react';
import type { CSSProperties } from 'react';

import styles from './arcane.module.css';
import {
  ctr,
  fx,
  ic,
  theme,
  typo,
  type LandingTitleRendererEntry,
  type SubtitleRendererShellProps,
  type SubtitleTheme,
} from '@/components/landing-title/shared';
import type { SignalDeckMeta } from '@/lib/landing-title-sequence';
import { cn } from '@/lib/utils';

const arcaneSubtitle = (
  id: string,
  text: string,
  family: SignalDeckMeta['family'],
  descriptor: SignalDeckMeta['descriptor'],
) => ({
  id,
  lane: 'arcane' as const,
  text,
  signalDeck: { family, descriptor },
});

export const ARCANE_SORCERER_THEMES: SubtitleTheme[] = [
  theme(
    arcaneSubtitle('data-sorcerer', 'data sorcerer', 'Mystic', 'arcane computation'),
    {
      gradient: 'linear-gradient(90deg, #c084fc 0%, #8b5cf6 48%, #22d3ee 100%)',
      darkGradient: 'linear-gradient(90deg, #ddd6fe 0%, #c4b5fd 48%, #67e8f9 100%)',
      glow: 'rgba(139, 92, 246, 0.72)',
    },
    { ...typo.sorcerer, fontStyle: 'normal', letterSpacing: '0.08em', fontWeight: 470 },
    Database,
    'left',
    ic.pulse,
    'materialize',
    fx.aurora,
    ctr.mystic,
  ),
  theme(
    arcaneSubtitle('technological-conjurer', 'technological conjurer', 'Mystic', 'arcane computation'),
    {
      gradient: 'linear-gradient(120deg, #f0abfc 0%, #8b5cf6 42%, #38bdf8 100%)',
      darkGradient: 'linear-gradient(120deg, #f5d0fe 0%, #c4b5fd 42%, #7dd3fc 100%)',
      glow: 'rgba(192, 132, 252, 0.72)',
    },
    { ...typo.sorcerer, fontStyle: 'normal', letterSpacing: '0.11em', fontWeight: 500 },
    Cpu,
    'left',
    ic.cast,
    'weave',
    fx.holographic,
    ctr.mystic,
  ),
  theme(
    arcaneSubtitle('innovation-mystic', 'innovation mystic', 'Mystic', 'arcane computation'),
    {
      gradient: 'linear-gradient(90deg, #67e8f9 0%, #a78bfa 45%, #f472b6 100%)',
      darkGradient: 'linear-gradient(90deg, #a5f3fc 0%, #ddd6fe 45%, #f9a8d4 100%)',
      glow: 'rgba(96, 165, 250, 0.7)',
    },
    { ...typo.sorcerer, letterSpacing: '0.13em', fontWeight: 420 },
    Lightbulb,
    'right',
    ic.float,
    'auroraBloom',
    fx.holographic,
    ctr.mystic,
  ),
];

export const ARCANE_MAGE_THEMES: SubtitleTheme[] = [
  theme(
    arcaneSubtitle('workflow-mage', 'workflow mage', 'Weaver', 'procedural spellwork'),
    {
      gradient: 'linear-gradient(90deg, #818cf8 0%, #a78bfa 55%, #22d3ee 100%)',
      darkGradient: 'linear-gradient(90deg, #c7d2fe 0%, #ddd6fe 55%, #67e8f9 100%)',
      glow: 'rgba(129, 140, 248, 0.7)',
    },
    { ...typo.mage, letterSpacing: '0.08em', fontWeight: 560 },
    Workflow,
    'left',
    ic.conduct,
    'weave',
    fx.shimmer,
    ctr.mystic,
  ),
  theme(
    arcaneSubtitle('algorithm-weaver', 'algorithm weaver', 'Weaver', 'procedural spellwork'),
    {
      gradient: 'linear-gradient(90deg, #22d3ee 0%, #818cf8 40%, #c084fc 100%)',
      darkGradient: 'linear-gradient(90deg, #67e8f9 0%, #c7d2fe 40%, #ddd6fe 100%)',
      glow: 'rgba(59, 130, 246, 0.68)',
    },
    { ...typo.mage, letterSpacing: '0.07em', fontWeight: 540 },
    GitBranch,
    'left',
    ic.conduct,
    'weave',
    fx.matrix,
    ctr.mystic,
  ),
];

export const ARCANE_VISIONARY_THEMES: SubtitleTheme[] = [
  theme(
    arcaneSubtitle('platform-visionary', 'platform visionary', 'Visionary', 'long-horizon signal'),
    {
      gradient: 'linear-gradient(90deg, #22d3ee 0%, #38bdf8 48%, #818cf8 100%)',
      darkGradient: 'linear-gradient(90deg, #a5f3fc 0%, #7dd3fc 48%, #c7d2fe 100%)',
      glow: 'rgba(34, 211, 238, 0.68)',
    },
    { ...typo.visionary, fontStyle: 'normal', letterSpacing: '0.14em', fontWeight: 360 },
    Telescope,
    'right',
    ic.float,
    'auroraBloom',
    fx.float,
    ctr.visionaryHalo,
  ),
  theme(
    arcaneSubtitle('systems-dreamer', 'systems dreamer', 'Visionary', 'long-horizon signal'),
    {
      gradient: 'linear-gradient(90deg, #a78bfa 0%, #60a5fa 52%, #67e8f9 100%)',
      darkGradient: 'linear-gradient(90deg, #ddd6fe 0%, #bfdbfe 52%, #a5f3fc 100%)',
      glow: 'rgba(129, 140, 248, 0.66)',
    },
    { ...typo.visionaryItalic, letterSpacing: '0.12em', fontWeight: 380 },
    Moon,
    'right',
    ic.drift,
    'dreamFloat',
    fx.aurora,
    ctr.visionaryHalo,
  ),
  theme(
    arcaneSubtitle('digital-futurist', 'digital futurist', 'Visionary', 'long-horizon signal'),
    {
      gradient: 'linear-gradient(90deg, #67e8f9 0%, #3b82f6 42%, #a78bfa 100%)',
      darkGradient: 'linear-gradient(90deg, #a5f3fc 0%, #93c5fd 42%, #ddd6fe 100%)',
      glow: 'rgba(56, 189, 248, 0.7)',
    },
    { ...typo.visionary, letterSpacing: '0.16em', fontWeight: 340 },
    Radar,
    'right',
    ic.orbit,
    'drift',
    fx.neon,
    ctr.visionaryHalo,
  ),
  theme(
    arcaneSubtitle('enterprise-dreamer', 'enterprise dreamer', 'Visionary', 'long-horizon signal'),
    {
      gradient: 'linear-gradient(90deg, #7dd3fc 0%, #818cf8 46%, #c084fc 100%)',
      darkGradient: 'linear-gradient(90deg, #bae6fd 0%, #c7d2fe 46%, #e9d5ff 100%)',
      glow: 'rgba(129, 140, 248, 0.7)',
    },
    { ...typo.visionaryItalic, fontStyle: 'normal', letterSpacing: '0.12em', fontWeight: 430 },
    Factory,
    'right',
    ic.float,
    'dreamFloat',
    fx.shimmer,
    ctr.visionaryHalo,
  ),
];

export const ARCANE_SUBTITLE_THEMES: SubtitleTheme[] = [
  ...ARCANE_SORCERER_THEMES,
  ...ARCANE_MAGE_THEMES,
  ...ARCANE_VISIONARY_THEMES,
];


type ArcaneMotion =
  | 'ledger'
  | 'aperture'
  | 'lens'
  | 'workflow'
  | 'weave'
  | 'horizon'
  | 'dream'
  | 'pulse'
  | 'skyline';

interface ArcaneVariantConfig {
  readonly familyClass: string;
  readonly lineClass: string;
  readonly lines: readonly string[];
  readonly motion: ArcaneMotion;
  readonly panelTag: string;
  readonly shellClass: string;
  readonly titleClass?: string;
}

const VARIANT_CONFIG: Record<string, ArcaneVariantConfig> = {
  'data-sorcerer': {
    familyClass: styles.mysticDeck,
    lineClass: styles.dataSorcererLines,
    lines: ['data sorcerer'],
    motion: 'ledger',
    panelTag: 'reading table',
    shellClass: styles.dataSorcerer,
  },
  'technological-conjurer': {
    familyClass: styles.mysticDeck,
    lineClass: styles.conjurerLines,
    lines: ['technological', 'conjurer'],
    motion: 'aperture',
    panelTag: 'summoning aperture',
    shellClass: styles.technologicalConjurer,
  },
  'innovation-mystic': {
    familyClass: styles.mysticDeck,
    lineClass: styles.innovationMysticLines,
    lines: ['innovation', 'mystic'],
    motion: 'lens',
    panelTag: 'prophecy lens',
    shellClass: styles.innovationMystic,
  },
  'workflow-mage': {
    familyClass: styles.weaverDeck,
    lineClass: styles.workflowMageLines,
    lines: ['workflow mage'],
    motion: 'workflow',
    panelTag: 'ritual console',
    shellClass: styles.workflowMage,
  },
  'algorithm-weaver': {
    familyClass: styles.weaverDeck,
    lineClass: styles.algorithmWeaverLines,
    lines: ['algorithm', 'weaver'],
    motion: 'weave',
    panelTag: 'logic loom',
    shellClass: styles.algorithmWeaver,
  },
  'platform-visionary': {
    familyClass: styles.visionaryDeck,
    lineClass: styles.platformVisionaryLines,
    lines: ['platform visionary'],
    motion: 'horizon',
    panelTag: 'observation deck',
    shellClass: styles.platformVisionary,
  },
  'systems-dreamer': {
    familyClass: styles.visionaryDeck,
    lineClass: styles.systemsDreamerLines,
    lines: ['systems', 'dreamer'],
    motion: 'dream',
    panelTag: 'state horizon',
    shellClass: styles.systemsDreamer,
  },
  'digital-futurist': {
    familyClass: styles.visionaryDeck,
    lineClass: styles.digitalFuturistLines,
    lines: ['digital', 'futurist'],
    motion: 'pulse',
    panelTag: 'transmission panel',
    shellClass: styles.digitalFuturist,
  },
  'enterprise-dreamer': {
    familyClass: styles.visionaryDeck,
    lineClass: styles.enterpriseDreamerLines,
    lines: ['enterprise', 'dreamer'],
    motion: 'skyline',
    panelTag: 'strategic skyline',
    shellClass: styles.enterpriseDreamer,
  },
};

const SHELL_TRANSITIONS: Record<ArcaneMotion, Transition> = {
  aperture: { duration: 0.56, ease: [0.22, 1, 0.36, 1] },
  dream: { duration: 0.74, ease: [0.25, 0.46, 0.45, 0.94] },
  horizon: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  ledger: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  lens: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  pulse: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  skyline: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  weave: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  workflow: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
};

function withAlpha(color: string, alpha: number): string {
  return color.replace(/([\d.]+)\)\s*$/, `${alpha})`);
}

function splitDescriptor(descriptor: string): string[] {
  return descriptor.split(/\s+/).filter(Boolean);
}

function renderAnimatedLine(line: string, motionType: ArcaneMotion, lineIndex: number, animate: boolean) {
  if (!animate) {
    return <span className={styles.titleLineStatic}>{line}</span>;
  }

  switch (motionType) {
    case 'aperture': {
      const revealFromRight = lineIndex === 1;

      return (
        <motion.span
          className={styles.titleLineAnimated}
          initial={{
            clipPath: revealFromRight ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)',
            opacity: 0.35,
            x: revealFromRight ? 18 : -18,
            letterSpacing: '0.22em',
          }}
          animate={{ clipPath: 'inset(0 0 0 0)', opacity: 1, x: 0, letterSpacing: '0.14em' }}
          exit={{
            clipPath: revealFromRight ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',
            opacity: 0,
            x: revealFromRight ? -16 : 16,
          }}
          transition={{ duration: 0.44, delay: lineIndex * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          {line}
        </motion.span>
      );
    }
    case 'workflow':
      return (
        <motion.span
          className={styles.titleLineAnimated}
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
          transition={{ duration: 0.42, delay: lineIndex * 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          {line.split(' ').map((word, wordIndex) => (
            <motion.span
              key={`${word}-${wordIndex}`}
              className={styles.inlineWord}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, delay: 0.08 + wordIndex * 0.06 }}
            >
              {word}
            </motion.span>
          ))}
        </motion.span>
      );
    case 'weave':
      return (
        <motion.span
          className={styles.titleLineAnimated}
          initial={{ opacity: 0, x: lineIndex === 0 ? -20 : 20, rotateZ: lineIndex === 0 ? -2 : 2 }}
          animate={{ opacity: 1, x: 0, rotateZ: 0 }}
          exit={{ opacity: 0, x: lineIndex === 0 ? 18 : -18 }}
          transition={{ duration: 0.46, delay: lineIndex * 0.09, ease: [0.16, 1, 0.3, 1] }}
        >
          {line}
        </motion.span>
      );
    case 'horizon':
      return (
        <motion.span
          className={styles.titleLineAnimated}
          initial={{ opacity: 0, y: 18, scaleX: 0.94 }}
          animate={{ opacity: 1, y: 0, scaleX: 1 }}
          exit={{ opacity: 0, y: -18, scaleX: 1.02 }}
          transition={{ duration: 0.52, delay: lineIndex * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          {line}
        </motion.span>
      );
    case 'dream':
      return (
        <motion.span
          className={styles.titleLineAnimated}
          initial={{ opacity: 0, y: 16, rotateX: 18 }}
          animate={{ opacity: 1, y: [0, -2, 0], rotateX: 0 }}
          exit={{ opacity: 0, y: -16, rotateX: -10 }}
          transition={{ duration: 0.68, delay: lineIndex * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {line}
        </motion.span>
      );
    case 'pulse':
      return (
        <motion.span
          className={styles.titleLineAnimated}
          initial={{ opacity: 0, scale: 0.92, letterSpacing: '0.24em' }}
          animate={{ opacity: 1, scale: [1.04, 0.99, 1], letterSpacing: '0.16em' }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.5, delay: lineIndex * 0.07, ease: [0.22, 1, 0.36, 1] }}
        >
          {line}
        </motion.span>
      );
    case 'skyline':
      return (
        <motion.span
          className={styles.titleLineAnimated}
          initial={{ opacity: 0, y: 18, scaleY: 0.8, transformOrigin: 'bottom center' }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: -14, scaleY: 1.08 }}
          transition={{ duration: 0.5, delay: lineIndex * 0.07, ease: [0.22, 1, 0.36, 1] }}
        >
          {line}
        </motion.span>
      );
    case 'lens':
      return (
        <motion.span
          className={styles.titleLineAnimated}
          initial={{ opacity: 0, y: 12, scale: 0.96, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: [0, -1, 0], scale: [1.05, 0.99, 1], filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
          transition={{ duration: 0.64, delay: lineIndex * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {line}
        </motion.span>
      );
    case 'ledger':
    default:
      return (
        <motion.span
          className={styles.titleLineAnimated}
          initial={{ opacity: 0, x: -14, filter: 'blur(4px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 14, filter: 'blur(4px)' }}
          transition={{ duration: 0.38, delay: lineIndex * 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          {line}
        </motion.span>
      );
  }
}

interface ArcaneSubtitleRendererProps extends SubtitleRendererShellProps {
  readonly theme: SubtitleTheme;
}

function ArcaneSubtitleRenderer({
  context,
  hideSignalDeck,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  positionLabel,
  rotationStatusLabel,
  theme,
  totalLabel,
}: ArcaneSubtitleRendererProps) {
  const config = VARIANT_CONFIG[theme.id];
  const descriptorTokens = splitDescriptor(theme.signalDeck.descriptor);
  const Icon = theme.icon;
  const shouldAnimate = context.shouldAnimateTagline && !context.prefersReducedMotion;
  const compact = context.compact || !context.showName;
  const titleStyle = {
    '--arcane-gradient': context.isDark ? theme.darkGradient : theme.gradient,
    '--arcane-glow': theme.glow,
    '--arcane-glow-soft': withAlpha(theme.glow, context.isDark ? 0.24 : 0.14),
    '--arcane-glow-strong': withAlpha(theme.glow, context.isDark ? 0.56 : 0.3),
    '--arcane-surface': context.isDark ? 'rgba(7, 12, 28, 0.88)' : 'rgba(255, 255, 255, 0.82)',
    '--arcane-surface-strong': context.isDark ? 'rgba(17, 24, 45, 0.9)' : 'rgba(241, 245, 249, 0.9)',
    '--arcane-shell-shadow': context.isDark
      ? `0 20px 48px ${withAlpha(theme.glow, 0.18)}`
      : `0 14px 32px ${withAlpha(theme.glow, 0.1)}`,
  } as CSSProperties;

  const titleBlock = (
    <div className={cn(styles.titleStack, config.lineClass, config.titleClass)}>
      {config.lines.map((line, lineIndex) => (
        <span key={`${theme.id}-${line}`} className={styles.titleLine}>
          {renderAnimatedLine(line, config.motion, lineIndex, shouldAnimate)}
        </span>
      ))}
    </div>
  );

  const iconNode = (
    <motion.span
      className={styles.iconCore}
      initial={shouldAnimate ? { opacity: 0, scale: 0.72, rotate: -10 } : undefined}
      animate={shouldAnimate ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
      exit={shouldAnimate ? { opacity: 0, scale: 0.8, rotate: 8 } : undefined}
      transition={shouldAnimate ? { duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] } : undefined}
    >
      <Icon className={cn(styles.iconSvg, theme.iconClass)} aria-hidden="true" />
    </motion.span>
  );

  return (
    <div
      className={cn(styles.root, compact && styles.compactRoot)}
      data-motion-mode={context.prefersReducedMotion ? 'reduced' : 'animated'}
      onMouseEnter={!context.prefersReducedMotion ? onMouseEnter : undefined}
      onMouseLeave={!context.prefersReducedMotion ? onMouseLeave : undefined}
      style={titleStyle}
    >
      {!hideSignalDeck ? (
        <div className={cn(styles.signalDeck, config.familyClass)} aria-hidden="true">
          <span className={styles.deckFamily}>{theme.signalDeck.family}</span>
          <span className={styles.deckDescriptor}>{theme.signalDeck.descriptor}</span>
          <span className={styles.deckCounter}>
            {positionLabel}
            <span className={styles.deckCounterTotal}>/ {totalLabel}</span>
          </span>
        </div>
      ) : null}

      <div
        tabIndex={0}
        role="group"
        aria-label={`${theme.text}. ${theme.signalDeck.family} family, ${theme.signalDeck.descriptor}. ${rotationStatusLabel}`}
        className={styles.focusFrame}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <AnimatePresence mode="wait">
          <motion.section
            key={theme.id}
            className={cn(styles.shell, config.shellClass, compact && styles.compactShell)}
            initial={shouldAnimate ? { opacity: 0, y: 18, scale: 0.96 } : undefined}
            animate={shouldAnimate ? { opacity: 1, y: 0, scale: 1 } : undefined}
            exit={shouldAnimate ? { opacity: 0, y: -18, scale: 0.98 } : undefined}
            transition={SHELL_TRANSITIONS[config.motion]}
          >
            <span className={styles.shellGlow} aria-hidden="true" />
            <span className={styles.shellOrnament} aria-hidden="true" />

            <div className={styles.panelHeader}>
              <span className={styles.panelIndex}>{positionLabel}</span>
              <span className={styles.panelTag}>{config.panelTag}</span>
              <span className={styles.panelFamily}>{theme.signalDeck.family}</span>
            </div>

            <div className={styles.titleStage}>
              {iconNode}
              {titleBlock}
            </div>

            <div className={styles.descriptorTrack} aria-hidden="true">
              {descriptorTokens.map((token) => (
                <span key={`${theme.id}-${token}`} className={styles.descriptorToken}>
                  {token}
                </span>
              ))}
            </div>
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}

function createArcaneRenderer(theme: SubtitleTheme): LandingTitleRendererEntry {
  return {
    id: theme.id,
    lane: theme.lane,
    render: (props) => <ArcaneSubtitleRenderer {...props} theme={theme} />,
    signalDeck: theme.signalDeck,
    text: theme.text,
    theme,
  };
}

export const ARCANE_SORCERER_RENDERERS: readonly LandingTitleRendererEntry[] = ARCANE_SORCERER_THEMES.map(createArcaneRenderer);
export const ARCANE_MAGE_RENDERERS: readonly LandingTitleRendererEntry[] = ARCANE_MAGE_THEMES.map(createArcaneRenderer);
export const ARCANE_VISIONARY_RENDERERS: readonly LandingTitleRendererEntry[] = ARCANE_VISIONARY_THEMES.map(createArcaneRenderer);
export const ARCANE_RENDERERS: readonly LandingTitleRendererEntry[] = [
  ...ARCANE_SORCERER_RENDERERS,
  ...ARCANE_MAGE_RENDERERS,
  ...ARCANE_VISIONARY_RENDERERS,
];
