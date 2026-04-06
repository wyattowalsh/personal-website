'use client';

import { AnimatePresence, motion, type Transition } from 'motion/react';
import { Bot, BrainCircuit, Gauge, Zap } from 'lucide-react';
import type { CSSProperties, ReactElement } from 'react';

import performanceStyles from './performance.module.css';
import subtitleStyles from './subtitle.module.css';
import {
  ctr,
  ic,
  theme,
  typo,
  type LandingTitleRendererEntry,
  type SubtitleRendererShellProps,
  type SubtitleTheme,
} from '@/components/landing-title/shared';
import type { SignalDeckMeta } from '@/lib/landing-title-sequence';
import { cn } from '@/lib/utils';

type PerformanceVariant = 'automation' | 'robotics' | 'intelligent' | 'scalability';

interface PerformanceRendererConfig {
  variant: PerformanceVariant;
  metrics: readonly string[];
  deckLabel: string;
  shellTransition: Transition;
  shellInitial: Record<string, number | string>;
  shellAnimate: Record<string, number | string | number[]>;
  shellExit: Record<string, number | string | number[]>;
}

const performanceSubtitle = (
  id: string,
  text: string,
  family: SignalDeckMeta['family'],
  descriptor: SignalDeckMeta['descriptor'],
) => ({
  id,
  lane: 'performance' as const,
  text,
  signalDeck: { family, descriptor },
});

const AUTOMATION_THEME = theme(
  performanceSubtitle('automation-virtuoso', 'automation virtuoso', 'Virtuoso', 'performance energy'),
  {
    gradient: 'linear-gradient(135deg, #fef08a 0%, #fb923c 38%, #ef4444 100%)',
    darkGradient: 'linear-gradient(135deg, #fde68a 0%, #fdba74 40%, #fb7185 100%)',
    glow: 'rgba(249, 115, 22, 0.62)',
  },
  typo.virtuoso,
  Zap,
  'left',
  ic.zap,
  'thunderExit',
  '',
  ctr.virtuosoShell,
  'standard',
);

const ROBOTICS_THEME = theme(
  performanceSubtitle('robotics-artist', 'robotics artist', 'Virtuoso', 'performance energy'),
  {
    gradient: 'linear-gradient(135deg, #93c5fd 0%, #a78bfa 36%, #f472b6 100%)',
    darkGradient: 'linear-gradient(135deg, #bfdbfe 0%, #c4b5fd 36%, #f9a8d4 100%)',
    glow: 'rgba(168, 85, 247, 0.56)',
  },
  { ...typo.virtuosoBold, letterSpacing: '0.045em', textTransform: 'uppercase' },
  Bot,
  'left',
  ic.pulse,
  'blueprintFold',
  '',
  ctr.virtuosoShell,
  'standard',
);

const INTELLIGENT_THEME = theme(
  performanceSubtitle('intelligent-systems-artist', 'intelligent systems artist', 'Virtuoso', 'performance energy'),
  {
    gradient: 'linear-gradient(135deg, #c4b5fd 0%, #f472b6 42%, #67e8f9 100%)',
    darkGradient: 'linear-gradient(135deg, #ddd6fe 0%, #f9a8d4 44%, #a5f3fc 100%)',
    glow: 'rgba(217, 70, 239, 0.46)',
  },
  { ...typo.virtuosoBold, letterSpacing: '0.02em' },
  BrainCircuit,
  'left',
  ic.orbit,
  'auroraBloom',
  '',
  ctr.virtuosoShell,
  'standard',
);

const SCALABILITY_THEME = theme(
  performanceSubtitle('scalability-artist', 'scalability artist', 'Virtuoso', 'performance energy'),
  {
    gradient: 'linear-gradient(135deg, #f9a8d4 0%, #c084fc 35%, #38bdf8 100%)',
    darkGradient: 'linear-gradient(135deg, #fbcfe8 0%, #d8b4fe 38%, #7dd3fc 100%)',
    glow: 'rgba(56, 189, 248, 0.54)',
  },
  { ...typo.virtuoso, letterSpacing: '0.01em' },
  Gauge,
  'left',
  ic.none,
  'cartographyTilt',
  '',
  ctr.virtuosoShell,
  'standard',
);

export const PERFORMANCE_SHOWCASE_THEMES: SubtitleTheme[] = [
  AUTOMATION_THEME,
  ROBOTICS_THEME,
  INTELLIGENT_THEME,
  SCALABILITY_THEME,
];

export const PERFORMANCE_SUBTITLE_THEMES: SubtitleTheme[] = [
  ...PERFORMANCE_SHOWCASE_THEMES,
];

const PERFORMANCE_RENDERER_CONFIG: Record<PerformanceVariant, PerformanceRendererConfig> = {
  automation: {
    variant: 'automation',
    metrics: ['queue depth 12', 'cue sync 18ms', 'handoff live'],
    deckLabel: 'sequencer rig',
    shellInitial: { opacity: 0, y: 22, scale: 0.94 },
    shellAnimate: { opacity: 1, y: 0, scale: 1 },
    shellExit: { opacity: 0, y: -18, scale: 1.02 },
    shellTransition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
  },
  robotics: {
    variant: 'robotics',
    metrics: ['servo settle 32ms', 'actuators x12', 'dock ready'],
    deckLabel: 'diagnostic dock',
    shellInitial: { opacity: 0, rotateX: 28, y: 20 },
    shellAnimate: { opacity: 1, rotateX: 0, y: 0 },
    shellExit: { opacity: 0, rotateX: -18, y: -18 },
    shellTransition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  intelligent: {
    variant: 'intelligent',
    metrics: ['router 97%', 'memory warm', 'ensemble aligned'],
    deckLabel: 'systems score',
    shellInitial: { opacity: 0, scale: 0.96, y: 18 },
    shellAnimate: { opacity: 1, scale: 1, y: 0 },
    shellExit: { opacity: 0, scale: 1.02, y: -14 },
    shellTransition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
  scalability: {
    variant: 'scalability',
    metrics: ['burst 240%', 'regions x8', 'latency flat'],
    deckLabel: 'capacity ledger',
    shellInitial: { opacity: 0, scaleX: 0.9, y: 18 },
    shellAnimate: { opacity: 1, scaleX: 1, y: 0 },
    shellExit: { opacity: 0, scaleX: 1.03, y: -12 },
    shellTransition: { duration: 0.46, ease: [0.16, 1, 0.3, 1] },
  },
};

const PERFORMANCE_VARIANT_CLASSES: Record<PerformanceVariant, { shell: string; deck: string }> = {
  automation: {
    shell: performanceStyles.shellAutomation,
    deck: performanceStyles.deckAutomation,
  },
  robotics: {
    shell: performanceStyles.shellRobotics,
    deck: performanceStyles.deckRobotics,
  },
  intelligent: {
    shell: performanceStyles.shellIntelligent,
    deck: performanceStyles.deckIntelligent,
  },
  scalability: {
    shell: performanceStyles.shellScalability,
    deck: performanceStyles.deckScalability,
  },
};

function withAlpha(color: string, alpha: number): string {
  return color.replace(/[\d.]+\)\s*$/, `${alpha})`);
}

function getSignalStyle(themeConfig: SubtitleTheme, isDark: boolean): CSSProperties {
  return {
    '--perf-shell-edge': withAlpha(themeConfig.glow, isDark ? 0.34 : 0.2),
    '--perf-shell-soft': withAlpha(themeConfig.glow, isDark ? 0.2 : 0.12),
    '--perf-shell-strong': withAlpha(themeConfig.glow, isDark ? 0.46 : 0.24),
    '--perf-panel': isDark ? 'rgba(9, 13, 28, 0.88)' : 'rgba(255, 255, 255, 0.86)',
    '--perf-panel-2': isDark ? 'rgba(18, 28, 54, 0.78)' : 'rgba(241, 245, 249, 0.92)',
    '--perf-panel-3': isDark ? 'rgba(30, 41, 68, 0.52)' : 'rgba(226, 232, 240, 0.72)',
    '--perf-text': isDark ? 'rgba(248, 250, 252, 0.98)' : 'rgba(15, 23, 42, 0.95)',
    '--perf-muted': isDark ? 'rgba(148, 163, 184, 0.84)' : 'rgba(71, 85, 105, 0.76)',
    '--perf-gradient': isDark ? themeConfig.darkGradient : themeConfig.gradient,
    '--perf-shell-shadow': isDark
      ? `0 20px 56px ${withAlpha(themeConfig.glow, 0.2)}`
      : `0 18px 48px ${withAlpha(themeConfig.glow, 0.16)}`,
    '--subtitle-shell-edge': withAlpha(themeConfig.glow, isDark ? 0.3 : 0.18),
    '--subtitle-shell-glow-soft': withAlpha(themeConfig.glow, isDark ? 0.22 : 0.12),
    '--subtitle-shell-glow-strong': withAlpha(themeConfig.glow, isDark ? 0.42 : 0.2),
  } as CSSProperties;
}

function getHeadlineStyle(themeConfig: SubtitleTheme, isDark: boolean): CSSProperties {
  return {
    backgroundImage: isDark ? themeConfig.darkGradient : themeConfig.gradient,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    textShadow: `0 0 ${isDark ? 18 : 12}px ${withAlpha(themeConfig.glow, isDark ? 0.32 : 0.18)}`,
  };
}

function PerformanceIcon({ themeConfig, animated, className }: { themeConfig: SubtitleTheme; animated: boolean; className?: string }) {
  const Icon = themeConfig.icon;
  const iconNode = (
    <span className={cn(performanceStyles.iconFrame, className)}>
      <Icon
        className={performanceStyles.iconGlyph}
        aria-hidden="true"
        style={{ color: 'var(--perf-text)', filter: `drop-shadow(0 0 14px ${themeConfig.glow})` }}
      />
    </span>
  );

  if (!animated) {
    return iconNode;
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.86, rotate: 6 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
    >
      {iconNode}
    </motion.span>
  );
}

function renderDecorativeNodes(count: number, className?: string) {
  return Array.from({ length: count }, (_, index) => (
    <span key={`${className ?? 'node'}-${index}`} className={cn(performanceStyles.utilityNode, className)} />
  ));
}

function renderAutomationLayout(themeConfig: SubtitleTheme, animated: boolean, headlineStyle: CSSProperties) {
  return (
    <div className={performanceStyles.automationGrid}>
      <div className={performanceStyles.flowRow} aria-hidden="true">
        {['trigger', 'route', 'handoff'].map((label, index) => (
          animated ? (
            <motion.span
              key={label}
              className={performanceStyles.flowStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, delay: index * 0.06, ease: 'easeOut' }}
            >
              {label}
            </motion.span>
          ) : (
            <span key={label} className={performanceStyles.flowStep}>{label}</span>
          )
        ))}
      </div>
      <div className={performanceStyles.heroBand}>
        <PerformanceIcon themeConfig={themeConfig} animated={animated} />
        <div className={performanceStyles.copyBlock}>
          <span className={performanceStyles.overline}>sequencer live</span>
          <span className={performanceStyles.primaryLine} style={headlineStyle}>automation</span>
          <span className={performanceStyles.roleChip}>virtuoso</span>
        </div>
      </div>
      <div className={performanceStyles.utilityBarRow} aria-hidden="true">
        {['queued', 'executing', 'clear'].map((label, index) => (
          <span key={label} className={performanceStyles.utilityBarWrap}>
            <span className={performanceStyles.utilityBarLabel}>{label}</span>
            {animated ? (
              <motion.span
                className={performanceStyles.utilityBar}
                initial={{ scaleX: 0.35, opacity: 0.5 }}
                animate={{ scaleX: [0.5, 1, 0.78], opacity: 1 }}
                exit={{ scaleX: 0.4, opacity: 0 }}
                transition={{ duration: 0.8, delay: index * 0.08, repeat: Infinity, repeatType: 'mirror' }}
              />
            ) : (
              <span className={performanceStyles.utilityBar} />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function renderRoboticsLayout(themeConfig: SubtitleTheme, animated: boolean, headlineStyle: CSSProperties) {
  return (
    <div className={performanceStyles.roboticsGrid}>
      <div className={performanceStyles.roboticsBracket} aria-hidden="true">
        {renderDecorativeNodes(3)}
      </div>
      <div className={performanceStyles.roboticsCore}>
        <span className={performanceStyles.overline}>assembly dock</span>
        <div className={performanceStyles.roboticsHeadline}>
          <PerformanceIcon themeConfig={themeConfig} animated={animated} className={performanceStyles.iconFrameLarge} />
          <div className={performanceStyles.copyBlock}>
            <span className={performanceStyles.primaryLine} style={headlineStyle}>robotics</span>
            <span className={performanceStyles.secondaryLine}>artist</span>
          </div>
        </div>
      </div>
      <div className={performanceStyles.servoStack} aria-hidden="true">
        {renderDecorativeNodes(3, performanceStyles.utilityNodeSquare)}
        <span className={performanceStyles.utilityBeam} />
      </div>
    </div>
  );
}

function renderIntelligentLayout(themeConfig: SubtitleTheme, animated: boolean, headlineStyle: CSSProperties) {
  return (
    <div className={performanceStyles.intelligentGrid}>
      <div className={performanceStyles.systemBand}>
        <PerformanceIcon themeConfig={themeConfig} animated={animated} />
        <div className={performanceStyles.copyBlock}>
          <span className={performanceStyles.overline}>cognitive score</span>
          <span className={performanceStyles.systemLine} style={headlineStyle}>intelligent systems</span>
        </div>
      </div>
      <div className={performanceStyles.artistBand}>
        <span className={performanceStyles.artistWord}>artist</span>
        <div className={performanceStyles.utilityMatrix} aria-hidden="true">
          {renderDecorativeNodes(6)}
        </div>
      </div>
    </div>
  );
}

function renderScalabilityLayout(themeConfig: SubtitleTheme, animated: boolean, headlineStyle: CSSProperties) {
  return (
    <div className={performanceStyles.scalabilityGrid}>
      <div className={performanceStyles.fanoutRow} aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={`fan-${index}`} className={performanceStyles.fanoutNode}>
            {animated ? (
              <motion.span
                className={performanceStyles.fanoutStem}
                initial={{ scaleY: 0.2, opacity: 0.4 }}
                animate={{ scaleY: [0.4, 1, 0.66], opacity: 1 }}
                exit={{ scaleY: 0.3, opacity: 0 }}
                transition={{ duration: 1, delay: index * 0.07, repeat: Infinity, repeatType: 'mirror' }}
              />
            ) : (
              <span className={performanceStyles.fanoutStem} />
            )}
          </span>
        ))}
      </div>
      <div className={performanceStyles.scalabilityCore}>
        <PerformanceIcon themeConfig={themeConfig} animated={animated} className={performanceStyles.iconFrameLarge} />
        <div className={performanceStyles.copyBlock}>
          <span className={performanceStyles.overline}>elastic capacity</span>
          <span className={performanceStyles.primaryLine} style={headlineStyle}>scalability</span>
          <span className={performanceStyles.roleChip}>artist</span>
        </div>
      </div>
      <div className={performanceStyles.capacityRow} aria-hidden="true">
        {[0.55, 0.82, 1].map((width, index) => (
          animated ? (
            <motion.span
              key={`capacity-${width}`}
              className={performanceStyles.capacityBar}
              initial={{ scaleX: 0.35, opacity: 0.45 }}
              animate={{ scaleX: [width * 0.7, width, width * 0.86], opacity: 1 }}
              exit={{ scaleX: 0.3, opacity: 0 }}
              transition={{ duration: 0.92, delay: index * 0.08, repeat: Infinity, repeatType: 'mirror' }}
              style={{ ['--capacity-target' as const]: width } as CSSProperties}
            />
          ) : (
            <span
              key={`capacity-${width}`}
              className={performanceStyles.capacityBar}
              style={{ ['--capacity-target' as const]: width } as CSSProperties}
            />
          )
        ))}
      </div>
    </div>
  );
}

function renderVariantLayout(variant: PerformanceVariant, themeConfig: SubtitleTheme, animated: boolean, headlineStyle: CSSProperties) {
  switch (variant) {
    case 'automation':
      return renderAutomationLayout(themeConfig, animated, headlineStyle);
    case 'robotics':
      return renderRoboticsLayout(themeConfig, animated, headlineStyle);
    case 'intelligent':
      return renderIntelligentLayout(themeConfig, animated, headlineStyle);
    case 'scalability':
      return renderScalabilityLayout(themeConfig, animated, headlineStyle);
    default:
      return null;
  }
}

function PerformanceSubtitleRenderer({
  themeConfig,
  config,
  context,
  hideSignalDeck,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  positionLabel,
  rotationStatusLabel,
  totalLabel,
}: SubtitleRendererShellProps & { themeConfig: SubtitleTheme; config: PerformanceRendererConfig }) {
  const { compact, isDark, prefersReducedMotion, shouldAnimateTagline, showName } = context;
  const animated = shouldAnimateTagline && !prefersReducedMotion;
  const sharedStyle = getSignalStyle(themeConfig, isDark);
  const headlineStyle = getHeadlineStyle(themeConfig, isDark);
  const shell = renderVariantLayout(config.variant, themeConfig, animated, headlineStyle);
  const variantClasses = PERFORMANCE_VARIANT_CLASSES[config.variant];

  const shellNode = (
    <div
      aria-hidden="true"
      className={cn(
        performanceStyles.shell,
        variantClasses.shell,
      )}
      style={sharedStyle}
    >
      <span className={performanceStyles.shellBackdrop} />
      <span className={performanceStyles.shellGlow} />
      <div className={performanceStyles.shellInner}>{shell}</div>
    </div>
  );

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col items-center',
        showName
          ? 'mt-2 max-w-[85vw] gap-2 sm:mt-3 sm:max-w-2xl lg:max-w-[44rem] xl:max-w-[46rem]'
          : compact
            ? 'mt-0 max-w-full gap-1.5'
            : 'mt-0 max-w-[85vw] gap-2 sm:max-w-2xl lg:max-w-[44rem]',
        performanceStyles.cluster,
        animated ? performanceStyles.motionActive : performanceStyles.motionReduced,
      )}
      data-performance-variant={config.variant}
      onMouseEnter={animated ? onMouseEnter : undefined}
      onMouseLeave={animated ? onMouseLeave : undefined}
      style={sharedStyle}
    >
      {!hideSignalDeck ? (
        <div className={cn(performanceStyles.deck, variantClasses.deck)} aria-hidden="true">
          <div className={performanceStyles.deckLeading}>
            <span className={performanceStyles.deckBadge}>
              <span className={performanceStyles.deckBadgeSwatch} />
              {themeConfig.signalDeck.family}
            </span>
            <span className={performanceStyles.deckQualifier}>{config.deckLabel}</span>
          </div>
          <div className={performanceStyles.deckMeta}>
            <span className={performanceStyles.deckDescriptor}>{themeConfig.signalDeck.descriptor}</span>
            <div className={performanceStyles.metricRow}>
              {config.metrics.map((metric) => (
                <span key={metric} className={performanceStyles.metricChip}>{metric}</span>
              ))}
            </div>
          </div>
          <span className={performanceStyles.counter}>
            {positionLabel}
            <span className={performanceStyles.counterTotal}>/ {totalLabel}</span>
          </span>
        </div>
      ) : null}

      <div
        tabIndex={0}
        role="group"
        aria-label={`${themeConfig.text}. ${themeConfig.signalDeck.family} family, ${themeConfig.signalDeck.descriptor}. ${rotationStatusLabel}`}
        className={cn('w-full', subtitleStyles.subtitleBorderGlow, subtitleStyles.subtitleControl, performanceStyles.control)}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {!animated ? (
          shellNode
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={themeConfig.id}
              initial={config.shellInitial}
              animate={config.shellAnimate}
              exit={config.shellExit}
              transition={config.shellTransition}
            >
              {shellNode}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function createPerformanceRenderer(themeConfig: SubtitleTheme, config: PerformanceRendererConfig): LandingTitleRendererEntry {
  const signalDeck = themeConfig.signalDeck;

  return {
    id: themeConfig.id,
    lane: themeConfig.lane,
    render: (props): ReactElement => (
      <PerformanceSubtitleRenderer {...props} config={config} themeConfig={themeConfig} />
    ),
    signalDeck,
    text: themeConfig.text,
    theme: themeConfig,
  };
}

export const PERFORMANCE_SHOWCASE_RENDERERS: readonly LandingTitleRendererEntry[] = [
  createPerformanceRenderer(AUTOMATION_THEME, PERFORMANCE_RENDERER_CONFIG.automation),
  createPerformanceRenderer(ROBOTICS_THEME, PERFORMANCE_RENDERER_CONFIG.robotics),
  createPerformanceRenderer(INTELLIGENT_THEME, PERFORMANCE_RENDERER_CONFIG.intelligent),
  createPerformanceRenderer(SCALABILITY_THEME, PERFORMANCE_RENDERER_CONFIG.scalability),
];

export const PERFORMANCE_SUBTITLE_RENDERERS: readonly LandingTitleRendererEntry[] = [
  ...PERFORMANCE_SHOWCASE_RENDERERS,
];
