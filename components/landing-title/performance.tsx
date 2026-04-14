'use client';

import { motion } from 'motion/react';
import { Bot, BrainCircuit, Zap } from 'lucide-react';
import type { CSSProperties } from 'react';

import styles from './performance.module.css';
import {
  theme,
  typo,
  type LandingTitleRendererEntry,
  type SubtitleRendererShellProps,
  type SubtitleTheme,
} from '@/components/landing-title/shared';
import type { SignalDeckMeta } from '@/lib/landing-title-sequence';
import { cn } from '@/lib/utils';

type PerformanceScene = 'automation' | 'robotics' | 'neural';

interface PerformanceVariantConfig {
  readonly scene: PerformanceScene;
  readonly theme: SubtitleTheme;
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

// ─── Automation Virtuoso ─────────────────────────────────────────────────────
// Warm amber/orange — stage VU-meter / timing-dial metaphor
const AUTOMATION_THEME = theme(
  performanceSubtitle('automation-virtuoso', 'automation virtuoso', 'Virtuoso', 'timed systems cadence'),
  {
    gradient: 'linear-gradient(135deg, #fde68a 0%, #fb923c 40%, #ef4444 100%)',
    darkGradient: 'linear-gradient(135deg, #fef3c7 0%, #fdba74 44%, #fb7185 100%)',
    glow: 'rgba(249, 115, 22, 0.64)',
  },
  typo.virtuoso,
  Zap,
  'left',
  '',
  'thunderExit',
  '',
  { border: '1px solid rgba(249, 115, 22, 0.24)', shadow: '0 22px 54px rgba(249, 115, 22, 0.18)' },
);

// ─── Kinetic Machinist ────────────────────────────────────────────────────────
// Cool industrial steel → brushed white — articulated crane / stage rigging
const KINETIC_MACHINIST_THEME = theme(
  performanceSubtitle('kinetic-machinist', 'kinetic machinist', 'Machinist', 'articulated precision'),
  {
    gradient: 'linear-gradient(135deg, #475569 0%, #64748b 40%, #94a3b8 100%)',
    darkGradient: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 42%, #f1f5f9 100%)',
    glow: 'rgba(148, 163, 184, 0.52)',
  },
  typo.artisanMono,
  Bot,
  'left',
  '',
  'blueprintFold',
  '',
  { border: '1px solid rgba(148, 163, 184, 0.24)', shadow: '0 22px 54px rgba(148, 163, 184, 0.18)' },
);

// ─── Cortex Diviner ───────────────────────────────────────────────────────────
// Hot fuchsia → magenta → rose — synaptic bloom / radiant pulses
const CORTEX_DIVINER_THEME = theme(
  performanceSubtitle('cortex-diviner', 'cortex diviner', 'Diviner', 'synaptic divination'),
  {
    gradient: 'linear-gradient(135deg, #d946ef 0%, #ec4899 44%, #fb7185 100%)',
    darkGradient: 'linear-gradient(135deg, #e879f9 0%, #f9a8d4 46%, #fda4af 100%)',
    glow: 'rgba(217, 70, 239, 0.50)',
  },
  typo.visionaryItalic,
  BrainCircuit,
  'left',
  '',
  'auroraBloom',
  '',
  { border: '1px solid rgba(217, 70, 239, 0.22)', shadow: '0 22px 54px rgba(217, 70, 239, 0.16)' },
);

export const PERFORMANCE_SHOWCASE_THEMES: SubtitleTheme[] = [
  AUTOMATION_THEME,
  KINETIC_MACHINIST_THEME,
  CORTEX_DIVINER_THEME,
];

export const PERFORMANCE_SUBTITLE_THEMES: SubtitleTheme[] = [
  ...PERFORMANCE_SHOWCASE_THEMES,
];

const PERFORMANCE_VARIANTS: readonly PerformanceVariantConfig[] = [
  {
    scene: 'automation',
    theme: AUTOMATION_THEME,
  },
  {
    scene: 'robotics',
    theme: KINETIC_MACHINIST_THEME,
  },
  {
    scene: 'neural',
    theme: CORTEX_DIVINER_THEME,
  },
];

function withAlpha(color: string, alpha: number): string {
  return color.replace(/[\d.]+\)\s*$/, `${alpha})`);
}

function getSceneVars(themeConfig: SubtitleTheme, isDark: boolean): CSSProperties {
  return {
    '--perf-glow': themeConfig.glow,
    '--perf-glow-soft': withAlpha(themeConfig.glow, isDark ? 0.18 : 0.15),
    '--perf-glow-strong': withAlpha(themeConfig.glow, isDark ? 0.4 : 0.34),
    '--perf-edge': withAlpha(themeConfig.glow, isDark ? 0.32 : 0.26),
    '--perf-panel': isDark ? 'rgba(7, 12, 28, 0.88)' : 'rgba(255, 255, 255, 0.9)',
    '--perf-panel-2': isDark ? 'rgba(16, 22, 44, 0.8)' : 'rgba(240, 245, 252, 0.94)',
    '--perf-panel-3': isDark ? 'rgba(23, 33, 58, 0.62)' : 'rgba(225, 233, 246, 0.78)',
    '--perf-text': isDark ? 'rgba(248, 250, 252, 0.98)' : 'rgba(15, 23, 42, 0.94)',
    '--perf-muted': isDark ? 'rgba(148, 163, 184, 0.84)' : 'rgba(51, 65, 85, 0.88)',
    '--perf-gradient': isDark ? themeConfig.darkGradient : themeConfig.gradient,
    '--perf-highlight': isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    '--perf-subtle-fill': isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.035)',
    '--perf-tick': isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  } as CSSProperties;
}

function PerformanceScene({
  config,
  context,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  rotationStatusLabel,
}: SubtitleRendererShellProps & { config: PerformanceVariantConfig }) {
  const themeConfig = config.theme;
  const Icon = themeConfig.icon;
  const sceneVars = getSceneVars(themeConfig, context.isDark);

  return (
    <div
      className={cn(styles.cluster, context.compact && styles.clusterCompact)}
      onMouseEnter={!context.prefersReducedMotion ? onMouseEnter : undefined}
      onMouseLeave={!context.prefersReducedMotion ? onMouseLeave : undefined}
      style={sceneVars}
    >
      <div
        tabIndex={0}
        role="group"
        aria-label={`${themeConfig.text}. ${rotationStatusLabel}`}
        className={styles.control}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <motion.section
          initial={context.prefersReducedMotion || !context.allowAnimatedEntrance ? false : themeConfig.initial}
          animate={context.prefersReducedMotion ? undefined : themeConfig.animate}
          exit={context.prefersReducedMotion ? undefined : themeConfig.exit}
          transition={themeConfig.transition}
          className={cn(styles.scene, {
            [styles.sceneAutomation]: config.scene === 'automation',
            [styles.sceneRobotics]: config.scene === 'robotics',
            [styles.sceneNeural]: config.scene === 'neural',
          })}
          data-motion={context.shouldAnimateTagline ? 'animated' : 'reduced'}
        >
          <div className={styles.sceneBody}>
            <div className={styles.titleBlock}>
              <div className={styles.headlineWrap}>
                <span className={styles.iconBadge} aria-hidden="true">
                  <Icon className={styles.icon} />
                </span>
                <div className={styles.titleLockup}>
                  <h2 className={styles.title}>{themeConfig.text}</h2>
                </div>
              </div>
            </div>

            <div className={styles.sceneRig} aria-hidden="true">
              {config.scene === 'automation' ? (
                <>
                  <span className={styles.automationGauge} />
                  <span className={styles.automationNeedle} />
                  <div className={styles.automationCues}>
                    <span />
                    <span />
                    <span />
                  </div>
                </>
              ) : null}

              {config.scene === 'robotics' ? (
                <>
                  <span className={styles.roboticsMast} />
                  <span className={styles.roboticsBoom} />
                  <span className={styles.roboticsHoist} />
                  <span className={styles.roboticsPayload} />
                </>
              ) : null}

              {config.scene === 'neural' ? (
                <>
                  <span className={styles.neuralRingOuter} />
                  <span className={styles.neuralRingMiddle} />
                  <span className={styles.neuralRingInner} />
                  <span className={styles.neuralCore} />
                  <div className={styles.neuralSynapses}>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function createPerformanceRenderer(config: PerformanceVariantConfig): LandingTitleRendererEntry {
  return {
    id: config.theme.id,
    lane: 'performance',
    render: (props) => <PerformanceScene {...props} config={config} />,
    signalDeck: config.theme.signalDeck,
    text: config.theme.text,
    theme: config.theme,
  };
}

export const PERFORMANCE_SHOWCASE_RENDERERS: readonly LandingTitleRendererEntry[] =
  PERFORMANCE_VARIANTS.map(createPerformanceRenderer);

export const PERFORMANCE_SUBTITLE_RENDERERS: readonly LandingTitleRendererEntry[] = [
  ...PERFORMANCE_SHOWCASE_RENDERERS,
];
