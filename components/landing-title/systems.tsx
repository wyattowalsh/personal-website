'use client';

import { motion } from 'motion/react';
import { Atom, BrainCircuit, Cloud, Cpu, Fingerprint, Map as MapIcon, Music } from 'lucide-react';
import type { CSSProperties } from 'react';

import styles from './systems.module.css';
import {
  theme,
  typo,
  type LandingTitleRendererEntry,
  type SubtitleRendererShellProps,
  type SubtitleTheme,
} from '@/components/landing-title/shared';
import type { SignalDeckMeta } from '@/lib/landing-title-sequence';
import { cn } from '@/lib/utils';

type SystemsScene =
  | 'cybernetic'
  | 'zeroTrust'
  | 'synthetic'
  | 'quantum'
  | 'cloud'
  | 'cartographer'
  | 'orchestrator';

interface SystemsVariantConfig {
  readonly scene: SystemsScene;
  readonly theme: SubtitleTheme;
}

const systemsSubtitle = (
  id: string,
  text: string,
  family: SignalDeckMeta['family'],
  descriptor: SignalDeckMeta['descriptor'],
) => ({
  id,
  lane: 'systems' as const,
  text,
  signalDeck: { family, descriptor },
});

const CYBERNETIC_ARCHITECT_THEME = theme(
  systemsSubtitle('cybernetic-architect', 'cyber architect', 'Architect', 'adaptive command mesh'),
  {
    gradient: 'linear-gradient(135deg, #67e8f9 0%, #38bdf8 40%, #818cf8 100%)',
    darkGradient: 'linear-gradient(135deg, #a5f3fc 0%, #7dd3fc 42%, #c7d2fe 100%)',
    glow: 'rgba(56, 189, 248, 0.54)',
  },
  { ...typo.architect, letterSpacing: '0.08em' },
  Cpu,
  'left',
  '',
  'blueprintFold',
  '',
  { border: '1px solid rgba(56, 189, 248, 0.22)', shadow: '0 22px 60px rgba(56, 189, 248, 0.14)' },
);

const ZERO_TRUST_ARCHITECT_THEME = theme(
  systemsSubtitle('zero-trust-architect', 'zero trust architect', 'Architect', 'sealed trust fabric'),
  {
    gradient: 'linear-gradient(135deg, #93c5fd 0%, #6366f1 40%, #0f172a 100%)',
    darkGradient: 'linear-gradient(135deg, #dbeafe 0%, #a5b4fc 42%, #334155 100%)',
    glow: 'rgba(99, 102, 241, 0.48)',
  },
  { ...typo.architectBold, letterSpacing: '0.1em' },
  Fingerprint,
  'left',
  '',
  'lockdownSweep',
  '',
  { border: '1px solid rgba(99, 102, 241, 0.22)', shadow: '0 22px 60px rgba(99, 102, 241, 0.14)' },
);

const SYNTHETIC_INTELLIGENCE_ARCHITECT_THEME = theme(
  systemsSubtitle('synthetic-intelligence-architect', 'cognitive architect', 'Architect', 'cognitive system framing'),
  {
    gradient: 'linear-gradient(135deg, #34d399 0%, #22d3ee 42%, #818cf8 100%)',
    darkGradient: 'linear-gradient(135deg, #86efac 0%, #67e8f9 42%, #c7d2fe 100%)',
    glow: 'rgba(34, 211, 238, 0.46)',
  },
  { ...typo.architectNeural, textTransform: 'none', letterSpacing: '0.045em' },
  BrainCircuit,
  'left',
  '',
  'springOvershoot',
  '',
  { border: '1px solid rgba(34, 211, 238, 0.2)', shadow: '0 22px 60px rgba(34, 211, 238, 0.13)' },
);

const QUANTUM_DESIGNER_THEME = theme(
  systemsSubtitle('quantum-designer', 'quantum designer', 'Designer', 'probability framing'),
  {
    gradient: 'linear-gradient(135deg, #67e8f9 0%, #a855f7 42%, #f472b6 100%)',
    darkGradient: 'linear-gradient(135deg, #a5f3fc 0%, #ddd6fe 42%, #fbcfe8 100%)',
    glow: 'rgba(168, 85, 247, 0.5)',
  },
  { ...typo.designer, letterSpacing: '0.12em' },
  Atom,
  'left',
  '',
  'auroraBloom',
  '',
  { border: '1px solid rgba(168, 85, 247, 0.2)', shadow: '0 22px 60px rgba(168, 85, 247, 0.14)' },
);

const CLOUD_SHAPER_THEME = theme(
  systemsSubtitle('cloud-shaper', 'cloud shaper', 'Cartographer', 'weathered compute terrain'),
  {
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #bae6fd 35%, #38bdf8 100%)',
    darkGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 35%, #60a5fa 100%)',
    glow: 'rgba(125, 211, 252, 0.46)',
  },
  { ...typo.visionary, fontWeight: 520, textTransform: 'uppercase' },
  Cloud,
  'left',
  '',
  'dreamFloat',
  '',
  { border: '1px solid rgba(125, 211, 252, 0.2)', shadow: '0 22px 60px rgba(125, 211, 252, 0.12)' },
);

const AI_CARTOGRAPHER_THEME = theme(
  systemsSubtitle('ai-cartographer', 'AI cartographer', 'Cartographer', 'route intelligence'),
  {
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #38bdf8 44%, #34d399 100%)',
    darkGradient: 'linear-gradient(135deg, #fde68a 0%, #7dd3fc 44%, #86efac 100%)',
    glow: 'rgba(56, 189, 248, 0.44)',
  },
  { ...typo.mapper, letterSpacing: '0.1em' },
  MapIcon,
  'left',
  '',
  'cartographyTilt',
  '',
  { border: '1px solid rgba(56, 189, 248, 0.2)', shadow: '0 22px 60px rgba(56, 189, 248, 0.14)' },
);

const DATA_ORCHESTRATOR_THEME = theme(
  systemsSubtitle('data-orchestrator', 'signal orchestrator', 'Orchestrator', 'coordinated signal traffic'),
  {
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fb7185 42%, #8b5cf6 100%)',
    darkGradient: 'linear-gradient(135deg, #fcd34d 0%, #fda4af 42%, #c4b5fd 100%)',
    glow: 'rgba(249, 115, 22, 0.48)',
  },
  { ...typo.orchestrator, letterSpacing: '0.08em' },
  Music,
  'left',
  '',
  'thunderExit',
  '',
  { border: '1px solid rgba(249, 115, 22, 0.22)', shadow: '0 22px 60px rgba(249, 115, 22, 0.14)' },
);

export const SYSTEMS_SHOWCASE_THEMES: SubtitleTheme[] = [
  CYBERNETIC_ARCHITECT_THEME,
  ZERO_TRUST_ARCHITECT_THEME,
  SYNTHETIC_INTELLIGENCE_ARCHITECT_THEME,
  QUANTUM_DESIGNER_THEME,
  CLOUD_SHAPER_THEME,
  AI_CARTOGRAPHER_THEME,
  DATA_ORCHESTRATOR_THEME,
];

export const SYSTEMS_SUBTITLE_THEMES: SubtitleTheme[] = [
  ...SYSTEMS_SHOWCASE_THEMES,
];

const SYSTEMS_VARIANTS: readonly SystemsVariantConfig[] = [
  {
    scene: 'cybernetic',
    theme: CYBERNETIC_ARCHITECT_THEME,
  },
  {
    scene: 'zeroTrust',
    theme: ZERO_TRUST_ARCHITECT_THEME,
  },
  {
    scene: 'synthetic',
    theme: SYNTHETIC_INTELLIGENCE_ARCHITECT_THEME,
  },
  {
    scene: 'quantum',
    theme: QUANTUM_DESIGNER_THEME,
  },
  {
    scene: 'cloud',
    theme: CLOUD_SHAPER_THEME,
  },
  {
    scene: 'cartographer',
    theme: AI_CARTOGRAPHER_THEME,
  },
  {
    scene: 'orchestrator',
    theme: DATA_ORCHESTRATOR_THEME,
  },
];

function withAlpha(color: string, alpha: number): string {
  return color.replace(/[\d.]+\)\s*$/, `${alpha})`);
}

function getSceneVars(themeConfig: SubtitleTheme, isDark: boolean): CSSProperties {
  return {
    '--sys-glow': themeConfig.glow,
    '--sys-glow-soft': withAlpha(themeConfig.glow, isDark ? 0.18 : 0.15),
    '--sys-glow-strong': withAlpha(themeConfig.glow, isDark ? 0.4 : 0.34),
    '--sys-edge': withAlpha(themeConfig.glow, isDark ? 0.28 : 0.24),
    '--sys-panel': isDark ? 'rgba(8, 12, 28, 0.9)' : 'rgba(255, 255, 255, 0.94)',
    '--sys-panel-2': isDark ? 'rgba(18, 24, 44, 0.82)' : 'rgba(244, 247, 252, 0.96)',
    '--sys-panel-3': isDark ? 'rgba(29, 35, 60, 0.62)' : 'rgba(225, 232, 245, 0.8)',
    '--sys-text': isDark ? 'rgba(248, 250, 252, 0.98)' : 'rgba(15, 23, 42, 0.94)',
    '--sys-muted': isDark ? 'rgba(177, 188, 205, 0.82)' : 'rgba(71, 85, 105, 0.8)',
    '--sys-gradient': isDark ? themeConfig.darkGradient : themeConfig.gradient,
    /* Structural overlays — flip white↔slate for light/dark panels */
    '--sys-fill': isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(15, 23, 42, 0.1)',
    '--sys-struct-strong': isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)',
    '--sys-struct': isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)',
    '--sys-struct-faint': isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.035)',
  } as CSSProperties;
}

function SystemsScene({
  config,
  context,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  rotationStatusLabel,
}: SubtitleRendererShellProps & { config: SystemsVariantConfig }) {
  const themeConfig = config.theme;
  const Icon = themeConfig.icon;

  return (
    <div
      className={cn(styles.cluster, context.compact && styles.clusterCompact)}
      onMouseEnter={!context.prefersReducedMotion ? onMouseEnter : undefined}
      onMouseLeave={!context.prefersReducedMotion ? onMouseLeave : undefined}
      style={getSceneVars(themeConfig, context.isDark)}
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
            [styles.sceneCybernetic]: config.scene === 'cybernetic',
            [styles.sceneZeroTrust]: config.scene === 'zeroTrust',
            [styles.sceneSynthetic]: config.scene === 'synthetic',
            [styles.sceneQuantum]: config.scene === 'quantum',
            [styles.sceneCloud]: config.scene === 'cloud',
            [styles.sceneCartographer]: config.scene === 'cartographer',
            [styles.sceneOrchestrator]: config.scene === 'orchestrator',
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

            <div
              className={cn(styles.sceneRig, {
                [styles.cyberneticRig]: config.scene === 'cybernetic',
                [styles.zeroTrustRig]: config.scene === 'zeroTrust',
                [styles.syntheticRig]: config.scene === 'synthetic',
                [styles.quantumRig]: config.scene === 'quantum',
                [styles.cloudRig]: config.scene === 'cloud',
                [styles.cartographerRig]: config.scene === 'cartographer',
                [styles.orchestratorRig]: config.scene === 'orchestrator',
              })}
              aria-hidden="true"
            >
              {config.scene === 'cybernetic' ? (
                <>
                  <span className={styles.cyberSpine} />
                  <div className={styles.cyberNodes}>
                    <span />
                    <span />
                    <span />
                  </div>
                </>
              ) : null}

              {config.scene === 'zeroTrust' ? (
                <>
                  <span className={styles.zeroRing} />
                  <span className={styles.zeroRingInner} />
                  <span className={styles.zeroCore} />
                </>
              ) : null}

              {config.scene === 'synthetic' ? (
                <>
                  <span className={styles.syntheticCore} />
                  <div className={styles.syntheticDendrites}>
                    <span />
                    <span />
                    <span />
                  </div>
                </>
              ) : null}

              {config.scene === 'quantum' ? (
                <>
                  <span className={styles.quantumOrbit} />
                  <span className={styles.quantumOrbitAlt} />
                  <div className={styles.quantumStates}>
                    <span />
                    <span />
                    <span />
                  </div>
                </>
              ) : null}

              {config.scene === 'cloud' ? (
                <>
                  <div className={styles.cloudMasses}>
                    <span />
                    <span />
                  </div>
                  <div className={styles.cloudRain}>
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </>
              ) : null}

              {config.scene === 'cartographer' ? (
                <>
                  <span className={styles.mapGrid} />
                  <span className={styles.mapRoute} />
                  <span className={styles.mapRouteAlt} />
                  <div className={styles.mapPins}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.mapContours}>
                    <span />
                    <span />
                  </div>
                </>
              ) : null}

              {config.scene === 'orchestrator' ? (
                <>
                  <div className={styles.orchestratorScore}>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.orchestratorBeats}>
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

function createSystemsRenderer(config: SystemsVariantConfig): LandingTitleRendererEntry {
  return {
    id: config.theme.id,
    lane: 'systems',
    render: (props) => <SystemsScene {...props} config={config} />,
    signalDeck: config.theme.signalDeck,
    text: config.theme.text,
    theme: config.theme,
  };
}

export const SYSTEMS_SHOWCASE_RENDERERS: readonly LandingTitleRendererEntry[] =
  SYSTEMS_VARIANTS.map(createSystemsRenderer);

export const SYSTEMS_SUBTITLE_RENDERERS: readonly LandingTitleRendererEntry[] = [
  ...SYSTEMS_SHOWCASE_RENDERERS,
];
