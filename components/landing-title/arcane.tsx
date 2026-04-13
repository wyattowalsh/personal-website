'use client';

import { motion } from 'motion/react';
import { Archive, Cpu, GitBranch, Hexagon, Moon, Radar } from 'lucide-react';
import type { CSSProperties } from 'react';

import styles from './arcane.module.css';
import {
  theme,
  typo,
  type LandingTitleRendererEntry,
  type SubtitleRendererShellProps,
  type SubtitleTheme,
} from '@/components/landing-title/shared';
import type { SignalDeckMeta } from '@/lib/landing-title-sequence';
import { cn } from '@/lib/utils';

type ArcaneScene =
  | 'sorcerer'
  | 'mage'
  | 'weaver'
  | 'conjurer'
  | 'mystic'
  | 'oracle';

interface ArcaneVariantConfig {
  readonly scene: ArcaneScene;
  readonly theme: SubtitleTheme;
  readonly kicker: string;
  readonly descriptor: string;
  readonly notes: readonly string[];
}

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

const DATA_SORCERER_THEME = theme(
  arcaneSubtitle('data-sorcerer', 'archive sorcerer', 'Mystic', 'spellbound archives'),
  {
    gradient: 'linear-gradient(135deg, #5eead4 0%, #14b8a6 38%, #0f766e 100%)',
    darkGradient: 'linear-gradient(135deg, #99f6e4 0%, #2dd4bf 40%, #14b8a6 100%)',
    glow: 'rgba(20, 184, 166, 0.56)',
  },
  { ...typo.sorcerer, fontWeight: 500, fontStyle: 'normal' },
  Archive,
  'left',
  '',
  'dreamFloat',
  '',
  { border: '1px solid rgba(20, 184, 166, 0.24)', shadow: '0 22px 60px rgba(20, 184, 166, 0.16)' },
);

const WORKFLOW_MAGE_THEME = theme(
  arcaneSubtitle('workflow-mage', 'sigil mage', 'Weaver', 'ritual sigil-craft'),
  {
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 40%, #f59e0b 100%)',
    darkGradient: 'linear-gradient(135deg, #ddd6fe 0%, #a78bfa 42%, #fcd34d 100%)',
    glow: 'rgba(124, 58, 237, 0.54)',
  },
  { ...typo.mage, fontWeight: 560 },
  Hexagon,
  'left',
  '',
  'dreamFloat',
  '',
  { border: '1px solid rgba(124, 58, 237, 0.22)', shadow: '0 22px 60px rgba(124, 58, 237, 0.15)' },
);

const ALGORITHM_WEAVER_THEME = theme(
  arcaneSubtitle('algorithm-weaver', 'algorithm weaver', 'Weaver', 'threaded logic'),
  {
    gradient: 'linear-gradient(135deg, #f472b6 0%, #c084fc 44%, #67e8f9 100%)',
    darkGradient: 'linear-gradient(135deg, #fbcfe8 0%, #ddd6fe 44%, #a5f3fc 100%)',
    glow: 'rgba(236, 72, 153, 0.5)',
  },
  { ...typo.mage, fontWeight: 490, letterSpacing: '0.06em' },
  GitBranch,
  'left',
  '',
  'dreamFloat',
  '',
  { border: '1px solid rgba(236, 72, 153, 0.22)', shadow: '0 22px 60px rgba(236, 72, 153, 0.15)' },
);

const SILICON_CONJURER_THEME = theme(
  arcaneSubtitle('silicon-conjurer', 'silicon conjurer', 'Mystic', 'summoned circuitry'),
  {
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fb7185 40%, #22d3ee 100%)',
    darkGradient: 'linear-gradient(135deg, #fcd34d 0%, #fda4af 42%, #67e8f9 100%)',
    glow: 'rgba(251, 146, 60, 0.54)',
  },
  { ...typo.sorcerer, fontWeight: 470 },
  Cpu,
  'left',
  '',
  'thunderExit',
  '',
  { border: '1px solid rgba(251, 146, 60, 0.22)', shadow: '0 22px 60px rgba(251, 146, 60, 0.15)' },
);

const EMERGENCE_MYSTIC_THEME = theme(
  arcaneSubtitle('emergence-mystic', 'emergence mystic', 'Mystic', 'blooming foresight'),
  {
    gradient: 'linear-gradient(135deg, #f9a8d4 0%, #c084fc 42%, #818cf8 100%)',
    darkGradient: 'linear-gradient(135deg, #fbcfe8 0%, #ddd6fe 42%, #c7d2fe 100%)',
    glow: 'rgba(192, 132, 252, 0.5)',
  },
  { ...typo.visionaryItalic, fontWeight: 360, letterSpacing: '0.11em' },
  Moon,
  'left',
  '',
  'auroraBloom',
  '',
  { border: '1px solid rgba(192, 132, 252, 0.22)', shadow: '0 22px 60px rgba(192, 132, 252, 0.14)' },
);

const SIGNAL_ORACLE_THEME = theme(
  arcaneSubtitle('signal-oracle', 'signal oracle', 'Oracle', 'far-signal divination'),
  {
    gradient: 'linear-gradient(135deg, #67e8f9 0%, #14b8a6 40%, #fbbf24 100%)',
    darkGradient: 'linear-gradient(135deg, #a5f3fc 0%, #5eead4 40%, #fcd34d 100%)',
    glow: 'rgba(34, 211, 238, 0.48)',
  },
  { ...typo.mapperLight, fontWeight: 520, textTransform: 'uppercase' },
  Radar,
  'left',
  '',
  'cartographyTilt',
  '',
  { border: '1px solid rgba(34, 211, 238, 0.2)', shadow: '0 22px 60px rgba(34, 211, 238, 0.14)' },
);

export const ARCANE_SHOWCASE_THEMES: SubtitleTheme[] = [
  DATA_SORCERER_THEME,
  WORKFLOW_MAGE_THEME,
  ALGORITHM_WEAVER_THEME,
  SILICON_CONJURER_THEME,
  EMERGENCE_MYSTIC_THEME,
  SIGNAL_ORACLE_THEME,
];

export const ARCANE_SUBTITLE_THEMES: SubtitleTheme[] = [
  ...ARCANE_SHOWCASE_THEMES,
];

const ARCANE_VARIANTS: readonly ArcaneVariantConfig[] = [
  {
    scene: 'sorcerer',
    theme: DATA_SORCERER_THEME,
    kicker: 'Archive invocation',
    descriptor: 'Archive monoliths rise from a ritual basin so the title feels invoked instead of arranged.',
    notes: ['catalog', 'invoke', 'decode'],
  },
  {
    scene: 'mage',
    theme: WORKFLOW_MAGE_THEME,
    kicker: 'Inscribed seal',
    descriptor: 'A hexagonal seal and radiating inscriptions let the title feel like a ward being drawn, not a flowchart.',
    notes: ['seal', 'glyph', 'ward'],
  },
  {
    scene: 'weaver',
    theme: ALGORITHM_WEAVER_THEME,
    kicker: 'Logic loom',
    descriptor: 'Crossed warp and weft threads with a shuttle read like a loom weaving code, not loading bars.',
    notes: ['warp', 'thread', 'braid'],
  },
  {
    scene: 'conjurer',
    theme: SILICON_CONJURER_THEME,
    kicker: 'Chip gate',
    descriptor: 'Circuit corners and a summoned core turn the title into a silicon ritual rather than an icon swap.',
    notes: ['summon', 'etch', 'ignite'],
  },
  {
    scene: 'mystic',
    theme: EMERGENCE_MYSTIC_THEME,
    kicker: 'Forecast bloom',
    descriptor: 'A petaled halo and rising sigils frame the title like an unfolding omen.',
    notes: ['bloom', 'signal', 'omen'],
  },
  {
    scene: 'oracle',
    theme: SIGNAL_ORACLE_THEME,
    kicker: 'Far-signal lens',
    descriptor: 'A radar sweep and divination tags let the title feel prophetic, not generic.',
    notes: ['scan', 'listen', 'predict'],
  },
];

function withAlpha(color: string, alpha: number): string {
  return color.replace(/[\d.]+\)\s*$/, `${alpha})`);
}

function getSceneVars(themeConfig: SubtitleTheme, isDark: boolean): CSSProperties {
  return {
    '--arc-glow': themeConfig.glow,
    '--arc-glow-soft': withAlpha(themeConfig.glow, isDark ? 0.18 : 0.18),
    '--arc-glow-strong': withAlpha(themeConfig.glow, isDark ? 0.4 : 0.36),
    '--arc-edge': withAlpha(themeConfig.glow, isDark ? 0.28 : 0.28),
    '--arc-panel': isDark ? 'rgba(9, 12, 28, 0.9)' : 'rgba(255, 255, 255, 0.92)',
    '--arc-panel-2': isDark ? 'rgba(21, 25, 47, 0.8)' : 'rgba(237, 241, 253, 0.96)',
    '--arc-panel-3': isDark ? 'rgba(30, 36, 66, 0.62)' : 'rgba(218, 225, 243, 0.84)',
    '--arc-text': isDark ? 'rgba(248, 250, 252, 0.98)' : 'rgba(15, 23, 42, 0.96)',
    '--arc-muted': isDark ? 'rgba(186, 194, 212, 0.82)' : 'rgba(51, 65, 85, 0.86)',
    '--arc-gradient': isDark ? themeConfig.darkGradient : themeConfig.gradient,
    '--arc-overlay': isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : withAlpha(themeConfig.glow, 0.1),
    '--arc-overlay-bold': isDark
      ? 'rgba(255, 255, 255, 0.3)'
      : withAlpha(themeConfig.glow, 0.28),
    '--arc-inlay': isDark
      ? 'rgba(10, 14, 26, 0.24)'
      : withAlpha(themeConfig.glow, 0.06),
  } as CSSProperties;
}

function ArcaneScene({
  config,
  context,

  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,

  rotationStatusLabel,

}: SubtitleRendererShellProps & { config: ArcaneVariantConfig }) {
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
        aria-label={`${themeConfig.text}. ${themeConfig.signalDeck.family} family, ${themeConfig.signalDeck.descriptor}. ${rotationStatusLabel}`}
        className={styles.control}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <motion.section
          initial={context.prefersReducedMotion ? false : themeConfig.initial}
          animate={context.prefersReducedMotion ? undefined : themeConfig.animate}
          exit={context.prefersReducedMotion ? undefined : themeConfig.exit}
          transition={themeConfig.transition}
          className={cn(styles.scene, {
            [styles.sceneSorcerer]: config.scene === 'sorcerer',
            [styles.sceneMage]: config.scene === 'mage',
            [styles.sceneWeaver]: config.scene === 'weaver',
            [styles.sceneConjurer]: config.scene === 'conjurer',
            [styles.sceneMystic]: config.scene === 'mystic',
            [styles.sceneOracle]: config.scene === 'oracle',
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
                [styles.sorcererRig]: config.scene === 'sorcerer',
                [styles.mageRig]: config.scene === 'mage',
                [styles.weaverRig]: config.scene === 'weaver',
                [styles.conjurerRig]: config.scene === 'conjurer',
                [styles.mysticRig]: config.scene === 'mystic',
                [styles.oracleRig]: config.scene === 'oracle',
              })}
              aria-hidden="true"
            >
              {config.scene === 'sorcerer' ? (
                <>
                  <span className={styles.sorcererTablet} />
                  <span className={styles.sorcererTablet} />
                  <span className={styles.sorcererTablet} />
                </>
              ) : null}

              {config.scene === 'mage' ? (
                <>
                  <span className={styles.mageSigil} />
                  <span className={styles.mageInscription} />
                  <span className={styles.mageInscription} />
                  <span className={styles.mageRune} />
                  <span className={styles.mageRune} />
                  <span className={styles.mageRune} />
                </>
              ) : null}

              {config.scene === 'weaver' ? (
                <div className={styles.weaverLoom}>
                  <div className={styles.weaverWarp}>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.weaverWeft}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className={styles.weaverShuttle} />
                </div>
              ) : null}

              {config.scene === 'conjurer' ? (
                <>
                  <span className={styles.conjurerCore} />
                  <span className={styles.conjurerTrace} />
                  <span className={styles.conjurerTrace} />
                  <span className={styles.conjurerTrace} />
                  <span className={styles.conjurerTrace} />
                </>
              ) : null}

              {config.scene === 'mystic' ? (
                <>
                  <span className={styles.mysticHalo} />
                  <div className={styles.mysticPetals}>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </>
              ) : null}

              {config.scene === 'oracle' ? (
                <>
                  <span className={styles.oracleRing} />
                  <span className={styles.oracleRing} />
                  <span className={styles.oracleDial} />
                  <span className={styles.oracleSweep} />
                  <div className={styles.oraclePips}>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.oracleTags}>
                    {config.notes.map((note) => (
                      <span key={`${themeConfig.id}-${note}`} className={styles.oracleTag}>
                        {note}
                      </span>
                    ))}
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

function createArcaneRenderer(config: ArcaneVariantConfig): LandingTitleRendererEntry {
  return {
    id: config.theme.id,
    lane: 'arcane',
    render: (props) => <ArcaneScene {...props} config={config} />,
    signalDeck: config.theme.signalDeck,
    text: config.theme.text,
    theme: config.theme,
  };
}

export const ARCANE_SHOWCASE_RENDERERS: readonly LandingTitleRendererEntry[] =
  ARCANE_VARIANTS.map(createArcaneRenderer);

export const ARCANE_SUBTITLE_RENDERERS: readonly LandingTitleRendererEntry[] = [
  ...ARCANE_SHOWCASE_RENDERERS,
];
