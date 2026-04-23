'use client';

import { motion } from 'motion/react';
import { Boxes, FlaskConical, Link, PenTool, Route, ShieldCheck } from 'lucide-react';
import type { CSSProperties } from 'react';

import styles from './crafted.module.css';
import {
  getTitleTextStyle,
  theme,
  typo,
  type LandingTitleRendererEntry,
  type SubtitleRendererShellProps,
  type SubtitleTheme,
} from '@/components/landing-title/shared';
import type { SignalDeckMeta } from '@/lib/landing-title-sequence';
import { cn } from '@/lib/utils';

type CraftedScene =
  | 'alchemist'
  | 'digitalSculptor'
  | 'holographicSculptor'
  | 'cyberDefense'
  | 'blockchain'
  | 'frontier';

interface CraftedVariantConfig {
  readonly scene: CraftedScene;
  readonly theme: SubtitleTheme;
}

const craftedSubtitle = (
  id: string,
  text: string,
  family: SignalDeckMeta['family'],
  descriptor: SignalDeckMeta['descriptor'],
) => ({
  id,
  lane: 'crafted' as const,
  text,
  signalDeck: { family, descriptor },
});

const CODE_ALCHEMIST_THEME = theme(
  craftedSubtitle('code-alchemist', 'code alchemist', 'Alchemist', 'transmutation lab'),
  {
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 38%, #ef4444 100%)',
    darkGradient: 'linear-gradient(135deg, #fde68a 0%, #fdba74 40%, #fca5a5 100%)',
    glow: 'rgba(249, 115, 22, 0.5)',
  },
  { ...typo.alchemist, letterSpacing: '-0.01em' },
  FlaskConical,
  'left',
  '',
  'thunderExit',
  '',
  { border: '1px solid rgba(249, 115, 22, 0.22)', shadow: '0 22px 60px rgba(249, 115, 22, 0.14)' },
);

const DIGITAL_SCULPTOR_THEME = theme(
  craftedSubtitle('digital-sculptor', 'digital sculptor', 'Sculptor', 'tactile interfaces'),
  {
    gradient: 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 42%, #0d9488 100%)',
    darkGradient: 'linear-gradient(135deg, #a5f3fc 0%, #7dd3fc 42%, #5eead4 100%)',
    glow: 'rgba(56, 189, 248, 0.46)',
  },
  { ...typo.sculptor, fontWeight: 600 },
  PenTool,
  'left',
  '',
  'blueprintFold',
  '',
  { border: '1px solid rgba(56, 189, 248, 0.2)', shadow: '0 22px 60px rgba(56, 189, 248, 0.13)' },
);

const HOLOGRAPHIC_SCULPTOR_THEME = theme(
  craftedSubtitle('holographic-sculptor', 'holosculptor', 'Sculptor', 'volumetric material'),
  {
    gradient: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 42%, #22d3ee 100%)',
    darkGradient: 'linear-gradient(135deg, #e9d5ff 0%, #bfdbfe 42%, #a5f3fc 100%)',
    glow: 'rgba(96, 165, 250, 0.48)',
  },
  { ...typo.sculptorMed, fontWeight: 580, letterSpacing: '0.03em' },
  Boxes,
  'left',
  '',
  'auroraBloom',
  '',
  { border: '1px solid rgba(96, 165, 250, 0.2)', shadow: '0 22px 60px rgba(96, 165, 250, 0.14)' },
);

const CYBER_DEFENSE_ARTISAN_THEME = theme(
  craftedSubtitle('cyber-defense-artisan', 'bastion warden', 'Artisan', 'forged reliability'),
  {
    gradient: 'linear-gradient(135deg, #16a34a 0%, #0ea5e9 42%, #0f172a 100%)',
    darkGradient: 'linear-gradient(135deg, #86efac 0%, #7dd3fc 42%, #334155 100%)',
    glow: 'rgba(34, 197, 94, 0.44)',
  },
  { ...typo.artisan, fontWeight: 680, letterSpacing: '0.02em' },
  ShieldCheck,
  'left',
  '',
  'lockdownSweep',
  '',
  { border: '1px solid rgba(34, 197, 94, 0.22)', shadow: '0 22px 60px rgba(34, 197, 94, 0.13)' },
);

const BLOCKCHAIN_ARTISAN_THEME = theme(
  craftedSubtitle('blockchain-artisan', 'lattice smith', 'Artisan', 'lattice forge'),
  {
    gradient: 'linear-gradient(135deg, #d97706 0%, #ea580c 38%, #0ea5e9 100%)',
    darkGradient: 'linear-gradient(135deg, #fcd34d 0%, #fdba74 40%, #7dd3fc 100%)',
    glow: 'rgba(251, 146, 60, 0.48)',
  },
  { ...typo.artisanBold, fontWeight: 640, letterSpacing: '0.035em', textTransform: 'none' },
  Link,
  'left',
  '',
  'thunderExit',
  '',
  { border: '1px solid rgba(251, 146, 60, 0.22)', shadow: '0 22px 60px rgba(251, 146, 60, 0.14)' },
);

const FRONTIER_FORGER_THEME = theme(
  craftedSubtitle('frontier-forger', 'frontier forger', 'Forger', 'expedition forge'),
  {
    gradient: 'linear-gradient(135deg, #84cc16 0%, #16a34a 42%, #0284c7 100%)',
    darkGradient: 'linear-gradient(135deg, #d9f99d 0%, #86efac 42%, #7dd3fc 100%)',
    glow: 'rgba(34, 197, 94, 0.46)',
  },
  { ...typo.crafter, fontWeight: 620, letterSpacing: '0.04em' },
  Route,
  'left',
  '',
  'cartographyTilt',
  '',
  { border: '1px solid rgba(34, 197, 94, 0.2)', shadow: '0 22px 60px rgba(34, 197, 94, 0.13)' },
);

export const CRAFTED_SHOWCASE_THEMES: SubtitleTheme[] = [
  CODE_ALCHEMIST_THEME,
  DIGITAL_SCULPTOR_THEME,
  HOLOGRAPHIC_SCULPTOR_THEME,
  CYBER_DEFENSE_ARTISAN_THEME,
  BLOCKCHAIN_ARTISAN_THEME,
  FRONTIER_FORGER_THEME,
];

export const CRAFTED_SUBTITLE_THEMES: SubtitleTheme[] = [
  ...CRAFTED_SHOWCASE_THEMES,
];

const CRAFTED_VARIANTS: readonly CraftedVariantConfig[] = [
  {
    scene: 'alchemist',
    theme: CODE_ALCHEMIST_THEME,
  },
  {
    scene: 'digitalSculptor',
    theme: DIGITAL_SCULPTOR_THEME,
  },
  {
    scene: 'holographicSculptor',
    theme: HOLOGRAPHIC_SCULPTOR_THEME,
  },
  {
    scene: 'cyberDefense',
    theme: CYBER_DEFENSE_ARTISAN_THEME,
  },
  {
    scene: 'blockchain',
    theme: BLOCKCHAIN_ARTISAN_THEME,
  },
  {
    scene: 'frontier',
    theme: FRONTIER_FORGER_THEME,
  },
];

function withAlpha(color: string, alpha: number): string {
  return color.replace(/[\d.]+\)\s*$/, `${alpha})`);
}

function getSceneVars(themeConfig: SubtitleTheme, isDark: boolean): CSSProperties {
  return {
    '--craft-glow': themeConfig.glow,
    '--craft-glow-soft': withAlpha(themeConfig.glow, isDark ? 0.18 : 0.15),
    '--craft-glow-strong': withAlpha(themeConfig.glow, isDark ? 0.4 : 0.32),
    '--craft-edge': withAlpha(themeConfig.glow, isDark ? 0.28 : 0.24),
    '--craft-panel': isDark ? 'rgba(11, 12, 22, 0.9)' : 'rgba(255, 255, 255, 0.94)',
    '--craft-panel-2': isDark ? 'rgba(21, 24, 40, 0.84)' : 'rgba(246, 247, 251, 0.96)',
    '--craft-panel-3': isDark ? 'rgba(32, 35, 57, 0.64)' : 'rgba(229, 233, 241, 0.82)',
    '--craft-text': isDark ? 'rgba(248, 250, 252, 0.98)' : 'rgba(15, 23, 42, 0.94)',
    '--craft-muted': isDark ? 'rgba(184, 194, 208, 0.82)' : 'rgba(71, 85, 105, 0.8)',
    '--craft-gradient': isDark ? themeConfig.darkGradient : themeConfig.gradient,
    '--craft-fill': isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    '--craft-fill-strong': isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.06)',
    '--craft-line': isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    '--craft-line-faint': isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  } as CSSProperties;
}

function CraftedScene({
  config,
  context,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  rotationStatusLabel,
}: SubtitleRendererShellProps & { config: CraftedVariantConfig }) {
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
        data-surface={context.surface}
      >
        <motion.section
          initial={context.prefersReducedMotion || !context.allowAnimatedEntrance ? false : themeConfig.initial}
          animate={context.prefersReducedMotion ? undefined : themeConfig.animate}
          exit={context.prefersReducedMotion ? undefined : themeConfig.exit}
          transition={themeConfig.transition}
          className={cn(styles.scene, {
            [styles.sceneAlchemist]: config.scene === 'alchemist',
            [styles.sceneDigitalSculptor]: config.scene === 'digitalSculptor',
            [styles.sceneHolographicSculptor]: config.scene === 'holographicSculptor',
            [styles.sceneCyberDefense]: config.scene === 'cyberDefense',
            [styles.sceneBlockchain]: config.scene === 'blockchain',
            [styles.sceneFrontier]: config.scene === 'frontier',
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
                  <h2
                    className={styles.title}
                    style={getTitleTextStyle(themeConfig, context.isDark)}
                  >
                    {themeConfig.text}
                  </h2>
                </div>
              </div>
            </div>

            <div
              className={cn(styles.sceneRig, {
                [styles.alchemistRig]: config.scene === 'alchemist',
                [styles.digitalRig]: config.scene === 'digitalSculptor',
                [styles.holographicRig]: config.scene === 'holographicSculptor',
                [styles.cyberDefenseRig]: config.scene === 'cyberDefense',
                [styles.blockchainRig]: config.scene === 'blockchain',
                [styles.frontierRig]: config.scene === 'frontier',
              })}
              aria-hidden="true"
            >
              {config.scene === 'alchemist' ? (
                <>
                  <span className={styles.alchemistAlembic} />
                  <span className={styles.alchemistFlask} />
                  <span className={styles.alchemistCrucible} />
                  <span className={styles.alchemistCoil} />
                  <div className={styles.alchemistTrays}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.alchemistSparks}>
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className={styles.alchemistLedger} />
                </>
              ) : null}

              {config.scene === 'digitalSculptor' ? (
                <>
                  <span className={styles.digitalBlock} />
                  <span className={styles.digitalChisel} />
                  <div className={styles.digitalGrooves}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.digitalDust}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className={styles.digitalFacet} />
                </>
              ) : null}

              {config.scene === 'holographicSculptor' ? (
                <>
                  <span className={styles.holoFrame} />
                  <span className={styles.holoBeam} />
                  <span className={styles.holoVolume} />
                  <div className={styles.holoContours}>
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.holoGhost}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className={styles.holoPrism} />
                </>
              ) : null}

              {config.scene === 'cyberDefense' ? (
                <>
                  <span className={styles.defenseRampart} />
                  <span className={styles.defenseShield} />
                  <span className={styles.defenseGate} />
                  <div className={styles.defensePlates}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.defenseWatch}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className={styles.defenseBeacon} />
                </>
              ) : null}

              {config.scene === 'blockchain' ? (
                <>
                  <div className={styles.latticeGrid}>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className={styles.latticeCore} />
                  <div className={styles.latticeStruts}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.latticeHeat}>
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className={styles.latticeAnchor} />
                </>
              ) : null}

              {config.scene === 'frontier' ? (
                <>
                  <span className={styles.frontierTerrain} />
                  <span className={styles.frontierHorizon} />
                  <span className={styles.frontierCamp} />
                  <div className={styles.frontierTrails}>
                    <span />
                    <span />
                  </div>
                  <div className={styles.frontierStars}>
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className={styles.frontierBeacon} />
                </>
              ) : null}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function createCraftedRenderer(config: CraftedVariantConfig): LandingTitleRendererEntry {
  return {
    id: config.theme.id,
    lane: 'crafted',
    render: (props) => <CraftedScene {...props} config={config} />,
    signalDeck: config.theme.signalDeck,
    text: config.theme.text,
    theme: config.theme,
  };
}

export const CRAFTED_SHOWCASE_RENDERERS: readonly LandingTitleRendererEntry[] =
  CRAFTED_VARIANTS.map(createCraftedRenderer);

export const CRAFTED_SUBTITLE_RENDERERS: readonly LandingTitleRendererEntry[] = [
  ...CRAFTED_SHOWCASE_RENDERERS,
];
