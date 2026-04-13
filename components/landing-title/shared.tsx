'use client';

import { AnimatePresence, motion, type TargetAndTransition, type Transition } from 'motion/react';
import type { FocusEvent, ReactElement } from 'react';
import type { LucideIcon } from 'lucide-react';

import styles from './subtitle.module.css';
import type { SignalDeckMeta } from '@/lib/landing-title-sequence';
import { cn } from '@/lib/utils';

export interface LandingTitleRendererContext {
  compact: boolean;
  isDark: boolean;
  prefersReducedMotion: boolean;
  shouldAnimateTagline: boolean;
  showName: boolean;
  wordIndex: number;
}

export interface SubtitleRendererShellProps {
  context: LandingTitleRendererContext;
  hideSignalDeck: boolean;
  onBlur: (event: FocusEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  positionLabel: string;
  rotationStatusLabel: string;
  totalLabel: string;
}

export type SubtitleLane = 'systems' | 'arcane' | 'crafted' | 'performance';

// ─── Types ────────────────────────────────────────────────────────────────────

type RenderMode =
  | 'standard'
  | 'typewriter'
  | 'wave'
  | 'cascade'
  | 'morphText'
  | 'reveal'
  | 'split';

interface IconMotionMeta {
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  exit?: TargetAndTransition;
  transition?: Transition;
}

interface RenderMeta {
  stagger?: number;
  segmentMode?: 'char' | 'word';
  revealDirection?: 'left' | 'right';
  revealSkew?: number;
  waveLift?: number;
  cascadeDistance?: number;
  splitDistance?: number;
}

interface WordTheme {
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
  iconMotion?: IconMotionMeta;
  iconWrapperClass?: string;
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition: Transition;
  effectClass: string;
  renderMode: RenderMode;
  renderMeta?: RenderMeta;
  containerBorder: string;
  containerShadow: string;
  containerClass?: string;
  containerBackground?: string;
  containerRadius?: string;
  shellClass?: string;
  ambientClass?: string;
  ornament?: string;
  ornamentClass?: string;
  iconBadgeClass?: string;
  textClass?: string;
  contentClass?: string;
}

// ─── Animation presets — CRANKED UP ──────────────────────────────────────────

const anim = {
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } as Transition,
  },
  slideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
    transition: { duration: 0.35, type: "spring" as const, stiffness: 400, damping: 18 } as Transition,
  },
  slideLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } as Transition,
  },
  slideRight: {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } as Transition,
  },
  materialize: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    transition: { duration: 0.7, ease: "easeOut" } as Transition,
  },
  sculpt3D: {
    initial: { opacity: 0, rotateX: 60, y: 25 },
    animate: { opacity: 1, rotateX: 0, y: 0 },
    exit: { opacity: 0, rotateX: -60, y: -25 },
    transition: { duration: 0.5, ease: "easeInOut" } as Transition,
  },
  glitchIn: {
    initial: { opacity: 0, x: 5, skewX: 10 },
    animate: { opacity: 1, x: 0, skewX: 0 },
    exit: { opacity: 0, x: -5, skewX: -10 },
    transition: { duration: 0.25, ease: "easeOut" } as Transition,
  },
  drift: {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -25 },
    transition: { duration: 0.9, ease: "easeOut" } as Transition,
  },
  zoomBlur: {
    initial: { opacity: 0, scale: 1.32 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.7 },
    transition: { duration: 0.35, type: "spring" as const, stiffness: 300, damping: 16 } as Transition,
  },
  growSeed: {
    initial: { opacity: 0, scale: 0.3, y: 15 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.7, y: -10 },
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] } as Transition,
  },
  orchestralSwell: {
    initial: { opacity: 0, scale: 0.6 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.4 },
    transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] } as Transition,
  },
  shieldDeploy: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: { duration: 0.35, type: "spring" as const, stiffness: 350, damping: 20 } as Transition,
  },
  weave: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.8, ease: "easeInOut" } as Transition,
  },
  prismFlip3D: {
    initial: { opacity: 0, rotateX: 85, rotateY: -20, z: -40 },
    animate: { opacity: 1, rotateX: 0, rotateY: 0, z: 0 },
    exit: { opacity: 0, rotateX: -70, rotateY: 18, z: -30 },
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } as Transition,
  },
  skewSettle: {
    initial: { opacity: 0, y: 18, skewX: -18, scale: 0.92 },
    animate: { opacity: 1, y: 0, skewX: [8, -3, 0], scale: [1.03, 0.99, 1] },
    exit: { opacity: 0, y: -20, skewX: 12 },
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } as Transition,
  },
  glitchBurst: {
    initial: { opacity: 0, x: [0, 12, -8, 4], skewY: [0, 10, -6, 0] },
    animate: { opacity: 1, x: [0, -2, 2, 0], skewY: [0, -3, 2, 0] },
    exit: { opacity: 0, x: [0, -6, 10] },
    transition: { duration: 0.38, ease: 'easeOut' } as Transition,
  },
  springOvershoot: {
    initial: { opacity: 0, y: 40, scale: 0.7 },
    animate: { opacity: 1, y: 0, scale: [1.14, 0.96, 1] },
    exit: { opacity: 0, y: -30, scale: 0.8 },
    transition: { duration: 0.56, ease: [0.22, 1, 0.36, 1] } as Transition,
  },
  dreamFloat: {
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: [0, -4, 0] },
    exit: { opacity: 0, y: -34 },
    transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] } as Transition,
  },
  thunderExit: {
    initial: { opacity: 0, scale: 0.82, rotateZ: -2 },
    animate: { opacity: 1, scale: [1.08, 0.98, 1], rotateZ: [0.8, -0.4, 0] },
    exit: { opacity: 0, scale: 1.16, rotateZ: -5 },
    transition: { duration: 0.52, ease: [0.33, 1, 0.68, 1] } as Transition,
  },
  blueprintFold: {
    initial: { opacity: 0, rotateY: -78, rotateX: 22, x: -22 },
    animate: { opacity: 1, rotateY: [14, -4, 0], rotateX: [10, -2, 0], x: 0 },
    exit: { opacity: 0, rotateY: 68, rotateX: -18, x: 28 },
    transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] } as Transition,
  },
  lockdownSweep: {
    initial: { opacity: 0, scaleX: 0.48, skewX: -20, x: -18 },
    animate: { opacity: 1, scaleX: [1.1, 0.98, 1], skewX: [7, -2, 0], x: 0 },
    exit: { opacity: 0, scaleX: 0.55, skewX: 14, x: 24 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } as Transition,
  },
  auroraBloom: {
    initial: { opacity: 0, y: 30, scale: 0.88, rotateX: 20 },
    animate: { opacity: 1, y: [0, -5, 0], scale: [1.05, 0.99, 1], rotateX: [8, -2, 0] },
    exit: { opacity: 0, y: -30, scale: 1.08, rotateX: -12 },
    transition: { duration: 1.08, ease: [0.25, 0.46, 0.45, 0.94] } as Transition,
  },
  forgeHammer: {
    initial: { opacity: 0, y: 24, rotateZ: -8, scale: 0.74 },
    animate: { opacity: 1, y: [0, -3, 0], rotateZ: [4, -1, 0], scale: [1.1, 0.97, 1] },
    exit: { opacity: 0, y: -18, rotateZ: 10, scale: 0.84 },
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] } as Transition,
  },
  cartographyTilt: {
    initial: { opacity: 0, rotateX: 72, rotateZ: -5, y: 20 },
    animate: { opacity: 1, rotateX: [10, -3, 0], rotateZ: [2, -1, 0], y: 0 },
    exit: { opacity: 0, rotateX: -58, rotateZ: 6, y: -24 },
    transition: { duration: 0.62, ease: [0.2, 0.8, 0.2, 1] } as Transition,
  },
};

// ─── Theme builder ────────────────────────────────────────────────────────────

export function theme(
  identity: Pick<WordTheme, 'id' | 'lane' | 'text' | 'signalDeck'>,
  colors: { gradient: string; darkGradient: string; glow: string },
  typo: Pick<WordTheme, 'fontFamily' | 'fontWeight' | 'letterSpacing' | 'textTransform' | 'fontStyle'>,
  icon: LucideIcon,
  iconPosition: 'left' | 'right',
  iconClass: string,
  animation: keyof typeof anim,
  effectClass: string,
  container: { border: string; shadow: string; className?: string; background?: string; radius?: string },
  renderMode: RenderMode = 'standard',
  extras: Partial<Pick<WordTheme, 'iconMotion' | 'iconWrapperClass' | 'renderMeta' | 'shellClass' | 'ambientClass' | 'ornament' | 'ornamentClass' | 'iconBadgeClass' | 'textClass' | 'contentClass'>> = {},
): WordTheme {
  return {
    id: identity.id,
    lane: identity.lane,
    text: identity.text,
    signalDeck: identity.signalDeck,
    ...colors,
    ...typo,
    icon,
    iconPosition,
    iconClass,
    ...anim[animation],
    effectClass,
    renderMode,
    containerBorder: container.border,
    containerShadow: container.shadow,
    containerClass: container.className,
    containerBackground: container.background,
    containerRadius: container.radius,
    ...extras,
  };
}

// ─── Typography presets ───────────────────────────────────────────────────────

export const typo = {
  architect:      { fontFamily: 'mono' as const, fontWeight: 550, letterSpacing: '0.11em', textTransform: 'uppercase' as const, fontStyle: 'normal' as const },
  architectCode:  { fontFamily: 'mono' as const, fontWeight: 450, letterSpacing: '0.055em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  architectBold:  { fontFamily: 'mono' as const, fontWeight: 650, letterSpacing: '0.09em', textTransform: 'uppercase' as const, fontStyle: 'normal' as const },
  architectNeural:{ fontFamily: 'mono' as const, fontWeight: 500, letterSpacing: '0.035em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  sorcerer:       { fontFamily: 'sans' as const, fontWeight: 320, letterSpacing: '0.11em', textTransform: 'none' as const, fontStyle: 'italic' as const },
  alchemist:      { fontFamily: 'sans' as const, fontWeight: 720, letterSpacing: '-0.015em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  alchemistMed:   { fontFamily: 'sans' as const, fontWeight: 640, letterSpacing: '0.015em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  alchemistCode:  { fontFamily: 'mono' as const, fontWeight: 560, letterSpacing: '0.045em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  designer:       { fontFamily: 'sans' as const, fontWeight: 420, letterSpacing: '0.13em', textTransform: 'uppercase' as const, fontStyle: 'normal' as const },
  designerMed:    { fontFamily: 'sans' as const, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  sculptor:       { fontFamily: 'sans' as const, fontWeight: 520, letterSpacing: '0.02em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  sculptorMed:    { fontFamily: 'sans' as const, fontWeight: 430, letterSpacing: '0.045em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  artisan:        { fontFamily: 'sans' as const, fontWeight: 650, letterSpacing: '0.03em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  artisanMono:    { fontFamily: 'mono' as const, fontWeight: 560, letterSpacing: '0.055em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  artisanBold:    { fontFamily: 'mono' as const, fontWeight: 650, letterSpacing: '0.07em', textTransform: 'uppercase' as const, fontStyle: 'normal' as const },
  crafter:        { fontFamily: 'sans' as const, fontWeight: 520, letterSpacing: '0.045em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  virtuoso:       { fontFamily: 'sans' as const, fontWeight: 820, letterSpacing: '-0.03em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  virtuosoBold:   { fontFamily: 'sans' as const, fontWeight: 720, letterSpacing: '-0.015em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  mage:           { fontFamily: 'mono' as const, fontWeight: 520, letterSpacing: '0.07em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  visionary:      { fontFamily: 'sans' as const, fontWeight: 260, letterSpacing: '0.15em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  visionaryItalic:{ fontFamily: 'sans' as const, fontWeight: 300, letterSpacing: '0.135em', textTransform: 'none' as const, fontStyle: 'italic' as const },
  mapper:         { fontFamily: 'mono' as const, fontWeight: 470, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontStyle: 'normal' as const },
  mapperLight:    { fontFamily: 'mono' as const, fontWeight: 430, letterSpacing: '0.075em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  orchestrator:   { fontFamily: 'sans' as const, fontWeight: 780, letterSpacing: '0.055em', textTransform: 'uppercase' as const, fontStyle: 'normal' as const },
};

// ─── Effect + icon class combos ───────────────────────────────────────────────

export const fx = {
  shimmer: styles.effectShimmer ?? '',
  scanline: styles.effectScanline ?? '',
  float: styles.effectFloat ?? '',
  underline: styles.effectUnderline ?? '',
  neon: styles.effectNeon ?? '',
  holographic: styles.effectHolographic ?? '',
  glitchFlicker: styles.effectGlitchFlicker ?? '',
  fire: styles.effectFire ?? '',
  ice: styles.effectIce ?? '',
  matrix: styles.effectMatrix ?? '',
  aurora: styles.effectAurora ?? '',
  pulseRing: styles.effectPulseRing ?? '',
  typewriterLine: styles.effectTypewriterLine ?? '',
};

export const ic = {
  spin: styles.iconSpin ?? '',
  pulse: styles.iconPulse ?? '',
  bounce: styles.iconBounce ?? '',
  float: styles.iconFloat ?? '',
  zap: styles.iconZap ?? '',
  cast: styles.iconCast ?? '',
  pour: styles.iconPour ?? '',
  compassLock: styles.iconCompassLock ?? '',
  drift: styles.iconDrift ?? '',
  alarm: styles.iconAlarm ?? '',
  orbit: styles.iconOrbit ?? '',
  chisel: styles.iconChisel ?? '',
  conduct: styles.iconConduct ?? '',
  none: '',
};

// ─── Container theme presets ──────────────────────────────────────────────────

export const ctr = {
  neural: {
    border: '1px solid rgba(56, 189, 248, 0.3)',
    shadow: '0 0 24px rgba(56, 189, 248, 0.18), inset 0 0 18px rgba(59, 130, 246, 0.08)',
    className: styles.containerNeural ?? '',
    background: 'radial-gradient(circle at 20% 50%, rgba(56,189,248,0.12), transparent 60%)',
    radius: '14px',
  },
  mystic: {
    border: '1px solid rgba(168, 85, 247, 0.34)',
    shadow: '0 0 26px rgba(168, 85, 247, 0.2), inset 0 0 20px rgba(139, 92, 246, 0.07)',
    className: styles.containerMystic ?? '',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.06))',
    radius: '16px',
  },
  alchemy: {
    border: '1px solid rgba(245, 158, 11, 0.35)',
    shadow: '0 0 24px rgba(245, 158, 11, 0.2), inset 0 0 20px rgba(217, 119, 6, 0.08)',
    className: styles.containerAlchemy ?? '',
    background: 'linear-gradient(115deg, rgba(245,158,11,0.08), rgba(234,179,8,0.05))',
    radius: '12px',
  },
  sculptor: {
    border: '1px solid rgba(244, 63, 94, 0.28)',
    shadow: '0 0 22px rgba(244, 63, 94, 0.14), inset 0 0 16px rgba(225, 29, 72, 0.06)',
    className: '',
    background: 'linear-gradient(145deg, rgba(244,63,94,0.06), rgba(251,113,133,0.04) 48%, rgba(15,23,42,0.04))',
    radius: '15px',
  },
  artisan: {
    border: '1px solid rgba(180, 83, 9, 0.28)',
    shadow: '0 0 18px rgba(180, 83, 9, 0.12), inset 0 0 14px rgba(120, 53, 15, 0.06)',
    className: '',
    background: 'linear-gradient(135deg, rgba(180,83,9,0.08), rgba(120,53,15,0.04) 52%, rgba(15,23,42,0.04))',
    radius: '12px',
  },
  precision: {
    border: '1px solid rgba(6, 182, 212, 0.25)',
    shadow: '0 0 16px rgba(6, 182, 212, 0.12)',
    className: styles.containerPrecision ?? '',
    radius: '10px',
  },
  organic: {
    border: '1px solid rgba(34, 197, 94, 0.3)',
    shadow: '0 0 20px rgba(34, 197, 94, 0.14), inset 0 0 14px rgba(16, 185, 129, 0.06)',
    className: styles.containerOrganic ?? '',
    background: 'radial-gradient(circle at 75% 25%, rgba(34,197,94,0.12), transparent 55%)',
    radius: '18px',
  },
  securityPulse: {
    border: '1px solid rgba(239, 68, 68, 0.36)',
    shadow: '0 0 28px rgba(239, 68, 68, 0.2), inset 0 0 16px rgba(220, 38, 38, 0.08)',
    className: styles.containerSecurityPulse ?? '',
    radius: '12px',
  },
  virtuosoShell: {
    border: '1px solid rgba(249, 115, 22, 0.38)',
    shadow: '0 0 30px rgba(249, 115, 22, 0.22), inset 0 0 18px rgba(234, 88, 12, 0.07)',
    className: styles.containerVirtuoso ?? '',
    radius: '14px',
  },
  visionaryHalo: {
    border: '1px solid rgba(14, 165, 233, 0.24)',
    shadow: '0 0 22px rgba(14, 165, 233, 0.14)',
    className: styles.containerVisionary ?? '',
    background: 'linear-gradient(180deg, rgba(14,165,233,0.06), rgba(99,102,241,0.04))',
    radius: '20px',
  },
  mapperGrid: {
    border: '1px solid rgba(20, 184, 166, 0.28)',
    shadow: '0 0 18px rgba(20, 184, 166, 0.12)',
    className: styles.containerMapper ?? '',
    radius: '11px',
  },
  orchestratorStage: {
    border: '1px solid rgba(168, 85, 247, 0.36)',
    shadow: '0 0 32px rgba(168, 85, 247, 0.22), inset 0 0 22px rgba(190, 24, 93, 0.07)',
    className: styles.containerOrchestrator ?? '',
    background: 'linear-gradient(135deg, rgba(147,51,234,0.08), rgba(190,24,93,0.06))',
    radius: '16px',
  },
};

export const shell = {
  blueprint: styles.shellBlueprint ?? '',
  monolith: styles.shellMonolith ?? '',
  cartography: styles.shellCartography ?? '',
  vault: styles.shellVault ?? '',
  beacon: styles.shellBeacon ?? '',
  sigil: styles.shellSigil ?? '',
  forge: styles.shellForge ?? '',
  draft: styles.shellDraft ?? '',
  bloom: styles.shellBloom ?? '',
  loom: styles.shellLoom ?? '',
  stage: styles.shellStage ?? '',
  horizon: styles.shellHorizon ?? '',
};

export const ambient = {
  circuit: styles.ambientCircuit ?? '',
  coordinates: styles.ambientCoordinates ?? '',
  sweep: styles.ambientSweep ?? '',
  pulse: styles.ambientPulse ?? '',
  rune: styles.ambientRune ?? '',
  mesh: styles.ambientMesh ?? '',
  aurora: styles.ambientAurora ?? '',
  ember: styles.ambientEmber ?? '',
  tide: styles.ambientTide ?? '',
  spectrum: styles.ambientSpectrum ?? '',
};

export const ornament = {
  brackets: styles.ornamentBrackets ?? '',
  signal: styles.ornamentSignal ?? '',
  halo: styles.ornamentHalo ?? '',
  glyph: styles.ornamentGlyph ?? '',
};

export const badge = {
  frame: styles.iconBadgeFrame ?? '',
  glyph: styles.iconBadgeGlyph ?? '',
  vault: styles.iconBadgeVault ?? '',
  spark: styles.iconBadgeSpark ?? '',
  orb: styles.iconBadgeOrb ?? '',
};

export const textTreatments = {
  compactMono: styles.subtitleTextCompactMono ?? '',
  compactSans: styles.subtitleTextCompactSans ?? '',
  wide: styles.subtitleTextWide ?? '',
  hero: styles.subtitleTextHero ?? '',
  panelWide: styles.subtitleContentWide ?? '',
};

const pillTreatments = {
  precise: styles.subtitleContentPrecise ?? '',
  airy: styles.subtitleContentAiry ?? '',
  forged: styles.subtitleContentForged ?? '',
  stage: styles.subtitleContentStage ?? '',
};

const iconTreatments = {
  large: styles.subtitleIconScaleLarge ?? '',
  compact: styles.subtitleIconScaleCompact ?? '',
};

export function surface(
  shellClass: string,
  ambientClass: string,
  iconBadgeClass: string,
  ornamentValue?: string,
  ornamentClass?: string,
): Pick<WordTheme, 'shellClass' | 'ambientClass' | 'iconBadgeClass' | 'ornament' | 'ornamentClass'> {
  return {
    shellClass,
    ambientClass,
    iconBadgeClass,
    ornament: ornamentValue,
    ornamentClass,
  };
}

export type SubtitleRenderMode = RenderMode;
export type SubtitleTheme = WordTheme;

export interface LandingTitleRendererEntry {
  readonly id: string;
  readonly lane: SubtitleLane;
  readonly render: (props: SubtitleRendererShellProps) => ReactElement;
  readonly signalDeck: SignalDeckMeta;
  readonly text: string;
  readonly theme: SubtitleTheme;
}

function getMotionUnits(text: string, segmentMode: 'char' | 'word' = 'char'): string[] {
  if (segmentMode === 'word') {
    return text.match(/\S+/g) ?? [text];
  }

  return text.split('');
}

function withAlpha(color: string, alpha: number): string {
  return color.replace(/[\d.]+\)\s*$/, `${alpha})`);
}

function createTextSeed(text: string): number {
  return Array.from(text).reduce((accumulator, character, index) => {
    return (accumulator + character.charCodeAt(0) * (index + 11)) % 9973;
  }, 0);
}

const MAX_CHOREOGRAPHY_CHARS = 52;

interface ThemeSubtitleRendererProps extends SubtitleRendererShellProps {
  signalDeck: SignalDeckMeta;
  theme: SubtitleTheme;
}

function ThemeSubtitleRenderer({
  context,
  hideSignalDeck,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  positionLabel,
  rotationStatusLabel,
  signalDeck,
  theme,
  totalLabel,
}: ThemeSubtitleRendererProps) {
  const { compact, isDark, prefersReducedMotion, shouldAnimateTagline, showName, wordIndex } = context;
  const Icon = theme.icon;
  const textSeed = createTextSeed(theme.text);

  const ctrClass = theme.containerClass ?? '';
  const isPrecise = [ctr.precision.className, ctr.mapperGrid.className, ctr.neural.className].includes(ctrClass);
  const isAiry = [ctr.mystic.className, ctr.organic.className, ctr.visionaryHalo.className].includes(ctrClass);
  const isForged = [ctr.alchemy.className, ctr.sculptor.className, ctr.artisan.className, ctr.securityPulse.className].includes(ctrClass);
  const isStage = [ctr.virtuosoShell.className, ctr.orchestratorStage.className].includes(ctrClass);
  const segmentMode = theme.renderMeta?.segmentMode ?? 'char';
  const needsReadableFoundation = ['typewriter', 'wave', 'cascade'].includes(theme.renderMode);
  const surfaceGroup = isPrecise
    ? 'precise'
    : isAiry
      ? 'airy'
      : isForged
        ? 'forged'
        : isStage
          ? 'stage'
          : 'default';
  const derivedContentClass = cn(
    theme.contentClass,
    isPrecise && pillTreatments.precise,
    isAiry && pillTreatments.airy,
    isForged && pillTreatments.forged,
    isStage && pillTreatments.stage,
  );
  const derivedIconScaleClass =
    theme.textClass?.includes(textTreatments.hero) || isStage
      ? iconTreatments.large
      : isPrecise || theme.fontFamily === 'mono'
        ? iconTreatments.compact
        : '';
  const subtitleGlow = withAlpha(theme.glow, isDark ? 0.48 : 0.34);
  const subtitleStroke = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(15, 23, 42, 0.14)';

  const gradientStyle: React.CSSProperties = {
    backgroundImage: isDark ? theme.darkGradient : theme.gradient,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextStroke: `0.012em ${subtitleStroke}`,
    textShadow: `0 0 ${isDark ? 10 : 8}px ${subtitleGlow}`,
  };

  const typographyStyle: React.CSSProperties = {
    fontFamily: theme.fontFamily === 'mono' ? 'var(--font-monaspace), monospace' : 'var(--font-bricolage), sans-serif',
    fontWeight: theme.fontWeight,
    letterSpacing: theme.letterSpacing,
    textTransform: theme.textTransform,
    fontStyle: theme.fontStyle,
  };

  const readableBaseStyle: React.CSSProperties = {
    ...typographyStyle,
    color: needsReadableFoundation
      ? isDark ? 'rgba(248, 250, 252, 0.26)' : 'rgba(15, 23, 42, 0.16)'
      : isDark ? 'rgba(248, 250, 252, 0.34)' : 'rgba(15, 23, 42, 0.22)',
    textShadow: isDark
      ? `0 0 ${needsReadableFoundation ? 8 : 9}px ${withAlpha(theme.glow, needsReadableFoundation ? 0.14 : 0.16)}`
      : `0 0 ${needsReadableFoundation ? 6 : 7}px ${withAlpha(theme.glow, needsReadableFoundation ? 0.08 : 0.1)}`,
  };

  const typographyBaseClasses = cn(
    'text-lg sm:text-xl md:text-2xl lg:text-3xl',
    'text-center leading-tight text-balance',
  );

  const typographyClasses = cn(
    typographyBaseClasses,
    theme.textClass,
    'transition-transform duration-300 ease-out',
    theme.effectClass,
  );

  const iconColor = theme.glow.replace(/[\d.]+\)$/, '0.8)');

  const renderIcon = (position: 'left' | 'right') => {
    if (theme.iconPosition !== position) {
      return null;
    }

    const iconNode = (
      <span className={cn(styles.subtitleIconBadge, theme.iconBadgeClass, derivedIconScaleClass)}>
        <Icon
          className={cn('h-5 w-5 shrink-0 sm:h-6 sm:w-6 md:h-7 md:w-7', theme.iconClass)}
          style={{ color: iconColor, filter: `drop-shadow(0 0 8px ${theme.glow})` }}
          aria-hidden="true"
        />
      </span>
    );

    if (!shouldAnimateTagline || !theme.iconMotion) {
      return <span className={theme.iconWrapperClass}>{iconNode}</span>;
    }

    return (
      <motion.span
        className={theme.iconWrapperClass}
        initial={theme.iconMotion.initial}
        animate={theme.iconMotion.animate}
        exit={theme.iconMotion.exit}
        transition={theme.iconMotion.transition}
      >
        {iconNode}
      </motion.span>
    );
  };

  const shouldRenderReadableEcho = !prefersReducedMotion && needsReadableFoundation;

  const withReadableBase = (node: React.ReactNode) => (
    <span className={styles.subtitleTextFrame}>
      {shouldRenderReadableEcho ? (
        <span
          aria-hidden="true"
          className={cn(styles.subtitleReadableEcho, typographyBaseClasses, theme.textClass)}
          style={readableBaseStyle}
        >
          {theme.text}
        </span>
      ) : null}
      <span className={styles.subtitleAnimatedText}>{node}</span>
    </span>
  );

  const renderText = () => {
    const combinedStyle = { ...gradientStyle, ...typographyStyle };
    const animatedCombinedStyle: React.CSSProperties = {
      ...combinedStyle,
      filter: 'none',
      textShadow: isDark
        ? `0 0 0.72rem ${withAlpha(theme.glow, 0.18)}`
        : `0 0 0.56rem ${withAlpha(theme.glow, 0.12)}`,
    };
    const animatedUnitStyle: React.CSSProperties = {
      ...animatedCombinedStyle,
      display: 'inline-block',
      whiteSpace: 'pre',
    };
    const choreographyWrapperStyle: React.CSSProperties = {
      display: 'inline-flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: segmentMode === 'word' ? '0.32ch' : undefined,
    };
    const motionUnits = getMotionUnits(theme.text, segmentMode);
    const canRunCharChoreo = !prefersReducedMotion && theme.text.length <= MAX_CHOREOGRAPHY_CHARS;

    if (!shouldAnimateTagline) {
      return withReadableBase(
        <span style={combinedStyle} className={typographyClasses} data-text={theme.text}>
          {theme.text}
        </span>,
      );
    }

    if (theme.renderMode === 'typewriter' && canRunCharChoreo) {
      const stagger = theme.renderMeta?.stagger ?? (segmentMode === 'word' ? 0.08 : 0.04);

      return withReadableBase(
        <motion.span style={choreographyWrapperStyle} className={typographyClasses}>
          {motionUnits.map((unit, index) => (
            <motion.span
              key={`${unit}-${index}`}
              style={animatedUnitStyle}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{
                duration: segmentMode === 'word' ? 0.28 : 0.18,
                delay: index * stagger,
                ease: 'easeOut',
              }}
            >
              {segmentMode === 'char' && unit === ' ' ? ' ' : unit}
            </motion.span>
          ))}
        </motion.span>,
      );
    }

    if (theme.renderMode === 'wave' && canRunCharChoreo) {
      const stagger = theme.renderMeta?.stagger ?? (segmentMode === 'word' ? 0.055 : 0.024);
      const waveLift = theme.renderMeta?.waveLift ?? (segmentMode === 'word' ? 10 : 7);

      return withReadableBase(
        <motion.span style={choreographyWrapperStyle} className={typographyClasses} initial={{ opacity: 0.9 }} animate={{ opacity: 1 }}>
          {motionUnits.map((unit, index) => (
            <motion.span
              key={`${unit}-${index}`}
              style={animatedUnitStyle}
              initial={{ opacity: 0, y: waveLift, rotateZ: index % 2 === 0 ? -6 : 6 }}
              animate={{
                opacity: [0.3, 1, 1],
                y: [waveLift, -waveLift * 0.6, 0],
                rotateZ: [index % 2 === 0 ? -6 : 6, index % 2 === 0 ? 3 : -3, 0],
              }}
              exit={{ opacity: 0, y: -waveLift * 0.8, rotateZ: index % 2 === 0 ? -8 : 8 }}
              transition={{ duration: 0.68, delay: index * stagger, ease: [0.22, 1, 0.36, 1] }}
            >
              {segmentMode === 'char' && unit === ' ' ? ' ' : unit}
            </motion.span>
          ))}
        </motion.span>,
      );
    }

    if (theme.renderMode === 'cascade' && canRunCharChoreo) {
      const stagger = theme.renderMeta?.stagger ?? (segmentMode === 'word' ? 0.06 : 0.018);
      const cascadeDistance = theme.renderMeta?.cascadeDistance ?? (segmentMode === 'word' ? 20 : 14);

      return withReadableBase(
        <motion.span style={choreographyWrapperStyle} className={typographyClasses}>
          {motionUnits.map((unit, index) => (
            <motion.span
              key={`${unit}-${index}`}
              style={animatedUnitStyle}
              initial={{ opacity: 0, y: -cascadeDistance, rotateX: 70, scale: 0.88 }}
              animate={{ opacity: 1, y: [0, -2, 0], rotateX: [20, -6, 0], scale: [1.06, 0.98, 1] }}
              exit={{ opacity: 0, y: cascadeDistance * 0.55, rotateX: -55, scale: 0.9 }}
              transition={{
                duration: segmentMode === 'word' ? 0.54 : 0.4,
                delay: index * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {segmentMode === 'char' && unit === ' ' ? ' ' : unit}
            </motion.span>
          ))}
        </motion.span>,
      );
    }

    if (theme.renderMode === 'reveal') {
      const revealDirection = theme.renderMeta?.revealDirection ?? 'left';
      const revealFromRight = revealDirection === 'right';
      const revealSkew = theme.renderMeta?.revealSkew ?? (revealFromRight ? -8 : 8);

      return withReadableBase(
        <motion.span
          style={{ ...animatedCombinedStyle, display: 'inline-block' }}
          className={typographyClasses}
          initial={{
            clipPath: revealFromRight ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)',
            opacity: 0.45,
            x: revealFromRight ? 20 : -20,
            skewX: revealSkew,
          }}
          animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1, x: 0, skewX: 0 }}
          exit={{
            clipPath: revealFromRight ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',
            opacity: 0,
            x: revealFromRight ? -18 : 18,
            skewX: -revealSkew,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {theme.text}
        </motion.span>,
      );
    }

    if (theme.renderMode === 'split') {
      const splitDistance = theme.renderMeta?.splitDistance ?? 18;
      const segments = theme.text.split(' ');
      const left = segments.slice(0, Math.ceil(segments.length / 2)).join(' ');
      const right = segments.slice(Math.ceil(segments.length / 2)).join(' ');

      return withReadableBase(
        <span style={{ perspective: '1000px', display: 'inline-flex', alignItems: 'center' }} className={typographyClasses}>
          <motion.span
            style={animatedUnitStyle}
            initial={{ opacity: 0, x: -splitDistance, rotateY: 28, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, x: -splitDistance * 1.2, rotateY: 32, scale: 0.92 }}
            transition={{ duration: 0.46, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {left}
          </motion.span>
          {right ? (
            <motion.span
              style={{ ...animatedUnitStyle, marginLeft: '0.35ch' }}
              initial={{ opacity: 0, x: splitDistance, rotateY: -28, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, x: splitDistance * 1.2, rotateY: -32, scale: 0.92 }}
              transition={{ duration: 0.46, ease: [0.2, 0.8, 0.2, 1], delay: 0.06 }}
            >
              {right}
            </motion.span>
          ) : null}
        </span>,
      );
    }

    if (theme.renderMode === 'morphText') {
      return withReadableBase(
        <span className={cn(typographyClasses, 'relative inline-grid')} data-text={theme.text}>
          <motion.span
            key={`prev-${wordIndex}`}
            aria-hidden="true"
            className="absolute inset-0"
            style={animatedCombinedStyle}
            initial={{ opacity: 0.18, y: 2, scale: 0.995, letterSpacing: typographyStyle.letterSpacing }}
            animate={{ opacity: 0, y: -14, scale: 1.015, letterSpacing: '0.08em' }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {theme.text}
          </motion.span>
          <motion.span
            key={`next-${wordIndex}`}
            style={animatedCombinedStyle}
            initial={{ opacity: 0, y: 10, scale: 0.985, letterSpacing: '0.08em' }}
            animate={{ opacity: 1, y: 0, scale: 1, letterSpacing: typographyStyle.letterSpacing }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {theme.text}
          </motion.span>
        </span>,
      );
    }

    return withReadableBase(
      <span style={combinedStyle} className={typographyClasses} data-text={theme.text}>
        {theme.text}
      </span>,
    );
  };

  const accentX = 16 + (textSeed % 62);
  const accentY = 14 + ((textSeed * 7) % 52);
  const sharedSignalStyle = {
    '--subtitle-shell-edge': withAlpha(theme.glow, isDark ? 0.24 : 0.14),
    '--subtitle-shell-glow-soft': withAlpha(theme.glow, isDark ? 0.16 : 0.08),
    '--subtitle-shell-glow-strong': withAlpha(theme.glow, isDark ? 0.34 : 0.17),
    '--subtitle-shell-ridge': isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.5)',
    '--subtitle-shell-shadow': isDark ? 'rgba(2, 6, 23, 0.52)' : 'rgba(15, 23, 42, 0.14)',
    '--subtitle-glow-soft': withAlpha(theme.glow, isDark ? 0.18 : 0.12),
    '--subtitle-glow-strong': withAlpha(theme.glow, isDark ? 0.34 : 0.2),
    '--subtitle-panel-edge': withAlpha(theme.glow, isDark ? 0.28 : 0.22),
    '--subtitle-panel-bg': isDark ? 'rgba(10, 16, 34, 0.72)' : 'rgba(255, 255, 255, 0.78)',
    '--subtitle-panel-bg-2': isDark ? 'rgba(18, 26, 52, 0.6)' : 'rgba(241, 245, 249, 0.62)',
    '--subtitle-badge-bg': isDark ? 'rgba(10, 16, 34, 0.88)' : 'rgba(255, 255, 255, 0.9)',
    '--subtitle-badge-border': withAlpha(theme.glow, isDark ? 0.26 : 0.18),
    '--subtitle-signal-gradient': isDark ? theme.darkGradient : theme.gradient,
    '--subtitle-signal-label': isDark ? 'rgba(226, 232, 240, 0.92)' : 'rgba(15, 23, 42, 0.82)',
    '--subtitle-signal-muted': isDark ? 'rgba(148, 163, 184, 0.82)' : 'rgba(71, 85, 105, 0.72)',
    '--subtitle-signal-surface': isDark ? 'rgba(8, 15, 32, 0.76)' : 'rgba(255, 255, 255, 0.82)',
    '--subtitle-signal-surface-2': isDark ? 'rgba(18, 26, 52, 0.62)' : 'rgba(241, 245, 249, 0.72)',
    '--subtitle-signal-accent-x': `${accentX}%`,
    '--subtitle-signal-accent-y': `${accentY}%`,
    '--subtitle-theme-outline': theme.containerBorder,
    '--subtitle-theme-panel-fill': theme.containerBackground ?? 'linear-gradient(135deg, transparent, transparent)',
    '--subtitle-theme-panel-shadow': theme.containerShadow,
  } as React.CSSProperties;
  const subtitleThemeStyle = {
    ...sharedSignalStyle,
    border: theme.containerBorder,
    boxShadow: theme.containerShadow,
    borderRadius: theme.containerRadius ?? `${12 + (textSeed % 6)}px`,
    background: 'transparent',
    transition: 'border 0.5s ease, box-shadow 0.5s ease, border-radius 0.5s ease',
  } as React.CSSProperties;
  const subtitleGlowStyle = {
    '--subtitle-glow-border-radius': isAiry ? '999px' : subtitleThemeStyle.borderRadius,
  } as React.CSSProperties;

  const subtitleInner = (
    <>
      <span className={cn(styles.subtitleAmbient, theme.ambientClass)} aria-hidden="true" />
      {theme.ornament ? (
        <span className={cn(styles.subtitleOrnament, theme.ornamentClass)} aria-hidden="true">
          {theme.ornament}
        </span>
      ) : null}
      <span className={cn('relative z-2 inline-flex items-center gap-2 sm:gap-3', styles.subtitleContent, derivedContentClass)}>
        {renderIcon('left')}
        {renderText()}
        {renderIcon('right')}
      </span>
    </>
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
        styles.subtitleDeckCluster,
      )}
      style={sharedSignalStyle}
      data-surface-group={surfaceGroup}
      onMouseEnter={!prefersReducedMotion ? onMouseEnter : undefined}
      onMouseLeave={!prefersReducedMotion ? onMouseLeave : undefined}
    >
      {!hideSignalDeck ? (
        <div className={styles.signalDeck} aria-hidden="true">
          <span className={styles.signalDeckBadge}>
            <span className={styles.signalDeckBadgeSwatch} />
            {signalDeck.family}
          </span>
          <span className={styles.signalDeckCounter}>
            {positionLabel}
            <span className={styles.signalDeckCounterTotal}>/ {totalLabel}</span>
          </span>
        </div>
      ) : null}

      <div
        tabIndex={0}
        role="group"
        aria-label={`${theme.text}. ${signalDeck.family} family. ${rotationStatusLabel}`}
        className={cn('w-full', styles.subtitleBorderGlow, styles.subtitleControl)}
        onFocus={onFocus}
        onBlur={onBlur}
        style={subtitleGlowStyle}
      >
        {!shouldAnimateTagline ? (
          <div
            aria-hidden="true"
            className={cn(
              'subtitle-container relative isolate flex min-h-[3.5rem] w-full items-center justify-center overflow-hidden px-3 py-2 sm:min-h-[4rem] sm:px-4 sm:py-2.5 md:min-h-[5rem] md:px-5 md:py-3',
              styles.subtitleShellFrame,
              theme.containerClass,
              theme.shellClass,
            )}
            style={subtitleThemeStyle}
          >
            {subtitleInner}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={theme.text}
              initial={theme.initial}
              animate={theme.animate}
              exit={theme.exit}
              transition={theme.transition}
              aria-hidden="true"
              className={cn(
                'subtitle-container relative isolate flex min-h-[3.5rem] w-full items-center justify-center overflow-hidden px-3 py-2 sm:min-h-[4rem] sm:px-4 sm:py-2.5 md:min-h-[5rem] md:px-5 md:py-3',
                styles.subtitleShellFrame,
                theme.containerClass,
                theme.shellClass,
              )}
              style={{ perspective: '1000px', transformStyle: 'preserve-3d', ...subtitleThemeStyle }}
            >
              {subtitleInner}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export function createSubtitleRenderer(theme: SubtitleTheme): LandingTitleRendererEntry {
  const signalDeck = theme.signalDeck;

  return {
    id: theme.id,
    lane: theme.lane,
    render: (props) => <ThemeSubtitleRenderer {...props} signalDeck={signalDeck} theme={theme} />,
    signalDeck,
    text: theme.text,
    theme,
  };
}
