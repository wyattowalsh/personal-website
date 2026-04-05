"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Transition, type TargetAndTransition } from "motion/react";
import { useTheme } from "next-themes";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import {
  buildRotationSequence,
  deriveSignalDeckMeta,
} from "@/lib/landing-title-sequence";
import { cn } from "@/lib/utils";
import styles from '../app/page.module.css';
import type { LucideIcon } from "lucide-react";
import {
  Atom, Binary, BookOpen, Bot, Boxes, Brain, BrainCircuit, Braces,
  Cloud, Cpu, Factory, Fingerprint, FlaskConical, Gauge,
  Gem, GitBranch, GitMerge, Glasses, Heart, Lightbulb, Link, Lock,
  Map, Moon, Music, Navigation, Palette, PenTool, Radar,
  Route, Satellite, ShieldCheck, SlidersHorizontal, Sparkles, Sprout,
  Telescope, TestTube, WandSparkles, Workflow, Zap,
} from "lucide-react";

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
  text: string;
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

function theme(
  text: string,
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
    text,
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

const typo = {
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

const fx = {
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

const ic = {
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

const ctr = {
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

const shell = {
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

const ambient = {
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

const ornament = {
  brackets: styles.ornamentBrackets ?? '',
  signal: styles.ornamentSignal ?? '',
  halo: styles.ornamentHalo ?? '',
  glyph: styles.ornamentGlyph ?? '',
};

const badge = {
  frame: styles.iconBadgeFrame ?? '',
  glyph: styles.iconBadgeGlyph ?? '',
  vault: styles.iconBadgeVault ?? '',
  spark: styles.iconBadgeSpark ?? '',
  orb: styles.iconBadgeOrb ?? '',
};

const textTreatments = {
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

function surface(
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

// ─── All 44 word themes ───────────────────────────────────────────────────────

const WORD_THEMES: WordTheme[] = [
  // ═══ ARCHITECTS — security + systems precision ═══
  theme("cybernetic architect", { gradient: "linear-gradient(135deg, #334155, #4f46e5, #0ea5e9)", darkGradient: "linear-gradient(135deg, #cbd5e1, #a5b4fc, #7dd3fc)", glow: "rgba(79, 70, 229, 0.55)" },
    typo.architect, Cpu, 'left', ic.orbit, 'glitchBurst', fx.glitchFlicker, ctr.neural, 'morphText',
    {
      ...surface(shell.monolith, ambient.circuit, badge.glyph),
      textClass: cn(textTreatments.compactMono, textTreatments.wide),
      contentClass: textTreatments.panelWide,
      iconWrapperClass: 'inline-flex',
      iconMotion: { initial: { opacity: 0, rotate: -40, scale: 0.7 }, animate: { opacity: 1, rotate: 0, scale: 1 }, transition: { duration: 0.45, ease: 'easeOut' } },
    }),
  theme("code architect", { gradient: "linear-gradient(135deg, #1e293b, #2563eb, #6366f1)", darkGradient: "linear-gradient(135deg, #e2e8f0, #93c5fd, #c4b5fd)", glow: "rgba(59, 130, 246, 0.5)" },
    { ...typo.architectCode, letterSpacing: '0.065em' }, Braces, 'left', ic.none, 'blueprintFold', fx.typewriterLine, ctr.precision, 'typewriter',
    {
      ...surface(shell.blueprint, ambient.coordinates, badge.frame, '<>', ornament.brackets),
      renderMeta: { segmentMode: 'word', stagger: 0.085 },
      iconMotion: { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3 } },
    }),
  theme("zero trust architect", { gradient: "linear-gradient(135deg, #374151, #b91c1c, #7f1d1d)", darkGradient: "linear-gradient(135deg, #cbd5e1, #fca5a5, #fecaca)", glow: "rgba(220, 38, 38, 0.56)" },
    { ...typo.architectBold, letterSpacing: '0.075em' }, Fingerprint, 'left', ic.alarm, 'lockdownSweep', fx.scanline, ctr.securityPulse, 'reveal',
    {
      ...surface(shell.vault, ambient.pulse, badge.vault),
      renderMeta: { revealDirection: 'right', revealSkew: -12 },
      textClass: textTreatments.compactMono,
      iconWrapperClass: 'inline-flex',
      iconMotion: { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3 } },
    }),
  theme("synthetic intelligence architect", { gradient: "linear-gradient(135deg, #1e1b4b, #4f46e5, #0284c7)", darkGradient: "linear-gradient(135deg, #c7d2fe, #a5b4fc, #bae6fd)", glow: "rgba(99, 102, 241, 0.58)" },
    typo.architectNeural, BrainCircuit, 'left', ic.pulse, 'prismFlip3D', fx.holographic, ctr.neural, 'morphText',
    {
      ...surface(shell.cartography, ambient.circuit, badge.glyph),
      textClass: cn(textTreatments.compactMono, textTreatments.wide),
      contentClass: textTreatments.panelWide,
      iconWrapperClass: 'inline-flex',
      iconMotion: { initial: { opacity: 0, scale: 0.7, y: 8 }, animate: { opacity: 1, scale: 1, y: 0 }, transition: { duration: 0.42 } },
    }),

  // ═══ SORCERERS / MYSTICS / CONJURERS — arcane computation ═══
  theme("data sorcerer", { gradient: "linear-gradient(270deg, #6d28d9, #8b5cf6, #d946ef)", darkGradient: "linear-gradient(270deg, #a78bfa, #c4b5fd, #f0abfc)", glow: "rgba(139, 92, 246, 0.6)" },
    { ...typo.sorcerer, letterSpacing: '0.12em' }, WandSparkles, 'right', ic.cast, 'materialize', fx.aurora, ctr.mystic, 'wave',
    {
      ...surface(shell.sigil, ambient.rune, badge.orb, '✦', ornament.halo),
      renderMeta: { waveLift: 9 },
      iconWrapperClass: 'inline-flex',
      iconMotion: { initial: { opacity: 0, y: 12, rotate: 8 }, animate: { opacity: 1, y: 0, rotate: 0 }, transition: { duration: 0.5 } },
    }),
  theme("technological conjurer", { gradient: "linear-gradient(300deg, #7e22ce, #9333ea, #d946ef)", darkGradient: "linear-gradient(300deg, #c084fc, #d8b4fe, #f5d0fe)", glow: "rgba(147, 51, 234, 0.58)" },
    { ...typo.sorcerer, fontWeight: 360, letterSpacing: '0.09em' }, Sparkles, 'right', ic.pulse, 'weave', fx.shimmer, ctr.mystic, 'morphText',
    {
      ...surface(shell.loom, ambient.rune, badge.spark),
      textClass: cn(textTreatments.compactSans, textTreatments.wide),
      contentClass: textTreatments.panelWide,
      iconWrapperClass: 'inline-flex',
    }),
  theme("innovation mystic", { gradient: "linear-gradient(270deg, #4338ca, #6366f1, #38bdf8)", darkGradient: "linear-gradient(270deg, #a5b4fc, #c7d2fe, #bae6fd)", glow: "rgba(99, 102, 241, 0.55)" },
    { ...typo.sorcerer, letterSpacing: '0.13em', fontWeight: 360 }, Lightbulb, 'right', ic.float, 'auroraBloom', fx.holographic, ctr.mystic, 'cascade',
    {
      ...surface(shell.bloom, ambient.aurora, badge.orb, '☽', ornament.halo),
      renderMeta: { segmentMode: 'word', stagger: 0.075, cascadeDistance: 22 },
      iconMotion: { initial: { opacity: 0, rotate: -16 }, animate: { opacity: 1, rotate: 0 }, transition: { duration: 0.5 } },
    }),

  // ═══ ALCHEMISTS — transmutation lab ═══
  theme("systems alchemist", { gradient: "linear-gradient(45deg, #b45309, #d97706, #f59e0b)", darkGradient: "linear-gradient(45deg, #fbbf24, #fcd34d, #fef08a)", glow: "rgba(217, 119, 6, 0.62)" },
    typo.alchemist, FlaskConical, 'left', ic.pour, 'forgeHammer', fx.fire, ctr.alchemy, 'split',
    {
      ...surface(shell.forge, ambient.ember, badge.spark, '⚗', ornament.glyph),
      renderMeta: { splitDistance: 22 },
      iconMotion: { initial: { opacity: 0, y: 8, rotate: -10 }, animate: { opacity: 1, y: 0, rotate: 0 }, transition: { duration: 0.42 } },
    }),
  theme("distributed systems alchemist", { gradient: "linear-gradient(45deg, #78350f, #a16207, #f59e0b)", darkGradient: "linear-gradient(45deg, #fde68a, #fcd34d, #fef08a)", glow: "rgba(245, 158, 11, 0.6)" },
    { ...typo.alchemistMed, letterSpacing: '0.01em' }, TestTube, 'left', ic.bounce, 'forgeHammer', fx.shimmer, ctr.alchemy, 'cascade',
    {
      ...surface(shell.blueprint, ambient.rune, badge.frame),
      renderMeta: { segmentMode: 'word', stagger: 0.055, cascadeDistance: 20 },
      textClass: cn(textTreatments.compactSans, textTreatments.wide),
      contentClass: textTreatments.panelWide,
    }),
  theme("code alchemist", { gradient: "linear-gradient(45deg, #92400e, #d97706, #facc15)", darkGradient: "linear-gradient(45deg, #fcd34d, #fde68a, #fef9c3)", glow: "rgba(217, 119, 6, 0.6)" },
    typo.alchemistCode, Binary, 'left', ic.none, 'thunderExit', fx.typewriterLine, ctr.alchemy, 'typewriter',
    {
      ...surface(shell.forge, ambient.rune, badge.glyph),
      iconWrapperClass: 'inline-flex',
    }),

  // ═══ DESIGNERS — precision + semantic motion ═══
  theme("quantum designer", { gradient: "linear-gradient(90deg, #0f766e, #14b8a6, #2dd4bf)", darkGradient: "linear-gradient(90deg, #5eead4, #99f6e4, #a7f3d0)", glow: "rgba(20, 184, 166, 0.42)" },
    { ...typo.designer, letterSpacing: '0.11em' }, Atom, 'right', ic.spin, 'slideUp', fx.holographic, ctr.precision, 'wave',
    {
      ...surface(shell.draft, ambient.mesh, badge.glyph, '[]', ornament.brackets),
    }),
  theme("ecosystem designer", { gradient: "linear-gradient(90deg, #15803d, #16a34a, #14b8a6)", darkGradient: "linear-gradient(90deg, #86efac, #bbf7d0, #5eead4)", glow: "rgba(16, 185, 129, 0.45)" },
    { ...typo.designer, fontWeight: 300 }, Sprout, 'right', ic.bounce, 'growSeed', fx.aurora, ctr.organic, 'reveal',
    {
      ...surface(shell.draft, ambient.tide, badge.frame),
      renderMeta: { revealDirection: 'left' },
    }),
  theme("behavioral designer", { gradient: "linear-gradient(90deg, #0d9488, #0ea5e9, #6366f1)", darkGradient: "linear-gradient(90deg, #5eead4, #7dd3fc, #a5b4fc)", glow: "rgba(14, 165, 233, 0.44)" },
    { ...typo.designer, letterSpacing: '0.085em' }, Brain, 'right', ic.pulse, 'slideLeft', fx.underline, ctr.precision, 'cascade',
    {
      ...surface(shell.blueprint, ambient.sweep, badge.frame),
      renderMeta: { segmentMode: 'word', stagger: 0.065, cascadeDistance: 18 },
    }),
  theme("adaptive systems designer", { gradient: "linear-gradient(90deg, #0f766e, #059669, #65a30d)", darkGradient: "linear-gradient(90deg, #5eead4, #6ee7b7, #bef264)", glow: "rgba(5, 150, 105, 0.44)" },
    { ...typo.designerMed, letterSpacing: '0.07em' }, SlidersHorizontal, 'right', ic.drift, 'skewSettle', fx.underline, ctr.precision, 'split',
    {
      ...surface(shell.draft, ambient.sweep, badge.glyph, '⋯', ornament.brackets),
      textClass: cn(textTreatments.compactSans, textTreatments.wide),
    }),
  theme("process designer", { gradient: "linear-gradient(90deg, #0e7490, #14b8a6, #22c55e)", darkGradient: "linear-gradient(90deg, #67e8f9, #5eead4, #86efac)", glow: "rgba(20, 184, 166, 0.44)" },
    typo.designer, GitMerge, 'right', ic.conduct, 'slideRight', fx.typewriterLine, ctr.precision, 'typewriter',
    {
      ...surface(shell.cartography, ambient.mesh, badge.frame),
      renderMeta: { segmentMode: 'word', stagger: 0.09 },
      iconWrapperClass: 'inline-flex',
    }),
  theme("quantum systems designer", { gradient: "linear-gradient(90deg, #4338ca, #6d28d9, #a21caf)", darkGradient: "linear-gradient(90deg, #a5b4fc, #c4b5fd, #f0abfc)", glow: "rgba(109, 40, 217, 0.54)" },
    { ...typo.designer, letterSpacing: '0.09em' }, Radar, 'right', ic.orbit, 'prismFlip3D', fx.neon, ctr.neural, 'morphText',
    {
      ...surface(shell.draft, ambient.spectrum, badge.orb),
      textClass: cn(textTreatments.compactSans, textTreatments.wide),
      contentClass: textTreatments.panelWide,
    }),
  theme("machine learning designer", { gradient: "linear-gradient(90deg, #2563eb, #0ea5e9, #06b6d4)", darkGradient: "linear-gradient(90deg, #93c5fd, #7dd3fc, #67e8f9)", glow: "rgba(14, 165, 233, 0.45)" },
    typo.designerMed, Cpu, 'right', ic.pulse, 'glitchIn', fx.matrix, ctr.neural, 'reveal',
    {
      ...surface(shell.blueprint, ambient.circuit, badge.glyph),
      renderMeta: { revealDirection: 'left' },
    }),

  // ═══ SCULPTORS — crafted forms + tactile motion ═══
  theme("digital sculptor", { gradient: "linear-gradient(180deg, #be123c, #e11d48, #fb7185)", darkGradient: "linear-gradient(180deg, #fda4af, #fecdd3, #ffe4e6)", glow: "rgba(244, 63, 94, 0.52)" },
    { ...typo.sculptor, fontWeight: 560 }, PenTool, 'left', ic.chisel, 'sculpt3D', fx.fire, ctr.sculptor, 'split',
    {
      ...surface(shell.monolith, ambient.ember, badge.frame, '◢', ornament.glyph),
      renderMeta: { splitDistance: 24 },
    }),
  theme("augmented reality sculptor", { gradient: "linear-gradient(180deg, #be185d, #db2777, #f472b6)", darkGradient: "linear-gradient(180deg, #f9a8d4, #fbcfe8, #fce7f3)", glow: "rgba(236, 72, 153, 0.54)" },
    { ...typo.sculptorMed, letterSpacing: '0.045em' }, Glasses, 'left', ic.float, 'prismFlip3D', fx.holographic, ctr.sculptor, 'reveal',
    {
      ...surface(shell.bloom, ambient.spectrum, badge.orb),
      renderMeta: { revealDirection: 'left' },
      textClass: cn(textTreatments.compactSans, textTreatments.wide),
      iconWrapperClass: 'inline-flex',
    }),
  theme("resilience sculptor", { gradient: "linear-gradient(180deg, #9f1239, #e11d48, #f43f5e)", darkGradient: "linear-gradient(180deg, #fda4af, #fecdd3, #ffe4e6)", glow: "rgba(225, 29, 72, 0.5)" },
    { ...typo.sculptorMed, fontWeight: 500 }, Gem, 'left', ic.pulse, 'springOvershoot', fx.pulseRing, ctr.sculptor, 'morphText',
    {
      ...surface(shell.monolith, ambient.pulse, badge.frame, '▣', ornament.signal),
    }),
  theme("information sculptor", { gradient: "linear-gradient(180deg, #ea580c, #ef4444, #ec4899)", darkGradient: "linear-gradient(180deg, #fdba74, #fca5a5, #f9a8d4)", glow: "rgba(239, 68, 68, 0.52)" },
    { ...typo.sculptor, letterSpacing: '0.04em' }, Boxes, 'left', ic.float, 'slideUp', fx.shimmer, ctr.sculptor, 'cascade',
    {
      ...surface(shell.blueprint, ambient.mesh, badge.glyph, '◈', ornament.glyph),
      renderMeta: { stagger: 0.02 },
    }),
  theme("experience sculptor", { gradient: "linear-gradient(180deg, #ea580c, #e11d48, #be185d)", darkGradient: "linear-gradient(180deg, #fdba74, #fda4af, #fbcfe8)", glow: "rgba(225, 29, 72, 0.52)" },
    { ...typo.sculptorMed, fontWeight: 450, letterSpacing: '0.06em' }, Heart, 'left', ic.pulse, 'dreamFloat', fx.aurora, ctr.sculptor, 'wave',
    {
      ...surface(shell.bloom, ambient.spectrum, badge.spark),
    }),

  // ═══ ARTISANS / CRAFTSMEN — forged reliability ═══
  theme("intelligence artisan", { gradient: "linear-gradient(120deg, #92400e, #b45309, #d97706)", darkGradient: "linear-gradient(120deg, #fbbf24, #f59e0b, #fcd34d)", glow: "rgba(180, 83, 9, 0.52)" },
    { ...typo.artisan, letterSpacing: '0.035em' }, Lightbulb, 'left', ic.zap, 'slideDown', fx.underline, ctr.artisan, 'reveal',
    {
      ...surface(shell.forge, ambient.sweep, badge.frame),
      renderMeta: { revealDirection: 'left' },
    }),
  theme("cyber defense artisan", { gradient: "linear-gradient(120deg, #dc2626, #b45309, #ea580c)", darkGradient: "linear-gradient(120deg, #fca5a5, #fbbf24, #fdba74)", glow: "rgba(220, 38, 38, 0.54)" },
    { ...typo.artisanBold, letterSpacing: '0.06em' }, ShieldCheck, 'left', ic.alarm, 'shieldDeploy', fx.glitchFlicker, ctr.securityPulse, 'reveal',
    {
      ...surface(shell.vault, ambient.circuit, badge.vault),
      renderMeta: { revealDirection: 'right' },
      textClass: cn(textTreatments.compactMono, textTreatments.wide),
      contentClass: textTreatments.panelWide,
    }),
  theme("blockchain artisan", { gradient: "linear-gradient(120deg, #78350f, #a16207, #ca8a04)", darkGradient: "linear-gradient(120deg, #fde68a, #fcd34d, #fbbf24)", glow: "rgba(161, 98, 7, 0.52)" },
    typo.artisanMono, Link, 'left', ic.none, 'blueprintFold', fx.typewriterLine, ctr.artisan, 'typewriter',
    {
      ...surface(shell.blueprint, ambient.coordinates, badge.glyph, '▤', ornament.brackets),
      renderMeta: { segmentMode: 'word', stagger: 0.08 },
      iconWrapperClass: 'inline-flex',
    }),
  theme("cybersecurity artisan", { gradient: "linear-gradient(120deg, #b91c1c, #dc2626, #f97316)", darkGradient: "linear-gradient(120deg, #fca5a5, #fecaca, #fdba74)", glow: "rgba(185, 28, 28, 0.54)" },
    typo.artisanBold, Lock, 'left', ic.zap, 'shieldDeploy', fx.scanline, ctr.securityPulse, 'reveal',
    {
      ...surface(shell.monolith, ambient.circuit, badge.vault),
      renderMeta: { revealDirection: 'right' },
      textClass: textTreatments.compactMono,
      iconWrapperClass: 'inline-flex',
    }),
  theme("knowledge craftsman", { gradient: "linear-gradient(120deg, #a16207, #ca8a04, #eab308)", darkGradient: "linear-gradient(120deg, #fcd34d, #fde68a, #fef9c3)", glow: "rgba(202, 138, 4, 0.52)" },
    { ...typo.artisan, fontWeight: 560, letterSpacing: '0.04em' }, BookOpen, 'left', ic.none, 'slideDown', fx.typewriterLine, ctr.artisan, 'typewriter',
    {
      ...surface(shell.monolith, ambient.ember, badge.frame, '▤', ornament.brackets),
      renderMeta: { segmentMode: 'word', stagger: 0.085 },
    }),

  // ═══ CRAFTERS — living systems growth ═══
  theme("experience crafter", { gradient: "linear-gradient(150deg, #059669, #10b981, #34d399)", darkGradient: "linear-gradient(150deg, #6ee7b7, #a7f3d0, #bbf7d0)", glow: "rgba(16, 185, 129, 0.52)" },
    { ...typo.crafter, fontWeight: 540, letterSpacing: '0.05em' }, Palette, 'right', ic.bounce, 'growSeed', fx.shimmer, ctr.organic, 'wave',
    {
      ...surface(shell.bloom, ambient.tide, badge.spark),
    }),
  theme("edge systems crafter", { gradient: "linear-gradient(150deg, #047857, #0d9488, #0891b2)", darkGradient: "linear-gradient(150deg, #6ee7b7, #5eead4, #67e8f9)", glow: "rgba(13, 148, 136, 0.52)" },
    { ...typo.crafter, letterSpacing: '0.055em' }, Route, 'right', ic.compassLock, 'slideRight', fx.underline, ctr.organic, 'split',
    {
      ...surface(shell.horizon, ambient.ember, badge.glyph),
    }),
  theme("future systems crafter", { gradient: "linear-gradient(150deg, #16a34a, #22c55e, #84cc16)", darkGradient: "linear-gradient(150deg, #86efac, #bbf7d0, #d9f99d)", glow: "rgba(34, 197, 94, 0.52)" },
    { ...typo.crafter, letterSpacing: '0.065em' }, Satellite, 'right', ic.drift, 'growSeed', fx.aurora, ctr.organic, 'reveal',
    {
      ...surface(shell.horizon, ambient.aurora, badge.orb, '↟', ornament.halo),
      renderMeta: { revealDirection: 'right' },
      textClass: cn(textTreatments.compactSans, textTreatments.wide),
    }),

  // ═══ VIRTUOSOS / ARTISTS — high-energy performance ═══
  theme("automation virtuoso", { gradient: "linear-gradient(160deg, #e11d48, #f97316, #eab308)", darkGradient: "linear-gradient(160deg, #fb7185, #fdba74, #fde047)", glow: "rgba(249, 115, 22, 0.62)" },
    typo.virtuoso, Zap, 'left', ic.zap, 'thunderExit', fx.fire, ctr.virtuosoShell, 'cascade',
    {
      ...surface(shell.stage, ambient.pulse, badge.spark, '⚡', ornament.signal),
      renderMeta: { segmentMode: 'word', stagger: 0.048, cascadeDistance: 22 },
    }),
  theme("robotics artist", { gradient: "linear-gradient(160deg, #a855f7, #c026d3, #ec4899)", darkGradient: "linear-gradient(160deg, #d8b4fe, #e879f9, #f9a8d4)", glow: "rgba(192, 38, 211, 0.54)" },
    typo.virtuosoBold, Bot, 'left', ic.pulse, 'zoomBlur', fx.holographic, ctr.virtuosoShell, 'morphText',
    {
      ...surface(shell.beacon, ambient.spectrum, badge.orb),
      textClass: textTreatments.hero,
      iconWrapperClass: 'inline-flex',
    }),
  theme("intelligent systems artist", { gradient: "linear-gradient(160deg, #7c3aed, #c026d3, #ec4899)", darkGradient: "linear-gradient(160deg, #c4b5fd, #e879f9, #f9a8d4)", glow: "rgba(168, 85, 247, 0.54)" },
    { ...typo.virtuosoBold, letterSpacing: '0.01em' }, BrainCircuit, 'left', ic.orbit, 'glitchBurst', fx.glitchFlicker, ctr.virtuosoShell, 'morphText',
    {
      ...surface(shell.stage, ambient.circuit, badge.glyph),
      textClass: cn(textTreatments.compactSans, textTreatments.wide),
      contentClass: textTreatments.panelWide,
    }),
  theme("scalability artist", { gradient: "linear-gradient(160deg, #be185d, #ec4899, #8b5cf6)", darkGradient: "linear-gradient(160deg, #f9a8d4, #fbcfe8, #c4b5fd)", glow: "rgba(236, 72, 153, 0.54)" },
    typo.virtuoso, Gauge, 'left', ic.zap, 'springOvershoot', fx.pulseRing, ctr.virtuosoShell, 'split',
    {
      ...surface(shell.beacon, ambient.pulse, badge.frame, '※', ornament.signal),
    }),

  // ═══ MAGES / WEAVERS — procedural sorcery ═══
  theme("workflow mage", { gradient: "linear-gradient(240deg, #4338ca, #7c3aed, #6366f1)", darkGradient: "linear-gradient(240deg, #a5b4fc, #c4b5fd, #a5b4fc)", glow: "rgba(124, 58, 237, 0.56)" },
    typo.mage, Workflow, 'left', ic.conduct, 'weave', fx.shimmer, ctr.mystic, 'wave',
    {
      ...surface(shell.loom, ambient.rune, badge.glyph, '☼', ornament.glyph),
      renderMeta: { segmentMode: 'word', stagger: 0.052, waveLift: 11 },
      iconWrapperClass: 'inline-flex',
      iconMotion: { initial: { opacity: 0, rotate: -10, y: 8 }, animate: { opacity: 1, rotate: 0, y: 0 }, transition: { duration: 0.4 } },
    }),
  theme("algorithm weaver", { gradient: "linear-gradient(200deg, #4f46e5, #7c3aed, #8b5cf6)", darkGradient: "linear-gradient(200deg, #a5b4fc, #c4b5fd, #ddd6fe)", glow: "rgba(124, 58, 237, 0.52)" },
    { ...typo.mage, letterSpacing: '0.08em' }, GitBranch, 'right', ic.conduct, 'weave', fx.matrix, ctr.mystic, 'cascade',
    {
      ...surface(shell.sigil, ambient.spectrum, badge.frame),
      renderMeta: { stagger: 0.018 },
    }),

  // ═══ VISIONARIES / DREAMERS / FUTURISTS — airy long-horizon motion ═══
  theme("platform visionary", { gradient: "linear-gradient(0deg, #0891b2, #06b6d4, #22d3ee)", darkGradient: "linear-gradient(0deg, #67e8f9, #a5f3fc, #cffafe)", glow: "rgba(6, 182, 212, 0.5)" },
    typo.visionary, Telescope, 'right', ic.float, 'auroraBloom', fx.float, ctr.visionaryHalo, 'wave',
    {
      ...surface(shell.beacon, ambient.tide, badge.frame),
      renderMeta: { segmentMode: 'word', waveLift: 8, stagger: 0.05 },
      iconMotion: { initial: { opacity: 0, y: 10, rotate: -6 }, animate: { opacity: 1, y: 0, rotate: 0 }, transition: { duration: 0.52 } },
    }),
  theme("systems dreamer", { gradient: "linear-gradient(0deg, #7c3aed, #818cf8, #38bdf8)", darkGradient: "linear-gradient(0deg, #c4b5fd, #c7d2fe, #bae6fd)", glow: "rgba(129, 140, 248, 0.52)" },
    typo.visionaryItalic, Moon, 'right', ic.drift, 'dreamFloat', fx.aurora, ctr.visionaryHalo, 'morphText',
    {
      ...surface(shell.horizon, ambient.aurora, badge.orb),
      textClass: cn(textTreatments.compactSans, textTreatments.wide),
    }),
  theme("digital futurist", { gradient: "linear-gradient(330deg, #06b6d4, #3b82f6, #8b5cf6)", darkGradient: "linear-gradient(330deg, #67e8f9, #93c5fd, #c4b5fd)", glow: "rgba(59, 130, 246, 0.52)" },
    { ...typo.visionary, fontWeight: 300, letterSpacing: '0.1em' }, Radar, 'right', ic.orbit, 'drift', fx.neon, ctr.visionaryHalo, 'wave',
    {
      ...surface(shell.beacon, ambient.spectrum, badge.glyph),
      renderMeta: { segmentMode: 'word', stagger: 0.05, waveLift: 10 },
    }),
  theme("enterprise dreamer", { gradient: "linear-gradient(0deg, #0284c7, #818cf8, #a78bfa)", darkGradient: "linear-gradient(0deg, #7dd3fc, #c7d2fe, #ddd6fe)", glow: "rgba(129, 140, 248, 0.52)" },
    { ...typo.visionaryItalic, letterSpacing: '0.14em' }, Factory, 'right', ic.float, 'dreamFloat', fx.shimmer, ctr.visionaryHalo, 'split',
    {
      ...surface(shell.horizon, ambient.tide, badge.frame, '◎', ornament.halo),
    }),

  // ═══ SHAPERS / MAPPERS / CARTOGRAPHERS — navigation + route synthesis ═══
  theme("cloud shaper", { gradient: "linear-gradient(90deg, #0284c7, #38bdf8, #67e8f9)", darkGradient: "linear-gradient(90deg, #7dd3fc, #bae6fd, #a5f3fc)", glow: "rgba(56, 189, 248, 0.52)" },
    typo.mapperLight, Cloud, 'left', ic.float, 'slideRight', fx.ice, ctr.mapperGrid, 'reveal',
    {
      ...surface(shell.cartography, ambient.tide, badge.frame),
      renderMeta: { revealDirection: 'right' },
    }),
  theme("AI cartographer", { gradient: "linear-gradient(60deg, #0d9488, #059669, #0284c7)", darkGradient: "linear-gradient(60deg, #5eead4, #6ee7b7, #7dd3fc)", glow: "rgba(13, 148, 136, 0.52)" },
    { ...typo.mapper, letterSpacing: '0.055em' }, Map, 'left', ic.none, 'cartographyTilt', fx.matrix, ctr.mapperGrid, 'cascade',
    {
      ...surface(shell.cartography, ambient.coordinates, badge.glyph, '⌖', ornament.signal),
      renderMeta: { segmentMode: 'word', stagger: 0.055, cascadeDistance: 18 },
      iconWrapperClass: 'inline-flex',
    }),
  theme("technological mapper", { gradient: "linear-gradient(60deg, #0f766e, #0891b2, #0284c7)", darkGradient: "linear-gradient(60deg, #5eead4, #67e8f9, #7dd3fc)", glow: "rgba(8, 145, 178, 0.52)" },
    typo.mapper, Navigation, 'left', ic.compassLock, 'cartographyTilt', fx.scanline, ctr.mapperGrid, 'split',
    {
      ...surface(shell.blueprint, ambient.circuit, badge.glyph, '⤢', ornament.signal),
      renderMeta: { splitDistance: 20 },
      textClass: cn(textTreatments.compactMono, textTreatments.wide),
      iconWrapperClass: 'inline-flex',
    }),

  // ═══ ORCHESTRATOR — grand conductor bloom ═══
  theme("data orchestrator", { gradient: "linear-gradient(225deg, #7e22ce, #9333ea, #be123c)", darkGradient: "linear-gradient(225deg, #d8b4fe, #e9d5ff, #fda4af)", glow: "rgba(147, 51, 234, 0.62)" },
    typo.orchestrator, Music, 'left', ic.conduct, 'orchestralSwell', fx.aurora, ctr.orchestratorStage, 'morphText',
    {
      ...surface(shell.stage, ambient.spectrum, badge.spark),
      textClass: cn(textTreatments.compactSans, textTreatments.wide),
      contentClass: textTreatments.panelWide,
      iconWrapperClass: 'inline-flex',
    }),
];

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

// ─── Constants ────────────────────────────────────────────────────────────────

const ANIMATION_INTERVAL = 4200;
const MAX_CHOREOGRAPHY_CHARS = 52;

// ─── Component ────────────────────────────────────────────────────────────────

export function LandingTitle() {
  const prefersReducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const hasHydratedRef = useRef(false);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleStartedAtRef = useRef<number | null>(null);
  const elapsedCycleMsRef = useRef(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [shuffledThemes, setShuffledThemes] = useState<WordTheme[]>(WORD_THEMES);
  const [isShellHovered, setIsShellHovered] = useState(false);
  const [isShellFocused, setIsShellFocused] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);

  const isDark = resolvedTheme === 'dark';

  // Keep reduced-motion mode fully static; otherwise shuffle once after mount.
  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      setShuffledThemes(buildRotationSequence(WORD_THEMES));
    });
    return () => cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  useEffect(() => {
    hasHydratedRef.current = true;
  }, []);

  const advance = useCallback(() => {
    setWordIndex((prev) => {
      if (prev + 1 < shuffledThemes.length) {
        return prev + 1;
      }

      const previousTheme = shuffledThemes[prev] ?? shuffledThemes[shuffledThemes.length - 1] ?? null;
      setShuffledThemes(buildRotationSequence(WORD_THEMES, previousTheme));
      return 0;
    });
  }, [shuffledThemes]);

  const cancelScheduledAdvance = useCallback(() => {
    if (advanceTimeoutRef.current !== null) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  }, []);

  const syncCycleProgress = useCallback(() => {
    if (cycleStartedAtRef.current === null) return;

    elapsedCycleMsRef.current = Math.min(
      elapsedCycleMsRef.current + (performance.now() - cycleStartedAtRef.current),
      ANIMATION_INTERVAL,
    );
    cycleStartedAtRef.current = null;
  }, []);

  const pauseRotation = useCallback(() => {
    syncCycleProgress();
    cancelScheduledAdvance();
  }, [cancelScheduledAdvance, syncCycleProgress]);

  const startRotation = useCallback(() => {
    cancelScheduledAdvance();

    const remainingMs = Math.max(ANIMATION_INTERVAL - elapsedCycleMsRef.current, 16);
    cycleStartedAtRef.current = performance.now();

    advanceTimeoutRef.current = setTimeout(() => {
      cancelScheduledAdvance();
      cycleStartedAtRef.current = null;
      elapsedCycleMsRef.current = 0;
      advance();
    }, remainingMs);
  }, [advance, cancelScheduledAdvance]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(!document.hidden);
    };

    handleVisibilityChange();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    elapsedCycleMsRef.current = 0;
    cycleStartedAtRef.current = null;
  }, [wordIndex]);

  const isRotationPaused = prefersReducedMotion || isShellHovered || isShellFocused || !isDocumentVisible;

  useEffect(() => {
    if (isRotationPaused) {
      pauseRotation();
      return undefined;
    }

    startRotation();

    return () => {
      pauseRotation();
    };
  }, [isRotationPaused, pauseRotation, startRotation, wordIndex]);

  const handleDeckMouseEnter = useCallback(() => {
    setIsShellHovered(true);
  }, []);

  const handleDeckMouseLeave = useCallback(() => {
    setIsShellHovered(false);
  }, []);

  const handleShellFocus = useCallback(() => {
    setIsShellFocused(true);
  }, []);

  const handleShellBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;

    setIsShellFocused(false);
  }, []);

  const currentTheme = shuffledThemes[wordIndex] ?? shuffledThemes[0] ?? WORD_THEMES[0];
  const Icon = currentTheme.icon;
  const textSeed = createTextSeed(currentTheme.text);
  const signalDeck = deriveSignalDeckMeta(currentTheme.text);
  const positionLabel = String(wordIndex + 1).padStart(2, '0');
  const totalLabel = String(shuffledThemes.length).padStart(2, '0');
  const shouldAnimateTagline = hasHydratedRef.current && !prefersReducedMotion;
  const isPreciseFamily = [ctr.precision.className, ctr.mapperGrid.className, ctr.neural.className].includes(currentTheme.containerClass ?? '');
  const isAiryFamily = [ctr.mystic.className, ctr.organic.className, ctr.visionaryHalo.className].includes(currentTheme.containerClass ?? '');
  const isForgedFamily = [ctr.alchemy.className, ctr.sculptor.className, ctr.artisan.className, ctr.securityPulse.className].includes(currentTheme.containerClass ?? '');
  const isStageFamily = [ctr.virtuosoShell.className, ctr.orchestratorStage.className].includes(currentTheme.containerClass ?? '');
  const segmentMode = currentTheme.renderMeta?.segmentMode ?? 'char';
  const needsReadableFoundation = ['typewriter', 'wave', 'cascade'].includes(currentTheme.renderMode);
  const surfaceGroup = isPreciseFamily
    ? 'precise'
    : isAiryFamily
      ? 'airy'
      : isForgedFamily
        ? 'forged'
        : isStageFamily
          ? 'stage'
          : 'default';
  const derivedContentClass = cn(
    currentTheme.contentClass,
    isPreciseFamily && pillTreatments.precise,
    isAiryFamily && pillTreatments.airy,
    isForgedFamily && pillTreatments.forged,
    isStageFamily && pillTreatments.stage,
  );
  const derivedIconScaleClass = currentTheme.textClass?.includes(textTreatments.hero)
    ? iconTreatments.large
    : isStageFamily
      ? iconTreatments.large
      : isPreciseFamily || currentTheme.fontFamily === 'mono'
        ? iconTreatments.compact
        : '';
  const subtitleGlow = withAlpha(currentTheme.glow, isDark ? 0.48 : 0.34);
  const subtitleStroke = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(15, 23, 42, 0.14)';

  const gradientStyle: React.CSSProperties = {
    backgroundImage: isDark ? currentTheme.darkGradient : currentTheme.gradient,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextStroke: `0.012em ${subtitleStroke}`,
    textShadow: `0 0 ${isDark ? 10 : 8}px ${subtitleGlow}`,
  };

  const typographyStyle: React.CSSProperties = {
    fontFamily: currentTheme.fontFamily === 'mono' ? 'var(--font-monaspace), monospace' : 'var(--font-bricolage), sans-serif',
    fontWeight: currentTheme.fontWeight,
    letterSpacing: currentTheme.letterSpacing,
    textTransform: currentTheme.textTransform,
    fontStyle: currentTheme.fontStyle,
  };

  const readableBaseStyle: React.CSSProperties = {
    ...typographyStyle,
    color: needsReadableFoundation
      ? isDark ? 'rgba(248, 250, 252, 0.26)' : 'rgba(15, 23, 42, 0.16)'
      : isDark ? 'rgba(248, 250, 252, 0.34)' : 'rgba(15, 23, 42, 0.22)',
    textShadow: isDark
      ? `0 0 ${needsReadableFoundation ? 8 : 9}px ${withAlpha(currentTheme.glow, needsReadableFoundation ? 0.14 : 0.16)}`
      : `0 0 ${needsReadableFoundation ? 6 : 7}px ${withAlpha(currentTheme.glow, needsReadableFoundation ? 0.08 : 0.1)}`,
  };

  const typographyBaseClasses = cn(
    'text-lg sm:text-xl md:text-2xl lg:text-3xl',
    'text-center leading-tight text-balance',
  );

  const typographyClasses = cn(
    typographyBaseClasses,
    currentTheme.textClass,
    "transition-transform duration-300 ease-out",
    currentTheme.effectClass,
  );

  const iconColor = currentTheme.glow.replace(/[\d.]+\)$/, '0.8)');

  const renderIcon = (position: 'left' | 'right') => {
    if (currentTheme.iconPosition !== position) return null;

    const iconNode = (
      <span className={cn(styles.subtitleIconBadge, currentTheme.iconBadgeClass, derivedIconScaleClass)}>
        <Icon
          className={cn('h-5 w-5 shrink-0 sm:h-6 sm:w-6 md:h-7 md:w-7', currentTheme.iconClass)}
          style={{ color: iconColor, filter: `drop-shadow(0 0 8px ${currentTheme.glow})` }}
          aria-hidden="true"
        />
      </span>
    );

    if (!shouldAnimateTagline || !currentTheme.iconMotion) {
      return <span className={currentTheme.iconWrapperClass}>{iconNode}</span>;
    }

    return (
      <motion.span
        className={currentTheme.iconWrapperClass}
        initial={currentTheme.iconMotion.initial}
        animate={currentTheme.iconMotion.animate}
        exit={currentTheme.iconMotion.exit}
        transition={currentTheme.iconMotion.transition}
      >
        {iconNode}
      </motion.span>
    );
  };

  const shouldRenderReadableEcho = !prefersReducedMotion && needsReadableFoundation;

  const withReadableBase = (node: React.ReactNode) => (
    <span className={styles.subtitleTextFrame}>
      {shouldRenderReadableEcho ? (
        <span aria-hidden="true" className={cn(styles.subtitleReadableEcho, typographyBaseClasses, currentTheme.textClass)} style={readableBaseStyle}>
          {currentTheme.text}
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
        ? `0 0 0.72rem ${withAlpha(currentTheme.glow, 0.18)}`
        : `0 0 0.56rem ${withAlpha(currentTheme.glow, 0.12)}`,
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
    const motionUnits = getMotionUnits(currentTheme.text, segmentMode);
    const canRunCharChoreo = !prefersReducedMotion && currentTheme.text.length <= MAX_CHOREOGRAPHY_CHARS;

    if (!shouldAnimateTagline) {
      return withReadableBase(
        <span style={combinedStyle} className={typographyClasses} data-text={currentTheme.text}>
          {currentTheme.text}
        </span>
      );
    }

    if (currentTheme.renderMode === 'typewriter' && canRunCharChoreo) {
      const stagger = currentTheme.renderMeta?.stagger ?? (segmentMode === 'word' ? 0.08 : 0.04);
      return withReadableBase(
        <motion.span style={choreographyWrapperStyle} className={typographyClasses}>
          {motionUnits.map((unit, i) => (
            <motion.span
              key={`${unit}-${i}`}
              style={animatedUnitStyle}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: segmentMode === 'word' ? 0.28 : 0.18, delay: i * stagger, ease: 'easeOut' }}
            >
              {segmentMode === 'char' && unit === ' ' ? '\u00A0' : unit}
            </motion.span>
          ))}
        </motion.span>
      );
    }

    if (currentTheme.renderMode === 'wave' && canRunCharChoreo) {
      const stagger = currentTheme.renderMeta?.stagger ?? (segmentMode === 'word' ? 0.055 : 0.024);
      const waveLift = currentTheme.renderMeta?.waveLift ?? (segmentMode === 'word' ? 10 : 7);
      return withReadableBase(
        <motion.span style={choreographyWrapperStyle} className={typographyClasses} initial={{ opacity: 0.9 }} animate={{ opacity: 1 }}>
          {motionUnits.map((unit, i) => (
            <motion.span
              key={`${unit}-${i}`}
              style={animatedUnitStyle}
              initial={{ opacity: 0, y: waveLift, rotateZ: i % 2 === 0 ? -6 : 6 }}
              animate={{ opacity: [0.3, 1, 1], y: [waveLift, -waveLift * 0.6, 0], rotateZ: [i % 2 === 0 ? -6 : 6, i % 2 === 0 ? 3 : -3, 0] }}
              exit={{ opacity: 0, y: -waveLift * 0.8, rotateZ: i % 2 === 0 ? -8 : 8 }}
              transition={{ duration: 0.68, delay: i * stagger, ease: [0.22, 1, 0.36, 1] }}
            >
              {segmentMode === 'char' && unit === ' ' ? '\u00A0' : unit}
            </motion.span>
          ))}
        </motion.span>
      );
    }

    if (currentTheme.renderMode === 'cascade' && canRunCharChoreo) {
      const stagger = currentTheme.renderMeta?.stagger ?? (segmentMode === 'word' ? 0.06 : 0.018);
      const cascadeDistance = currentTheme.renderMeta?.cascadeDistance ?? (segmentMode === 'word' ? 20 : 14);
      return withReadableBase(
        <motion.span style={choreographyWrapperStyle} className={typographyClasses}>
          {motionUnits.map((unit, i) => (
            <motion.span
              key={`${unit}-${i}`}
              style={animatedUnitStyle}
              initial={{ opacity: 0, y: -cascadeDistance, rotateX: 70, scale: 0.88 }}
              animate={{ opacity: 1, y: [0, -2, 0], rotateX: [20, -6, 0], scale: [1.06, 0.98, 1] }}
              exit={{ opacity: 0, y: cascadeDistance * 0.55, rotateX: -55, scale: 0.9 }}
              transition={{ duration: segmentMode === 'word' ? 0.54 : 0.4, delay: i * stagger, ease: [0.16, 1, 0.3, 1] }}
            >
              {segmentMode === 'char' && unit === ' ' ? '\u00A0' : unit}
            </motion.span>
          ))}
        </motion.span>
      );
    }

    if (currentTheme.renderMode === 'reveal') {
      const revealDirection = currentTheme.renderMeta?.revealDirection ?? 'left';
      const revealFromRight = revealDirection === 'right';
      const revealSkew = currentTheme.renderMeta?.revealSkew ?? (revealFromRight ? -8 : 8);
      return withReadableBase(
        <motion.span
          style={{ ...animatedCombinedStyle, display: 'inline-block' }}
          className={typographyClasses}
          initial={{ clipPath: revealFromRight ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', opacity: 0.45, x: revealFromRight ? 20 : -20, skewX: revealSkew }}
          animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1, x: 0, skewX: 0 }}
          exit={{ clipPath: revealFromRight ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', opacity: 0, x: revealFromRight ? -18 : 18, skewX: -revealSkew }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {currentTheme.text}
        </motion.span>
      );
    }

    if (currentTheme.renderMode === 'split') {
      const splitDistance = currentTheme.renderMeta?.splitDistance ?? 18;
      const segments = currentTheme.text.split(' ');
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
        </span>
      );
    }

    if (currentTheme.renderMode === 'morphText') {
      return withReadableBase(
        <span className={cn(typographyClasses, 'relative inline-grid')} data-text={currentTheme.text}>
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
            {currentTheme.text}
          </motion.span>
          <motion.span
            key={`next-${wordIndex}`}
            style={animatedCombinedStyle}
            initial={{ opacity: 0, y: 10, scale: 0.985, letterSpacing: '0.08em' }}
            animate={{ opacity: 1, y: 0, scale: 1, letterSpacing: typographyStyle.letterSpacing }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentTheme.text}
          </motion.span>
        </span>
      );
    }

    return withReadableBase(
      <span style={combinedStyle} className={typographyClasses} data-text={currentTheme.text}>
        {currentTheme.text}
      </span>
    );
  };

  // Container styles that shift per-word theme
  const accentX = 16 + (textSeed % 62);
  const accentY = 14 + ((textSeed * 7) % 52);
  const sharedSignalStyle = {
    '--subtitle-shell-edge': withAlpha(currentTheme.glow, isDark ? 0.24 : 0.14),
    '--subtitle-shell-glow-soft': withAlpha(currentTheme.glow, isDark ? 0.16 : 0.08),
    '--subtitle-shell-glow-strong': withAlpha(currentTheme.glow, isDark ? 0.34 : 0.17),
    '--subtitle-shell-ridge': isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.5)',
    '--subtitle-shell-shadow': isDark ? 'rgba(2, 6, 23, 0.52)' : 'rgba(15, 23, 42, 0.14)',
    '--subtitle-glow-soft': withAlpha(currentTheme.glow, isDark ? 0.18 : 0.12),
    '--subtitle-glow-strong': withAlpha(currentTheme.glow, isDark ? 0.34 : 0.2),
    '--subtitle-panel-edge': withAlpha(currentTheme.glow, isDark ? 0.28 : 0.22),
    '--subtitle-panel-bg': isDark ? 'rgba(10, 16, 34, 0.72)' : 'rgba(255, 255, 255, 0.78)',
    '--subtitle-panel-bg-2': isDark ? 'rgba(18, 26, 52, 0.6)' : 'rgba(241, 245, 249, 0.62)',
    '--subtitle-badge-bg': isDark ? 'rgba(10, 16, 34, 0.88)' : 'rgba(255, 255, 255, 0.9)',
    '--subtitle-badge-border': withAlpha(currentTheme.glow, isDark ? 0.26 : 0.18),
    '--subtitle-signal-gradient': isDark ? currentTheme.darkGradient : currentTheme.gradient,
    '--subtitle-signal-label': isDark ? 'rgba(226, 232, 240, 0.92)' : 'rgba(15, 23, 42, 0.82)',
    '--subtitle-signal-muted': isDark ? 'rgba(148, 163, 184, 0.82)' : 'rgba(71, 85, 105, 0.72)',
    '--subtitle-signal-surface': isDark ? 'rgba(8, 15, 32, 0.76)' : 'rgba(255, 255, 255, 0.82)',
    '--subtitle-signal-surface-2': isDark ? 'rgba(18, 26, 52, 0.62)' : 'rgba(241, 245, 249, 0.72)',
    '--subtitle-signal-accent-x': `${accentX}%`,
    '--subtitle-signal-accent-y': `${accentY}%`,
    '--subtitle-theme-outline': currentTheme.containerBorder,
    '--subtitle-theme-panel-fill': currentTheme.containerBackground ?? 'linear-gradient(135deg, transparent, transparent)',
    '--subtitle-theme-panel-shadow': currentTheme.containerShadow,
  } as React.CSSProperties;
  const subtitleThemeStyle = {
    ...sharedSignalStyle,
    border: currentTheme.containerBorder,
    boxShadow: currentTheme.containerShadow,
    borderRadius: currentTheme.containerRadius ?? `${12 + (textSeed % 6)}px`,
    background: 'transparent',
    transition: 'border 0.5s ease, box-shadow 0.5s ease, border-radius 0.5s ease',
  } as React.CSSProperties;
  const subtitleGlowStyle = {
    '--subtitle-glow-border-radius': isAiryFamily ? '999px' : subtitleThemeStyle.borderRadius,
  } as React.CSSProperties;

  const subtitleInner = (
    <>
      <span className={cn(styles.subtitleAmbient, currentTheme.ambientClass)} aria-hidden="true" />
      {currentTheme.ornament ? (
        <span className={cn(styles.subtitleOrnament, currentTheme.ornamentClass)} aria-hidden="true">
          {currentTheme.ornament}
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
        "relative z-10",
        "mx-auto w-full max-w-[48rem] xl:max-w-[52rem] rounded-[1.75rem]",
        "py-1 sm:py-2 md:py-4 lg:py-6",
        "px-2 sm:px-4 md:px-6 lg:px-8",
        "flex flex-col items-center",
        "bg-linear-to-br",
        "from-background/40 via-background/18 to-transparent",
        "dark:from-background/28 dark:via-background/16 dark:to-background/6",
        "border border-primary/10",
        "dark:border-primary/20",
        "shadow-lg shadow-primary/5",
        "dark:shadow-primary/8",
        "transition-colors duration-300"
      )}
    >
      <h1
        className={cn(
          "relative font-extrabold tracking-tight leading-none select-none cursor-default text-center",
          "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
          "bg-clip-text text-transparent",
          prefersReducedMotion ? undefined : "hover:scale-[1.02]",
          styles.enhancedTitleLanding,
          styles.heroTitle
        )}
        style={{
          filter: `drop-shadow(0 0 ${isDark ? '20px' : '14px'} ${withAlpha(currentTheme.glow, isDark ? 0.5 : 0.3)})`,
          transition: prefersReducedMotion
            ? 'filter 0.6s ease'
            : 'filter 0.6s ease, transform 0.5s ease',
        }}
      >
        Wyatt Walsh
      </h1>

      <div
        className={cn("mt-2 sm:mt-3 flex w-full min-w-0 max-w-[85vw] sm:max-w-2xl lg:max-w-[44rem] xl:max-w-[46rem] flex-col items-center gap-2", styles.subtitleDeckCluster)}
        style={sharedSignalStyle}
        data-surface-group={surfaceGroup}
        onMouseEnter={!prefersReducedMotion ? handleDeckMouseEnter : undefined}
        onMouseLeave={!prefersReducedMotion ? handleDeckMouseLeave : undefined}
      >
        <div className={styles.signalDeck} aria-hidden="true">
          <span className={styles.signalDeckBadge}>
            <span className={styles.signalDeckBadgeSwatch} />
            {signalDeck.family}
          </span>
          <span className={styles.signalDeckDescriptor}>{signalDeck.descriptor}</span>
          <span className={styles.signalDeckCounter}>
            {positionLabel}
            <span className={styles.signalDeckCounterTotal}>/ {totalLabel}</span>
          </span>
        </div>

        <div
          tabIndex={0}
          role="group"
          aria-label={`${currentTheme.text}. ${signalDeck.family} family, ${signalDeck.descriptor}. ${prefersReducedMotion ? 'Rotation is disabled to respect reduced motion.' : 'Focus or hover pauses rotation.'}`}
          className={cn("w-full", styles.subtitleBorderGlow, styles.subtitleControl)}
          onFocus={handleShellFocus}
          onBlur={handleShellBlur}
          style={subtitleGlowStyle}
        >
          {!shouldAnimateTagline ? (
            <div
              aria-hidden="true"
              className={cn("subtitle-container relative isolate w-full overflow-hidden px-3 sm:px-4 md:px-5 min-h-[3.5rem] sm:min-h-[4rem] md:min-h-[5rem] py-2 sm:py-2.5 md:py-3 flex items-center justify-center", styles.subtitleShellFrame, currentTheme.containerClass, currentTheme.shellClass)}
              style={subtitleThemeStyle}
            >
              {subtitleInner}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTheme.text}
                initial={currentTheme.initial}
                animate={currentTheme.animate}
                exit={currentTheme.exit}
                transition={currentTheme.transition}
                aria-hidden="true"
                className={cn("subtitle-container relative isolate w-full overflow-hidden px-3 sm:px-4 md:px-5 min-h-[3.5rem] sm:min-h-[4rem] md:min-h-[5rem] py-2 sm:py-2.5 md:py-3 flex items-center justify-center", styles.subtitleShellFrame, currentTheme.containerClass, currentTheme.shellClass)}
                style={{ perspective: '1000px', transformStyle: 'preserve-3d', ...subtitleThemeStyle }}
              >
                {subtitleInner}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}
