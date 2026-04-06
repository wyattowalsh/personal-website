'use client';

import { AnimatePresence, motion, type Transition } from 'motion/react';
import {
  Binary,
  BookOpen,
  Boxes,
  FlaskConical,
  Gem,
  Glasses,
  Heart,
  Lightbulb,
  Link,
  Lock,
  Palette,
  PenTool,
  Route,
  Satellite,
  ShieldCheck,
  TestTube,
} from 'lucide-react';
import type { CSSProperties, ReactElement } from 'react';

import styles from './crafted.module.css';
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

type CraftedLayout =
  | 'reaction-chamber'
  | 'distillation-rack'
  | 'code-crucible'
  | 'faceted-monolith'
  | 'visor-window'
  | 'stress-core'
  | 'strata-relief'
  | 'path-block'
  | 'atelier-instrument'
  | 'defense-vault'
  | 'ledger-chain'
  | 'secured-panel'
  | 'archive-manual'
  | 'assembly-tray'
  | 'perimeter-unit'
  | 'prototype-chassis';

interface CraftedPalette {
  readonly gradient: string;
  readonly darkGradient: string;
  readonly glow: string;
}

interface CraftedVariantConfig {
  readonly caption: string;
  readonly deckClass: string;
  readonly deckLabel: string;
  readonly eyebrow: string;
  readonly footer: readonly string[];
  readonly layout: CraftedLayout;
  readonly metrics: readonly string[];
  readonly panelLabel: string;
  readonly shellClass: string;
  readonly theme: SubtitleTheme;
  readonly titleClass: string;
  readonly titleLines: readonly string[];
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

function createCraftedTheme(
  id: string,
  text: string,
  family: SignalDeckMeta['family'],
  descriptor: SignalDeckMeta['descriptor'],
  palette: CraftedPalette,
  typography: Pick<
    SubtitleTheme,
    'fontFamily' | 'fontWeight' | 'letterSpacing' | 'textTransform' | 'fontStyle'
  >,
  icon: SubtitleTheme['icon'],
  iconPosition: SubtitleTheme['iconPosition'],
  iconClass: string,
  animation: Parameters<typeof theme>[6],
  effectClass: string,
) {
  return theme(
    craftedSubtitle(id, text, family, descriptor),
    palette,
    typography,
    icon,
    iconPosition,
    iconClass,
    animation,
    effectClass,
    ctr.alchemy,
    'standard',
  );
}

const SYSTEMS_ALCHEMIST_THEME = createCraftedTheme(
  'systems-alchemist',
  'systems alchemist',
  'Alchemist',
  'transmutation lab',
  {
    gradient: 'linear-gradient(45deg, #b45309, #d97706, #f59e0b)',
    darkGradient: 'linear-gradient(45deg, #fbbf24, #fcd34d, #fef08a)',
    glow: 'rgba(217, 119, 6, 0.62)',
  },
  typo.alchemist,
  FlaskConical,
  'left',
  ic.pour,
  'forgeHammer',
  fx.fire,
);

const DISTRIBUTED_SYSTEMS_ALCHEMIST_THEME = createCraftedTheme(
  'distributed-systems-alchemist',
  'distributed systems alchemist',
  'Alchemist',
  'transmutation lab',
  {
    gradient: 'linear-gradient(45deg, #78350f, #a16207, #f59e0b)',
    darkGradient: 'linear-gradient(45deg, #fde68a, #fcd34d, #fef08a)',
    glow: 'rgba(245, 158, 11, 0.6)',
  },
  { ...typo.alchemistMed, letterSpacing: '0.01em' },
  TestTube,
  'left',
  ic.bounce,
  'forgeHammer',
  fx.shimmer,
);

const CODE_ALCHEMIST_THEME = createCraftedTheme(
  'code-alchemist',
  'code alchemist',
  'Alchemist',
  'transmutation lab',
  {
    gradient: 'linear-gradient(45deg, #92400e, #d97706, #facc15)',
    darkGradient: 'linear-gradient(45deg, #fcd34d, #fde68a, #fef9c3)',
    glow: 'rgba(217, 119, 6, 0.6)',
  },
  typo.alchemistCode,
  Binary,
  'left',
  ic.none,
  'thunderExit',
  fx.typewriterLine,
);

const DIGITAL_SCULPTOR_THEME = createCraftedTheme(
  'digital-sculptor',
  'digital sculptor',
  'Sculptor',
  'tactile systems',
  {
    gradient: 'linear-gradient(180deg, #be123c, #e11d48, #fb7185)',
    darkGradient: 'linear-gradient(180deg, #fda4af, #fecdd3, #ffe4e6)',
    glow: 'rgba(244, 63, 94, 0.52)',
  },
  { ...typo.sculptor, fontWeight: 560 },
  PenTool,
  'left',
  ic.chisel,
  'sculpt3D',
  fx.fire,
);

const AUGMENTED_REALITY_SCULPTOR_THEME = createCraftedTheme(
  'augmented-reality-sculptor',
  'augmented reality sculptor',
  'Sculptor',
  'tactile systems',
  {
    gradient: 'linear-gradient(180deg, #be185d, #db2777, #f472b6)',
    darkGradient: 'linear-gradient(180deg, #f9a8d4, #fbcfe8, #fce7f3)',
    glow: 'rgba(236, 72, 153, 0.54)',
  },
  { ...typo.sculptorMed, letterSpacing: '0.045em' },
  Glasses,
  'left',
  ic.float,
  'prismFlip3D',
  fx.holographic,
);

const RESILIENCE_SCULPTOR_THEME = createCraftedTheme(
  'resilience-sculptor',
  'resilience sculptor',
  'Sculptor',
  'tactile systems',
  {
    gradient: 'linear-gradient(180deg, #9f1239, #e11d48, #f43f5e)',
    darkGradient: 'linear-gradient(180deg, #fda4af, #fecdd3, #ffe4e6)',
    glow: 'rgba(225, 29, 72, 0.5)',
  },
  { ...typo.sculptorMed, fontWeight: 500 },
  Gem,
  'left',
  ic.pulse,
  'springOvershoot',
  fx.pulseRing,
);

const INFORMATION_SCULPTOR_THEME = createCraftedTheme(
  'information-sculptor',
  'information sculptor',
  'Sculptor',
  'tactile systems',
  {
    gradient: 'linear-gradient(180deg, #ea580c, #ef4444, #ec4899)',
    darkGradient: 'linear-gradient(180deg, #fdba74, #fca5a5, #f9a8d4)',
    glow: 'rgba(239, 68, 68, 0.52)',
  },
  { ...typo.sculptor, letterSpacing: '0.04em' },
  Boxes,
  'left',
  ic.float,
  'blueprintFold',
  fx.shimmer,
);

const EXPERIENCE_SCULPTOR_THEME = createCraftedTheme(
  'experience-sculptor',
  'experience sculptor',
  'Sculptor',
  'tactile systems',
  {
    gradient: 'linear-gradient(180deg, #ea580c, #e11d48, #be185d)',
    darkGradient: 'linear-gradient(180deg, #fdba74, #fda4af, #fbcfe8)',
    glow: 'rgba(225, 29, 72, 0.52)',
  },
  { ...typo.sculptorMed, fontWeight: 450, letterSpacing: '0.06em' },
  Heart,
  'left',
  ic.pulse,
  'dreamFloat',
  fx.aurora,
);

const INTELLIGENCE_ARTISAN_THEME = createCraftedTheme(
  'intelligence-artisan',
  'intelligence artisan',
  'Artisan',
  'forged reliability',
  {
    gradient: 'linear-gradient(120deg, #92400e, #b45309, #d97706)',
    darkGradient: 'linear-gradient(120deg, #fbbf24, #f59e0b, #fcd34d)',
    glow: 'rgba(180, 83, 9, 0.52)',
  },
  { ...typo.artisan, letterSpacing: '0.035em' },
  Lightbulb,
  'left',
  ic.zap,
  'slideDown',
  fx.underline,
);

const CYBER_DEFENSE_ARTISAN_THEME = createCraftedTheme(
  'cyber-defense-artisan',
  'cyber defense artisan',
  'Artisan',
  'forged reliability',
  {
    gradient: 'linear-gradient(120deg, #dc2626, #b45309, #ea580c)',
    darkGradient: 'linear-gradient(120deg, #fca5a5, #fbbf24, #fdba74)',
    glow: 'rgba(220, 38, 38, 0.54)',
  },
  { ...typo.artisanBold, letterSpacing: '0.06em' },
  ShieldCheck,
  'left',
  ic.alarm,
  'shieldDeploy',
  fx.glitchFlicker,
);

const BLOCKCHAIN_ARTISAN_THEME = createCraftedTheme(
  'blockchain-artisan',
  'blockchain artisan',
  'Artisan',
  'forged reliability',
  {
    gradient: 'linear-gradient(120deg, #78350f, #a16207, #ca8a04)',
    darkGradient: 'linear-gradient(120deg, #fde68a, #fcd34d, #fbbf24)',
    glow: 'rgba(161, 98, 7, 0.52)',
  },
  typo.artisanMono,
  Link,
  'left',
  ic.none,
  'blueprintFold',
  fx.typewriterLine,
);

const CYBERSECURITY_ARTISAN_THEME = createCraftedTheme(
  'cybersecurity-artisan',
  'cybersecurity artisan',
  'Artisan',
  'forged reliability',
  {
    gradient: 'linear-gradient(120deg, #b91c1c, #dc2626, #f97316)',
    darkGradient: 'linear-gradient(120deg, #fca5a5, #fecaca, #fdba74)',
    glow: 'rgba(185, 28, 28, 0.54)',
  },
  typo.artisanBold,
  Lock,
  'left',
  ic.zap,
  'shieldDeploy',
  fx.scanline,
);

const KNOWLEDGE_CRAFTSMAN_THEME = createCraftedTheme(
  'knowledge-craftsman',
  'knowledge craftsman',
  'Artisan',
  'forged reliability',
  {
    gradient: 'linear-gradient(120deg, #a16207, #ca8a04, #eab308)',
    darkGradient: 'linear-gradient(120deg, #fcd34d, #fde68a, #fef9c3)',
    glow: 'rgba(202, 138, 4, 0.52)',
  },
  { ...typo.artisan, fontWeight: 560, letterSpacing: '0.04em' },
  BookOpen,
  'left',
  ic.none,
  'slideDown',
  fx.typewriterLine,
);

const EXPERIENCE_CRAFTER_THEME = createCraftedTheme(
  'experience-crafter',
  'experience crafter',
  'Crafter',
  'living systems',
  {
    gradient: 'linear-gradient(150deg, #059669, #10b981, #34d399)',
    darkGradient: 'linear-gradient(150deg, #6ee7b7, #a7f3d0, #bbf7d0)',
    glow: 'rgba(16, 185, 129, 0.52)',
  },
  { ...typo.crafter, fontWeight: 540, letterSpacing: '0.05em' },
  Palette,
  'right',
  ic.bounce,
  'growSeed',
  fx.shimmer,
);

const EDGE_SYSTEMS_CRAFTER_THEME = createCraftedTheme(
  'edge-systems-crafter',
  'edge systems crafter',
  'Crafter',
  'living systems',
  {
    gradient: 'linear-gradient(150deg, #047857, #0d9488, #0891b2)',
    darkGradient: 'linear-gradient(150deg, #6ee7b7, #5eead4, #67e8f9)',
    glow: 'rgba(13, 148, 136, 0.52)',
  },
  { ...typo.crafter, letterSpacing: '0.055em' },
  Route,
  'right',
  ic.compassLock,
  'slideRight',
  fx.underline,
);

const FUTURE_SYSTEMS_CRAFTER_THEME = createCraftedTheme(
  'future-systems-crafter',
  'future systems crafter',
  'Crafter',
  'living systems',
  {
    gradient: 'linear-gradient(150deg, #16a34a, #22c55e, #84cc16)',
    darkGradient: 'linear-gradient(150deg, #86efac, #bbf7d0, #d9f99d)',
    glow: 'rgba(34, 197, 94, 0.52)',
  },
  { ...typo.crafter, letterSpacing: '0.065em' },
  Satellite,
  'right',
  ic.drift,
  'growSeed',
  fx.aurora,
);

const CRAFTED_ALCHEMIST_VARIANTS: readonly CraftedVariantConfig[] = [
  {
    caption: 'A reaction chamber with vented seams and furnace instrumentation for recasting systems under pressure.',
    deckClass: styles.deckAssay,
    deckLabel: 'assay strip',
    eyebrow: 'reaction bench',
    footer: ['vented seams', 'control tag'],
    layout: 'reaction-chamber',
    metrics: ['heat sync', 'fusion ready', 'assay live'],
    panelLabel: 'reaction chamber',
    shellClass: styles.shellReaction,
    theme: SYSTEMS_ALCHEMIST_THEME,
    titleClass: styles.titleReaction,
    titleLines: ['systems', 'alchemist'],
  },
  {
    caption: 'A lateral rack of linked vessels so the long phrase reads like topology first and operator mark second.',
    deckClass: styles.deckTopology,
    deckLabel: 'topology strip',
    eyebrow: 'state exchange rack',
    footer: ['paired chambers', 'merge conduit'],
    layout: 'distillation-rack',
    metrics: ['replicas', 'handoff', 'consensus'],
    panelLabel: 'networked distillation',
    shellClass: styles.shellDistillation,
    theme: DISTRIBUTED_SYSTEMS_ALCHEMIST_THEME,
    titleClass: styles.titleDistributed,
    titleLines: ['distributed systems', 'alchemist'],
  },
  {
    caption: 'An etched terminal slab with compile gutters and catalyst rails rather than a generic molten plaque.',
    deckClass: styles.deckCommand,
    deckLabel: 'build header',
    eyebrow: 'compile crucible',
    footer: ['token crucible', 'cursor catalyst'],
    layout: 'code-crucible',
    metrics: ['parse', 'refine', 'emit'],
    panelLabel: 'terminal slab',
    shellClass: styles.shellCode,
    theme: CODE_ALCHEMIST_THEME,
    titleClass: styles.titleCode,
    titleLines: ['code alchemist'],
  },
];

const CRAFTED_SCULPTOR_VARIANTS: readonly CraftedVariantConfig[] = [
  {
    caption: 'A carved digital block with removed volume, visible facets, and a tool notch that makes the work feel cut.',
    deckClass: styles.deckMonolith,
    deckLabel: 'engraved inset',
    eyebrow: 'faceted block',
    footer: ['subtractive cut', 'tool path'],
    layout: 'faceted-monolith',
    metrics: ['mass', 'plane', 'bevel'],
    panelLabel: 'monolith study',
    shellClass: styles.shellMonolith,
    theme: DIGITAL_SCULPTOR_THEME,
    titleClass: styles.titleMonolith,
    titleLines: ['digital', 'sculptor'],
  },
  {
    caption: 'A visor-like HUD window with depth brackets and projected guides so the long phrase feels native to spatial tooling.',
    deckClass: styles.deckVisor,
    deckLabel: 'depth readout',
    eyebrow: 'spatial visor',
    footer: ['overlay guides', 'depth lock'],
    layout: 'visor-window',
    metrics: ['anchors', 'planes', 'align'],
    panelLabel: 'projected build plane',
    shellClass: styles.shellVisor,
    theme: AUGMENTED_REALITY_SCULPTOR_THEME,
    titleClass: styles.titleVisor,
    titleLines: ['augmented reality', 'sculptor'],
  },
  {
    caption: 'A pressure-tested core with contour rings and durability marks instead of another soft premium sculptor plate.',
    deckClass: styles.deckStress,
    deckLabel: 'durability strip',
    eyebrow: 'stress contour',
    footer: ['shock tuned', 'fracture control'],
    layout: 'stress-core',
    metrics: ['load', 'rebound', 'settle'],
    panelLabel: 'resilience core',
    shellClass: styles.shellResilience,
    theme: RESILIENCE_SCULPTOR_THEME,
    titleClass: styles.titleResilience,
    titleLines: ['resilience', 'sculptor'],
  },
  {
    caption: 'A stacked relief of carved data slabs so the phrase reads as information made tactile instead of merely diagrammed.',
    deckClass: styles.deckRelief,
    deckLabel: 'stack index',
    eyebrow: 'cutaway strata',
    footer: ['layered relief', 'contour legend'],
    layout: 'strata-relief',
    metrics: ['strata', 'index', 'shape'],
    panelLabel: 'topography model',
    shellClass: styles.shellRelief,
    theme: INFORMATION_SCULPTOR_THEME,
    titleClass: styles.titleRelief,
    titleLines: ['information', 'sculptor'],
  },
  {
    caption: 'A warmer shaped object with touch grooves and experience traces, grounded in form instead of bloom-only softness.',
    deckClass: styles.deckErgo,
    deckLabel: 'path band',
    eyebrow: 'touch path',
    footer: ['groove map', 'ergonomic arc'],
    layout: 'path-block',
    metrics: ['warmth', 'flow', 'touch'],
    panelLabel: 'felt surface',
    shellClass: styles.shellExperience,
    theme: EXPERIENCE_SCULPTOR_THEME,
    titleClass: styles.titleExperience,
    titleLines: ['experience', 'sculptor'],
  },
];

const CRAFTED_ARTISAN_VARIANTS: readonly CraftedVariantConfig[] = [
  {
    caption: 'An atelier instrument with measured joints, brass cues, and a visible maker stamp for crafted cognition.',
    deckClass: styles.deckAtelier,
    deckLabel: 'maker docket',
    eyebrow: 'atelier instrument',
    footer: ['measured joints', 'insight mark'],
    layout: 'atelier-instrument',
    metrics: ['calibrate', 'refine', 'finish'],
    panelLabel: 'atelier brasswork',
    shellClass: styles.shellAtelier,
    theme: INTELLIGENCE_ARTISAN_THEME,
    titleClass: styles.titleAtelier,
    titleLines: ['intelligence', 'artisan'],
  },
  {
    caption: 'A hardened field vault with tamper compartments and a tighter artisan-built defensive signature.',
    deckClass: styles.deckVault,
    deckLabel: 'hardened strip',
    eyebrow: 'sealed defense kit',
    footer: ['tamper seals', 'latch logic'],
    layout: 'defense-vault',
    metrics: ['seal', 'route', 'contain'],
    panelLabel: 'field instrument vault',
    shellClass: styles.shellDefenseVault,
    theme: CYBER_DEFENSE_ARTISAN_THEME,
    titleClass: styles.titleDefense,
    titleLines: ['cyber defense', 'artisan'],
  },
  {
    caption: 'A serialized chain of fabricated blocks so the ledger metaphor reads structurally, not just as a flatter blueprint.',
    deckClass: styles.deckLedger,
    deckLabel: 'hash strip',
    eyebrow: 'linked modules',
    footer: ['block count', 'chain welds'],
    layout: 'ledger-chain',
    metrics: ['hash', 'link', 'ledger'],
    panelLabel: 'serialized plates',
    shellClass: styles.shellBlockchain,
    theme: BLOCKCHAIN_ARTISAN_THEME,
    titleClass: styles.titleLedger,
    titleLines: ['blockchain', 'artisan'],
  },
  {
    caption: 'A composed secured panel for the reduced-motion state, keeping the strong vault posture without frozen scanner residue.',
    deckClass: styles.deckSecure,
    deckLabel: 'control strip',
    eyebrow: 'lockwork panel',
    footer: ['perimeter status', 'seal engaged'],
    layout: 'secured-panel',
    metrics: ['scan', 'verify', 'hold'],
    panelLabel: 'secured perimeter',
    shellClass: styles.shellCybersecurity,
    theme: CYBERSECURITY_ARTISAN_THEME,
    titleClass: styles.titleSecure,
    titleLines: ['cybersecurity', 'artisan'],
  },
  {
    caption: 'A crafted volume with page-edge strata and archival catalog marks to make the knowledge metaphor more material.',
    deckClass: styles.deckArchive,
    deckLabel: 'library tab',
    eyebrow: 'bound manual',
    footer: ['catalog mark', 'engraved plate'],
    layout: 'archive-manual',
    metrics: ['bind', 'archive', 'pass down'],
    panelLabel: 'workshop volume',
    shellClass: styles.shellArchive,
    theme: KNOWLEDGE_CRAFTSMAN_THEME,
    titleClass: styles.titleArchive,
    titleLines: ['knowledge', 'craftsman'],
  },
];

const CRAFTED_CRAFTER_VARIANTS: readonly CraftedVariantConfig[] = [
  {
    caption: 'An assembly tray with visible slots and recipe seams so the experience feels composed piece by piece.',
    deckClass: styles.deckAssembly,
    deckLabel: 'recipe strip',
    eyebrow: 'assembly tray',
    footer: ['join seams', 'palette tools'],
    layout: 'assembly-tray',
    metrics: ['story', 'touchpoint', 'tone'],
    panelLabel: 'component build',
    shellClass: styles.shellAssembly,
    theme: EXPERIENCE_CRAFTER_THEME,
    titleClass: styles.titleAssembly,
    titleLines: ['experience', 'crafter'],
  },
  {
    caption: 'A portable edge unit with perimeter beacons and localized routing marks instead of a generic green horizon card.',
    deckClass: styles.deckEdge,
    deckLabel: 'node strip',
    eyebrow: 'perimeter unit',
    footer: ['beacon path', 'localized route'],
    layout: 'perimeter-unit',
    metrics: ['field', 'route', 'deploy'],
    panelLabel: 'boundary fabrication',
    shellClass: styles.shellEdge,
    theme: EDGE_SYSTEMS_CRAFTER_THEME,
    titleClass: styles.titleEdge,
    titleLines: ['edge systems', 'crafter'],
  },
  {
    caption: 'A next-build chassis with version marks, prototype rails, and unfinished edges that signal fabrication in progress.',
    deckClass: styles.deckPrototype,
    deckLabel: 'prototype tag',
    eyebrow: 'next-build chassis',
    footer: ['version marks', 'future fit'],
    layout: 'prototype-chassis',
    metrics: ['spec', 'prototype', 'iterate'],
    panelLabel: 'forward assembly',
    shellClass: styles.shellPrototype,
    theme: FUTURE_SYSTEMS_CRAFTER_THEME,
    titleClass: styles.titlePrototype,
    titleLines: ['future systems', 'crafter'],
  },
];

export const CRAFTED_ALCHEMIST_THEMES: SubtitleTheme[] = CRAFTED_ALCHEMIST_VARIANTS.map(({ theme }) => theme);
export const CRAFTED_SCULPTOR_THEMES: SubtitleTheme[] = CRAFTED_SCULPTOR_VARIANTS.map(({ theme }) => theme);
export const CRAFTED_ARTISAN_THEMES: SubtitleTheme[] = CRAFTED_ARTISAN_VARIANTS.map(({ theme }) => theme);
export const CRAFTED_CRAFTER_THEMES: SubtitleTheme[] = CRAFTED_CRAFTER_VARIANTS.map(({ theme }) => theme);

export const CRAFTED_SUBTITLE_THEMES: SubtitleTheme[] = [
  ...CRAFTED_ALCHEMIST_THEMES,
  ...CRAFTED_SCULPTOR_THEMES,
  ...CRAFTED_ARTISAN_THEMES,
  ...CRAFTED_CRAFTER_THEMES,
];

function withAlpha(color: string, alpha: number): string {
  return color.replace(/([\d.]+)\)\s*$/, `${alpha})`);
}

function createStyleVars(themeConfig: SubtitleTheme, isDark: boolean): CSSProperties {
  return {
    '--crafted-gradient': isDark ? themeConfig.darkGradient : themeConfig.gradient,
    '--crafted-glow': themeConfig.glow,
    '--crafted-glow-soft': withAlpha(themeConfig.glow, isDark ? 0.24 : 0.14),
    '--crafted-glow-strong': withAlpha(themeConfig.glow, isDark ? 0.58 : 0.32),
    '--crafted-edge': withAlpha(themeConfig.glow, isDark ? 0.36 : 0.2),
    '--crafted-shadow': isDark
      ? `0 22px 54px ${withAlpha(themeConfig.glow, 0.2)}`
      : `0 16px 36px ${withAlpha(themeConfig.glow, 0.14)}`,
    '--crafted-panel': isDark ? 'rgba(12, 13, 18, 0.9)' : 'rgba(255, 251, 245, 0.94)',
    '--crafted-panel-strong': isDark ? 'rgba(24, 23, 30, 0.94)' : 'rgba(247, 241, 232, 0.96)',
    '--crafted-text': isDark ? 'rgba(248, 250, 252, 0.98)' : 'rgba(41, 37, 36, 0.96)',
    '--crafted-muted': isDark ? 'rgba(214, 211, 209, 0.72)' : 'rgba(87, 83, 78, 0.78)',
  } as CSSProperties;
}

interface ShellMotion {
  readonly animate: Record<string, number | string | number[]>;
  readonly exit: Record<string, number | string | number[]>;
  readonly initial: Record<string, number | string | number[]>;
  readonly transition: Transition;
}

function getShellMotion(layout: CraftedLayout): ShellMotion {
  switch (layout) {
    case 'distillation-rack':
      return {
        initial: { opacity: 0, x: -18, scaleX: 0.96 },
        animate: { opacity: 1, x: 0, scaleX: 1 },
        exit: { opacity: 0, x: 18, scaleX: 1.02 },
        transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
      };
    case 'code-crucible':
      return {
        initial: { opacity: 0, y: 18, rotateX: 12 },
        animate: { opacity: 1, y: 0, rotateX: 0 },
        exit: { opacity: 0, y: -18, rotateX: -10 },
        transition: { duration: 0.44, ease: [0.16, 1, 0.3, 1] },
      };
    case 'visor-window':
    case 'prototype-chassis':
      return {
        initial: { opacity: 0, y: 20, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -16, scale: 1.02 },
        transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
      };
    case 'stress-core':
    case 'faceted-monolith':
      return {
        initial: { opacity: 0, y: 24, scale: 0.94 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -18, scale: 1.03 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      };
    default:
      return {
        initial: { opacity: 0, y: 16, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -16, scale: 1.01 },
        transition: { duration: 0.46, ease: [0.22, 1, 0.36, 1] },
      };
  }
}

function CraftedIcon({
  animated,
  className,
  themeConfig,
}: {
  animated: boolean;
  className?: string;
  themeConfig: SubtitleTheme;
}) {
  const Icon = themeConfig.icon;
  const iconNode = (
    <span className={cn(styles.iconFrame, className)} aria-hidden="true">
      <Icon className={styles.iconGlyph} />
    </span>
  );

  if (!animated) {
    return iconNode;
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.84, rotate: 6 }}
      transition={{ duration: 0.34, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      {iconNode}
    </motion.span>
  );
}

function renderMetricRail(items: readonly string[], className?: string) {
  return (
    <div className={cn(styles.metricRail, className)} aria-hidden="true">
      {items.map((item) => (
        <span key={`${className ?? 'metric'}-${item}`} className={styles.metricChip}>
          {item}
        </span>
      ))}
    </div>
  );
}

function renderFooterRail(items: readonly string[], className?: string) {
  return (
    <div className={cn(styles.footerRail, className)} aria-hidden="true">
      {items.map((item) => (
        <span key={`${className ?? 'footer'}-${item}`} className={styles.footerItem}>
          {item}
        </span>
      ))}
    </div>
  );
}

function renderTitle(
  config: CraftedVariantConfig,
  animated: boolean,
  highlightFromRight = false,
) {
  return (
    <div className={cn(styles.titleStack, config.titleClass)}>
      {config.titleLines.map((line, lineIndex) => {
        if (!animated) {
          return (
            <span key={`${config.theme.id}-${line}`} className={styles.titleLineFrame}>
              <span className={styles.titleLineStatic}>{line}</span>
            </span>
          );
        }

        return (
          <span key={`${config.theme.id}-${line}`} className={styles.titleLineFrame}>
            <motion.span
              className={styles.titleLineMotion}
              initial={{
                opacity: 0,
                x: highlightFromRight ? 18 : -18,
                y: lineIndex * 4,
                filter: 'blur(4px)',
              }}
              animate={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: highlightFromRight ? -14 : 14, y: -6, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, delay: lineIndex * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {line.split(' ').map((word) => (
                <span key={`${config.theme.id}-${line}-${word}`} className={styles.titleWord}>
                  {word}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </div>
  );
}

function renderVariantLayout(config: CraftedVariantConfig, animated: boolean) {
  const title = renderTitle(
    config,
    animated,
    config.layout === 'distillation-rack' || config.layout === 'visor-window' || config.layout === 'prototype-chassis',
  );
  const icon = <CraftedIcon animated={animated} themeConfig={config.theme} />;
  const caption = <p className={styles.caption}>{config.caption}</p>;

  switch (config.layout) {
    case 'reaction-chamber':
      return (
        <div className={styles.reactionGrid}>
          <div className={styles.instrumentColumn}>
            <span className={styles.eyebrow}>{config.eyebrow}</span>
            {icon}
            {renderMetricRail(config.metrics, styles.metricColumn)}
          </div>
          <div className={styles.reactionStage}>
            <span className={styles.panelLabel}>{config.panelLabel}</span>
            {title}
            {caption}
            {renderFooterRail(config.footer)}
          </div>
        </div>
      );
    case 'distillation-rack':
      return (
        <div className={styles.distillationGrid}>
          <div className={styles.conduitRow} aria-hidden="true">
            {config.metrics.map((item) => (
              <span key={`${config.theme.id}-${item}`} className={styles.conduitNode}>
                {item}
              </span>
            ))}
          </div>
          <div className={styles.distillationBody}>
            <div className={styles.rackCells} aria-hidden="true">
              {config.footer.map((item) => (
                <span key={`${config.theme.id}-${item}`} className={styles.rackCell}>
                  {item}
                </span>
              ))}
            </div>
            <div className={styles.distillationMain}>
              <span className={styles.panelLabel}>{config.panelLabel}</span>
              <div className={styles.inlineHero}>
                {title}
                {icon}
              </div>
              {caption}
            </div>
          </div>
        </div>
      );
    case 'code-crucible':
      return (
        <div className={styles.codeSlab}>
          <div className={styles.codeTopBar} aria-hidden="true">
            <span>{config.eyebrow}</span>
            <span>{config.panelLabel}</span>
          </div>
          <div className={styles.codeWindow}>
            <div className={styles.codeGutter} aria-hidden="true">
              {config.metrics.map((_, index) => (
                <span key={`${config.theme.id}-line-${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
              ))}
            </div>
            <div className={styles.codeColumn}>
              {title}
              {renderMetricRail(config.metrics, styles.tokenMatrix)}
              {caption}
              <div className={styles.hashRail} aria-hidden="true">
                {config.footer.map((item) => (
                  <span key={`${config.theme.id}-${item}`} className={styles.token}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
            {icon}
          </div>
        </div>
      );
    case 'faceted-monolith':
      return (
        <div className={styles.monolithGrid}>
          <div className={styles.monolithFace}>
            <span className={styles.panelLabel}>{config.panelLabel}</span>
            {title}
            {caption}
          </div>
          <div className={styles.notchRail}>
            {icon}
            {renderMetricRail(config.metrics, styles.metricColumn)}
          </div>
          {renderFooterRail(config.footer)}
        </div>
      );
    case 'visor-window':
      return (
        <div className={styles.visorGrid}>
          <div className={styles.hudChrome} aria-hidden="true">
            {config.metrics.map((item) => (
              <span key={`${config.theme.id}-${item}`} className={styles.hudMarker}>
                {item}
              </span>
            ))}
          </div>
          <div className={styles.visorStage}>
            <div className={styles.hudTitle}>
              <span className={styles.panelLabel}>{config.panelLabel}</span>
              {title}
              {caption}
            </div>
            {icon}
          </div>
          {renderFooterRail(config.footer)}
        </div>
      );
    case 'stress-core':
      return (
        <div className={styles.stressGrid}>
          <div>
            <span className={styles.panelLabel}>{config.panelLabel}</span>
            {title}
            {caption}
            {renderFooterRail(config.footer)}
          </div>
          <div className={styles.stressCore} aria-hidden="true">
            <span className={styles.stressRing} />
            {icon}
            {renderMetricRail(config.metrics, styles.metricColumn)}
          </div>
        </div>
      );
    case 'strata-relief':
      return (
        <div className={styles.strataRelief}>
          <span className={styles.panelLabel}>{config.panelLabel}</span>
          <div className={styles.strataBands} aria-hidden="true">
            {config.metrics.map((item) => (
              <span key={`${config.theme.id}-${item}`} className={styles.strataBand}>
                {item}
              </span>
            ))}
          </div>
          {title}
          {caption}
          {renderFooterRail(config.footer)}
        </div>
      );
    case 'path-block':
      return (
        <div className={styles.experienceBlock}>
          <div className={styles.pathTrace} aria-hidden="true">
            {config.metrics.map((item) => (
              <span key={`${config.theme.id}-${item}`} className={styles.curveNode}>
                {item}
              </span>
            ))}
          </div>
          <div className={styles.inlineHero}>
            {title}
            {icon}
          </div>
          {caption}
          {renderFooterRail(config.footer)}
        </div>
      );
    case 'atelier-instrument':
      return (
        <div className={styles.atelierGrid}>
          <div className={styles.atelierGauge} aria-hidden="true">
            {icon}
            <span className={styles.insightStamp}>{config.metrics[0]}</span>
          </div>
          <div>
            <span className={styles.panelLabel}>{config.panelLabel}</span>
            {title}
            {caption}
            {renderMetricRail(config.metrics.slice(1))}
            {renderFooterRail(config.footer)}
          </div>
        </div>
      );
    case 'defense-vault':
      return (
        <div className={styles.vaultGrid}>
          <div className={styles.vaultCell}>
            <span className={styles.panelLabel}>{config.panelLabel}</span>
            {title}
            {caption}
          </div>
          <div className={styles.vaultCell}>
            {icon}
            {renderMetricRail(config.metrics, styles.metricColumn)}
            {renderFooterRail(config.footer)}
          </div>
        </div>
      );
    case 'ledger-chain':
      return (
        <div className={styles.ledgerGrid}>
          <div className={styles.ledgerBlocks} aria-hidden="true">
            {config.metrics.map((item) => (
              <span key={`${config.theme.id}-${item}`} className={styles.ledgerBlock}>
                {item}
              </span>
            ))}
          </div>
          <div className={styles.inlineHero}>
            {title}
            {icon}
          </div>
          {caption}
          {renderFooterRail(config.footer)}
        </div>
      );
    case 'secured-panel':
      return (
        <div className={styles.secureGrid}>
          <div className={styles.securePanelTop}>
            {icon}
            <div>
              <span className={styles.panelLabel}>{config.panelLabel}</span>
              {title}
            </div>
            <div className={styles.secureStatus} aria-hidden="true">
              {config.metrics.map((item) => (
                <span key={`${config.theme.id}-${item}`} className={styles.metricChip}>
                  {item}
                </span>
              ))}
            </div>
          </div>
          {caption}
          {renderFooterRail(config.footer)}
        </div>
      );
    case 'archive-manual':
      return (
        <div className={styles.manualGrid}>
          <div className={styles.spineRail} aria-hidden="true">
            {config.metrics.map((item) => (
              <span key={`${config.theme.id}-${item}`} className={styles.metricChip}>
                {item}
              </span>
            ))}
          </div>
          <div className={styles.pageStack}>
            <div className={styles.inlineHero}>
              {title}
              {icon}
            </div>
            <span className={styles.panelLabel}>{config.panelLabel}</span>
            {caption}
            {renderFooterRail(config.footer)}
          </div>
        </div>
      );
    case 'assembly-tray':
      return (
        <div className={styles.assemblyGrid}>
          <span className={styles.panelLabel}>{config.panelLabel}</span>
          {title}
          <div className={styles.traySlots} aria-hidden="true">
            {[...config.metrics, ...config.footer].map((item) => (
              <span key={`${config.theme.id}-${item}`} className={styles.traySlot}>
                {item}
              </span>
            ))}
          </div>
          {caption}
        </div>
      );
    case 'perimeter-unit':
      return (
        <div className={styles.perimeterGrid}>
          <div className={styles.perimeterBand} aria-hidden="true">
            {config.metrics.map((item) => (
              <span key={`${config.theme.id}-${item}`} className={styles.perimeterNode}>
                {item}
              </span>
            ))}
          </div>
          <div className={styles.inlineHero}>
            {title}
            {icon}
          </div>
          {caption}
          {renderFooterRail(config.footer)}
        </div>
      );
    case 'prototype-chassis':
      return (
        <div className={styles.prototypeGrid}>
          <div className={styles.prototypeHeader} aria-hidden="true">
            <span className={styles.protoMark}>{config.eyebrow}</span>
            <span className={styles.panelLabel}>{config.panelLabel}</span>
            <span className={styles.protoMark}>{config.metrics[0]}</span>
          </div>
          <div className={styles.inlineHero}>
            {title}
            {icon}
          </div>
          <div className={styles.chassisRail} aria-hidden="true">
            {[...config.metrics.slice(1), ...config.footer].map((item) => (
              <span key={`${config.theme.id}-${item}`} className={styles.metricChip}>
                {item}
              </span>
            ))}
          </div>
          {caption}
        </div>
      );
    default:
      return null;
  }
}

function renderDeck(
  config: CraftedVariantConfig,
  positionLabel: string,
  totalLabel: string,
) {
  return (
    <div className={cn(styles.deck, config.deckClass)} aria-hidden="true">
      <div className={styles.deckLeading}>
        <span className={styles.deckBadge}>
          <span className={styles.deckSwatch} />
          {config.theme.signalDeck.family}
        </span>
        <span className={styles.deckLabel}>{config.deckLabel}</span>
      </div>
      <span className={styles.deckDescriptor}>{config.theme.signalDeck.descriptor}</span>
      <span className={styles.deckCounter}>
        {positionLabel}
        <span className={styles.deckCounterTotal}>/ {totalLabel}</span>
      </span>
    </div>
  );
}

function CraftedSubtitleRenderer({
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
}: SubtitleRendererShellProps & { config: CraftedVariantConfig }) {
  const animated = context.shouldAnimateTagline && !context.prefersReducedMotion;
  const styleVars = createStyleVars(config.theme, context.isDark);
  const shellMotion = getShellMotion(config.layout);
  const shellClassName = cn(styles.shell, config.shellClass, context.compact && styles.compactShell);
  const shellContent = (
    <>
      <span className={styles.shellBackdrop} aria-hidden="true" />
      <span className={styles.shellGlow} aria-hidden="true" />
      <div className={styles.shellInner}>{renderVariantLayout(config, animated)}</div>
    </>
  );

  return (
    <div
      className={cn(styles.root, context.compact && styles.compactRoot)}
      data-motion-mode={animated ? 'animated' : 'reduced'}
      onMouseEnter={animated ? onMouseEnter : undefined}
      onMouseLeave={animated ? onMouseLeave : undefined}
      style={styleVars}
    >
      {!hideSignalDeck ? renderDeck(config, positionLabel, totalLabel) : null}

      <div
        tabIndex={0}
        role="group"
        aria-label={`${config.theme.text}. ${config.theme.signalDeck.family} family, ${config.theme.signalDeck.descriptor}. ${rotationStatusLabel}`}
        className={styles.focusFrame}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {!animated ? (
          <section className={shellClassName}>{shellContent}</section>
        ) : (
          <AnimatePresence mode="wait">
            <motion.section
              key={config.theme.id}
              className={shellClassName}
              initial={shellMotion.initial}
              animate={shellMotion.animate}
              exit={shellMotion.exit}
              transition={shellMotion.transition}
            >
              {shellContent}
            </motion.section>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function createCraftedRenderer(config: CraftedVariantConfig): LandingTitleRendererEntry {
  return {
    id: config.theme.id,
    lane: config.theme.lane,
    render: (props): ReactElement => <CraftedSubtitleRenderer {...props} config={config} />,
    signalDeck: config.theme.signalDeck,
    text: config.theme.text,
    theme: config.theme,
  };
}

export const CRAFTED_ALCHEMIST_RENDERERS: readonly LandingTitleRendererEntry[] =
  CRAFTED_ALCHEMIST_VARIANTS.map(createCraftedRenderer);

export const CRAFTED_SCULPTOR_RENDERERS: readonly LandingTitleRendererEntry[] =
  CRAFTED_SCULPTOR_VARIANTS.map(createCraftedRenderer);

export const CRAFTED_ARTISAN_RENDERERS: readonly LandingTitleRendererEntry[] =
  CRAFTED_ARTISAN_VARIANTS.map(createCraftedRenderer);

export const CRAFTED_CRAFTER_RENDERERS: readonly LandingTitleRendererEntry[] =
  CRAFTED_CRAFTER_VARIANTS.map(createCraftedRenderer);

export const CRAFTED_RENDERERS: readonly LandingTitleRendererEntry[] = [
  ...CRAFTED_ALCHEMIST_RENDERERS,
  ...CRAFTED_SCULPTOR_RENDERERS,
  ...CRAFTED_ARTISAN_RENDERERS,
  ...CRAFTED_CRAFTER_RENDERERS,
];

export const CRAFTED_SUBTITLE_RENDERERS: readonly LandingTitleRendererEntry[] = CRAFTED_RENDERERS;
