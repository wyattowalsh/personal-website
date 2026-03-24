"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence, type Transition, type TargetAndTransition } from "motion/react";
import { useTheme } from "next-themes";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { cn } from "@/lib/utils";
import styles from '../app/page.module.css';
import type { LucideIcon } from "lucide-react";
import {
  Atom, Binary, BookOpen, Bot, Boxes, Brain, BrainCircuit, Braces,
  Cloud, Compass, Cpu, Factory, Fingerprint, FlaskConical, Gauge,
  Gem, GitBranch, GitMerge, Glasses, Heart, Lightbulb, Link, Lock,
  Map, Moon, Music, Navigation, Palette, PenTool, Radar,
  Route, Satellite, ShieldCheck, SlidersHorizontal, Sparkles, Sprout,
  Telescope, TestTube, WandSparkles, Workflow, Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type RenderMode =
  | 'standard'
  | 'typewriter'
  | 'scramble'
  | 'wave'
  | 'cascade'
  | 'morphText'
  | 'reveal'
  | 'split'
  | 'glitchDecode';

interface IconMotionMeta {
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  exit?: TargetAndTransition;
  transition?: Transition;
}

interface RenderMeta {
  splitDelimiter?: string;
  stagger?: number;
  segmentMode?: 'char' | 'word';
  revealDirection?: 'left' | 'right';
  revealSkew?: number;
  decodeCycles?: number;
  waveLift?: number;
  cascadeDistance?: number;
  cascadeBlur?: number;
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
  secondaryIcon?: LucideIcon;
  secondaryIconPosition?: 'left' | 'right';
  secondaryIconClass?: string;
  iconMotion?: IconMotionMeta;
  secondaryIconMotion?: IconMotionMeta;
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
  eyebrow?: string;
  eyebrowClass?: string;
  detailLabel?: string;
  detailClass?: string;
  ornament?: string;
  ornamentClass?: string;
  iconBadgeClass?: string;
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
  transmute: {
    initial: { opacity: 0, scale: 0.5, rotate: -20 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 0.5, rotate: 20 },
    transition: { duration: 0.5, type: "spring" as const, stiffness: 180, damping: 12 } as Transition,
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
  typewriter: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0, filter: 'blur(4px)' },
    transition: { duration: 0.15 } as Transition,
  },
  scramble: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0, x: -10, filter: 'blur(4px)' },
    transition: { duration: 0.2 } as Transition,
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
    transition: { type: 'spring' as const, stiffness: 260, damping: 14, mass: 0.7 } as Transition,
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
    transition: { type: 'spring' as const, stiffness: 220, damping: 16, mass: 0.72 } as Transition,
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
  extras: Partial<Pick<WordTheme, 'secondaryIcon' | 'secondaryIconPosition' | 'secondaryIconClass' | 'iconMotion' | 'secondaryIconMotion' | 'iconWrapperClass' | 'renderMeta' | 'shellClass' | 'ambientClass' | 'eyebrow' | 'eyebrowClass' | 'detailLabel' | 'detailClass' | 'ornament' | 'ornamentClass' | 'iconBadgeClass'>> = {},
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
  architect:     { fontFamily: 'mono' as const, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontStyle: 'normal' as const },
  architectCode: { fontFamily: 'mono' as const, fontWeight: 400, letterSpacing: '0.06em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  architectBold: { fontFamily: 'mono' as const, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontStyle: 'normal' as const },
  architectNeural:{ fontFamily: 'mono' as const, fontWeight: 400, letterSpacing: '0.04em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  sorcerer:      { fontFamily: 'sans' as const, fontWeight: 300, letterSpacing: '0.06em', textTransform: 'none' as const, fontStyle: 'italic' as const },
  alchemist:     { fontFamily: 'sans' as const, fontWeight: 700, letterSpacing: '-0.01em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  alchemistMed:  { fontFamily: 'sans' as const, fontWeight: 600, letterSpacing: '0em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  alchemistCode: { fontFamily: 'mono' as const, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  designer:      { fontFamily: 'sans' as const, fontWeight: 200, letterSpacing: '0.1em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  designerMed:   { fontFamily: 'sans' as const, fontWeight: 300, letterSpacing: '0.06em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  sculptor:      { fontFamily: 'sans' as const, fontWeight: 300, letterSpacing: '0.04em', textTransform: 'none' as const, fontStyle: 'italic' as const },
  sculptorMed:   { fontFamily: 'sans' as const, fontWeight: 400, letterSpacing: '0.03em', textTransform: 'none' as const, fontStyle: 'italic' as const },
  artisan:       { fontFamily: 'sans' as const, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  artisanMono:   { fontFamily: 'mono' as const, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  artisanBold:   { fontFamily: 'mono' as const, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, fontStyle: 'normal' as const },
  crafter:       { fontFamily: 'sans' as const, fontWeight: 400, letterSpacing: '0.05em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  virtuoso:      { fontFamily: 'sans' as const, fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  virtuosoBold:  { fontFamily: 'sans' as const, fontWeight: 700, letterSpacing: '-0.01em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  mage:          { fontFamily: 'sans' as const, fontWeight: 300, letterSpacing: '0.06em', textTransform: 'none' as const, fontStyle: 'italic' as const },
  visionary:     { fontFamily: 'sans' as const, fontWeight: 200, letterSpacing: '0.12em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  visionaryItalic:{ fontFamily: 'sans' as const, fontWeight: 200, letterSpacing: '0.12em', textTransform: 'none' as const, fontStyle: 'italic' as const },
  mapper:        { fontFamily: 'mono' as const, fontWeight: 400, letterSpacing: '0.04em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  mapperLight:   { fontFamily: 'sans' as const, fontWeight: 200, letterSpacing: '0.12em', textTransform: 'none' as const, fontStyle: 'normal' as const },
  orchestrator:  { fontFamily: 'sans' as const, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'none' as const, fontStyle: 'normal' as const },
};

// ─── Effect + icon class combos ───────────────────────────────────────────────

const fx = {
  none: '',
  shimmer: styles.effectShimmer ?? '',
  glowPulse: styles.effectGlowPulse ?? '',
  scanline: styles.effectScanline ?? '',
  float: styles.effectFloat ?? '',
  glitch: cn(styles.effectGlitch, styles.effectBrackets),
  cursor: styles.effectCursor ?? '',
  brackets: styles.effectBrackets ?? '',
  dots: styles.effectDots ?? '',
  underline: styles.effectUnderline ?? '',
  glitchBrackets: cn(styles.effectGlitch, styles.effectBrackets),
  glowDots: cn(styles.effectGlowPulse, styles.effectDots),
  shimmerCursor: cn(styles.effectShimmer, styles.effectCursor),
  shimmerDots: cn(styles.effectShimmer, styles.effectDots),
  neon: styles.effectNeon ?? '',
  holographic: styles.effectHolographic ?? '',
  glitchFlicker: styles.effectGlitchFlicker ?? '',
  fire: styles.effectFire ?? '',
  ice: styles.effectIce ?? '',
  matrix: styles.effectMatrix ?? '',
  aurora: styles.effectAurora ?? '',
  pulseRing: styles.effectPulseRing ?? '',
  typewriterLine: styles.effectTypewriterLine ?? '',
  thunderStrike: styles.effectThunderStrike ?? '',
  neonHolo: cn(styles.effectNeon, styles.effectHolographic),
  glitchMatrix: cn(styles.effectGlitchFlicker, styles.effectMatrix),
  auroraPulse: cn(styles.effectAurora, styles.effectPulseRing),
  fireThunder: cn(styles.effectFire, styles.effectThunderStrike),
  iceTypewriter: cn(styles.effectIce, styles.effectTypewriterLine),
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
  architect: { border: '1px solid rgba(99, 102, 241, 0.3)', shadow: '0 0 20px rgba(99, 102, 241, 0.15), inset 0 0 20px rgba(99, 102, 241, 0.05)' },
  security:  { border: '1px solid rgba(220, 38, 38, 0.3)', shadow: '0 0 20px rgba(220, 38, 38, 0.15), inset 0 0 20px rgba(220, 38, 38, 0.05)' },
  sorcerer:  { border: '1px solid rgba(139, 92, 246, 0.35)', shadow: '0 0 25px rgba(139, 92, 246, 0.2), inset 0 0 25px rgba(139, 92, 246, 0.05)' },
  alchemist: { border: '1px solid rgba(217, 119, 6, 0.35)', shadow: '0 0 25px rgba(217, 119, 6, 0.2), inset 0 0 20px rgba(217, 119, 6, 0.05)' },
  designer:  { border: '1px solid rgba(20, 184, 166, 0.2)', shadow: '0 0 15px rgba(20, 184, 166, 0.1)' },
  sculptor:  { border: '1px solid rgba(244, 63, 94, 0.25)', shadow: '0 0 20px rgba(244, 63, 94, 0.15), inset 0 0 15px rgba(244, 63, 94, 0.05)' },
  artisan:   { border: '1px solid rgba(180, 83, 9, 0.25)', shadow: '0 0 15px rgba(180, 83, 9, 0.1)' },
  crafter:   { border: '1px solid rgba(16, 185, 129, 0.25)', shadow: '0 0 20px rgba(16, 185, 129, 0.15)' },
  virtuoso:  { border: '1px solid rgba(249, 115, 22, 0.35)', shadow: '0 0 30px rgba(249, 115, 22, 0.2), inset 0 0 20px rgba(249, 115, 22, 0.05)' },
  mage:      { border: '1px solid rgba(124, 58, 237, 0.3)', shadow: '0 0 25px rgba(124, 58, 237, 0.2), inset 0 0 25px rgba(124, 58, 237, 0.05)' },
  visionary: { border: '1px solid rgba(6, 182, 212, 0.2)', shadow: '0 0 20px rgba(6, 182, 212, 0.1)' },
  mapper:    { border: '1px solid rgba(13, 148, 136, 0.25)', shadow: '0 0 15px rgba(13, 148, 136, 0.1)' },
  orchestrator:{ border: '1px solid rgba(147, 51, 234, 0.35)', shadow: '0 0 30px rgba(147, 51, 234, 0.2), inset 0 0 20px rgba(147, 51, 234, 0.05)' },
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
  none:      { border: 'none', shadow: 'none' },
};

// ─── All 44 word themes ───────────────────────────────────────────────────────

const WORD_THEMES: WordTheme[] = [
  // ═══ ARCHITECTS — security + systems precision ═══
  theme("cybernetic architect", { gradient: "linear-gradient(135deg, #334155, #4f46e5, #0ea5e9)", darkGradient: "linear-gradient(135deg, #cbd5e1, #a5b4fc, #7dd3fc)", glow: "rgba(79, 70, 229, 0.55)" },
    typo.architect, Cpu, 'left', ic.orbit, 'glitchBurst', fx.glitchMatrix, ctr.neural, 'glitchDecode',
    { renderMeta: { decodeCycles: 5 }, iconWrapperClass: 'inline-flex', iconMotion: { initial: { opacity: 0, rotate: -40, scale: 0.7 }, animate: { opacity: 1, rotate: 0, scale: 1 }, transition: { duration: 0.45, ease: 'easeOut' } } }),
  theme("code architect", { gradient: "linear-gradient(135deg, #1e293b, #2563eb, #6366f1)", darkGradient: "linear-gradient(135deg, #e2e8f0, #93c5fd, #c4b5fd)", glow: "rgba(59, 130, 246, 0.5)" },
    { ...typo.architectCode, letterSpacing: '0.07em' }, Braces, 'left', ic.none, 'blueprintFold', fx.iceTypewriter, ctr.precision, 'typewriter',
    { renderMeta: { segmentMode: 'word', stagger: 0.085 }, iconMotion: { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3 } } }),
  theme("zero trust architect", { gradient: "linear-gradient(135deg, #374151, #b91c1c, #7f1d1d)", darkGradient: "linear-gradient(135deg, #cbd5e1, #fca5a5, #fecaca)", glow: "rgba(220, 38, 38, 0.56)" },
    { ...typo.architectBold, letterSpacing: '0.05em' }, Fingerprint, 'left', ic.alarm, 'lockdownSweep', fx.scanline, ctr.securityPulse, 'reveal',
    {
      renderMeta: { revealDirection: 'right', revealSkew: -12 },
      secondaryIcon: ShieldCheck,
      secondaryIconPosition: 'right',
      secondaryIconClass: ic.zap,
      iconWrapperClass: 'inline-flex',
      iconMotion: { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3 } },
      secondaryIconMotion: { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: [1.08, 0.96, 1] }, transition: { duration: 0.45 } },
    }),
  theme("synthetic intelligence architect", { gradient: "linear-gradient(135deg, #1e1b4b, #4f46e5, #0284c7)", darkGradient: "linear-gradient(135deg, #c7d2fe, #a5b4fc, #bae6fd)", glow: "rgba(99, 102, 241, 0.58)" },
    typo.architectNeural, BrainCircuit, 'left', ic.pulse, 'prismFlip3D', fx.neonHolo, ctr.neural, 'morphText',
    {
      secondaryIcon: Cpu,
      secondaryIconPosition: 'right',
      secondaryIconClass: ic.orbit,
      iconWrapperClass: 'inline-flex',
      iconMotion: { initial: { opacity: 0, scale: 0.7, y: 8 }, animate: { opacity: 1, scale: 1, y: 0 }, transition: { duration: 0.42 } },
      secondaryIconMotion: { initial: { opacity: 0, rotate: -20 }, animate: { opacity: 1, rotate: 0 }, transition: { duration: 0.4, delay: 0.06 } },
    }),

  // ═══ SORCERERS / MYSTICS / CONJURERS — arcane computation ═══
  theme("data sorcerer", { gradient: "linear-gradient(270deg, #6d28d9, #8b5cf6, #d946ef)", darkGradient: "linear-gradient(270deg, #a78bfa, #c4b5fd, #f0abfc)", glow: "rgba(139, 92, 246, 0.6)" },
    { ...typo.sorcerer, letterSpacing: '0.08em' }, WandSparkles, 'right', ic.cast, 'materialize', fx.auroraPulse, ctr.mystic, 'wave',
    {
      renderMeta: { waveLift: 9 },
      secondaryIcon: Sparkles,
      secondaryIconPosition: 'left',
      secondaryIconClass: ic.pulse,
      iconWrapperClass: 'inline-flex',
      iconMotion: { initial: { opacity: 0, y: 12, rotate: 8 }, animate: { opacity: 1, y: 0, rotate: 0 }, transition: { duration: 0.5 } },
      secondaryIconMotion: { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: [0.8, 1.06, 1] }, transition: { duration: 0.45 } },
    }),
  theme("technological conjurer", { gradient: "linear-gradient(300deg, #7e22ce, #9333ea, #d946ef)", darkGradient: "linear-gradient(300deg, #c084fc, #d8b4fe, #f5d0fe)", glow: "rgba(147, 51, 234, 0.58)" },
    typo.sorcerer, Sparkles, 'right', ic.pulse, 'weave', fx.shimmerDots, ctr.mystic, 'morphText',
    {
      secondaryIcon: WandSparkles,
      secondaryIconPosition: 'left',
      secondaryIconClass: ic.cast,
      iconWrapperClass: 'inline-flex',
      secondaryIconMotion: { initial: { opacity: 0, scale: 0.6 }, animate: { opacity: 1, scale: [0.85, 1.05, 1] }, transition: { duration: 0.5 } },
    }),
  theme("innovation mystic", { gradient: "linear-gradient(270deg, #4338ca, #6366f1, #38bdf8)", darkGradient: "linear-gradient(270deg, #a5b4fc, #c7d2fe, #bae6fd)", glow: "rgba(99, 102, 241, 0.55)" },
    { ...typo.sorcerer, letterSpacing: '0.1em', fontWeight: 400 }, Lightbulb, 'right', ic.float, 'auroraBloom', fx.aurora, ctr.visionaryHalo, 'cascade',
    { renderMeta: { segmentMode: 'word', stagger: 0.075, cascadeDistance: 22 }, iconMotion: { initial: { opacity: 0, rotate: -16 }, animate: { opacity: 1, rotate: 0 }, transition: { duration: 0.5 } } }),

  // ═══ ALCHEMISTS — transmutation lab ═══
  theme("systems alchemist", { gradient: "linear-gradient(45deg, #b45309, #d97706, #f59e0b)", darkGradient: "linear-gradient(45deg, #fbbf24, #fcd34d, #fef08a)", glow: "rgba(217, 119, 6, 0.62)" },
    typo.alchemist, FlaskConical, 'left', ic.pour, 'forgeHammer', fx.fire, ctr.alchemy, 'split',
    { renderMeta: { splitDistance: 22 }, iconMotion: { initial: { opacity: 0, y: 8, rotate: -10 }, animate: { opacity: 1, y: 0, rotate: 0 }, transition: { duration: 0.42 } } }),
  theme("distributed systems alchemist", { gradient: "linear-gradient(45deg, #78350f, #a16207, #f59e0b)", darkGradient: "linear-gradient(45deg, #fde68a, #fcd34d, #fef08a)", glow: "rgba(245, 158, 11, 0.6)" },
    { ...typo.alchemistMed, letterSpacing: '0.01em' }, TestTube, 'left', ic.bounce, 'forgeHammer', fx.shimmer, ctr.alchemy, 'cascade',
    { renderMeta: { segmentMode: 'word', stagger: 0.055, cascadeDistance: 20 } }),
  theme("code alchemist", { gradient: "linear-gradient(45deg, #92400e, #d97706, #facc15)", darkGradient: "linear-gradient(45deg, #fcd34d, #fde68a, #fef9c3)", glow: "rgba(217, 119, 6, 0.6)" },
    typo.alchemistCode, Binary, 'left', ic.none, 'thunderExit', fx.shimmerCursor, ctr.alchemy, 'glitchDecode',
    {
      renderMeta: { decodeCycles: 3 },
      secondaryIcon: FlaskConical,
      secondaryIconPosition: 'right',
      secondaryIconClass: ic.pour,
      iconWrapperClass: 'inline-flex',
      secondaryIconMotion: { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.35 } },
    }),

  // ═══ DESIGNERS — precision + semantic motion ═══
  theme("quantum designer", { gradient: "linear-gradient(90deg, #0f766e, #14b8a6, #2dd4bf)", darkGradient: "linear-gradient(90deg, #5eead4, #99f6e4, #a7f3d0)", glow: "rgba(20, 184, 166, 0.42)" },
    { ...typo.designer, letterSpacing: '0.11em' }, Atom, 'right', ic.spin, 'slideUp', fx.holographic, ctr.precision, 'wave'),
  theme("ecosystem designer", { gradient: "linear-gradient(90deg, #15803d, #16a34a, #14b8a6)", darkGradient: "linear-gradient(90deg, #86efac, #bbf7d0, #5eead4)", glow: "rgba(16, 185, 129, 0.45)" },
    { ...typo.designer, fontWeight: 300 }, Sprout, 'right', ic.bounce, 'growSeed', fx.aurora, ctr.organic, 'reveal',
    { renderMeta: { revealDirection: 'left' } }),
  theme("behavioral designer", { gradient: "linear-gradient(90deg, #0d9488, #0ea5e9, #6366f1)", darkGradient: "linear-gradient(90deg, #5eead4, #7dd3fc, #a5b4fc)", glow: "rgba(14, 165, 233, 0.44)" },
    { ...typo.designer, letterSpacing: '0.085em' }, Brain, 'right', ic.pulse, 'slideLeft', fx.underline, ctr.precision, 'cascade',
    { renderMeta: { segmentMode: 'word', stagger: 0.065, cascadeDistance: 18 } }),
  theme("adaptive systems designer", { gradient: "linear-gradient(90deg, #0f766e, #059669, #65a30d)", darkGradient: "linear-gradient(90deg, #5eead4, #6ee7b7, #bef264)", glow: "rgba(5, 150, 105, 0.44)" },
    { ...typo.designerMed, letterSpacing: '0.07em' }, SlidersHorizontal, 'right', ic.drift, 'skewSettle', fx.underline, ctr.precision, 'split'),
  theme("process designer", { gradient: "linear-gradient(90deg, #0e7490, #14b8a6, #22c55e)", darkGradient: "linear-gradient(90deg, #67e8f9, #5eead4, #86efac)", glow: "rgba(20, 184, 166, 0.44)" },
    typo.designer, GitMerge, 'right', ic.conduct, 'slideRight', fx.typewriterLine, ctr.precision, 'typewriter',
    {
      renderMeta: { segmentMode: 'word', stagger: 0.09 },
      secondaryIcon: GitBranch,
      secondaryIconPosition: 'left',
      secondaryIconClass: ic.none,
      iconWrapperClass: 'inline-flex',
      secondaryIconMotion: { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.32 } },
    }),
  theme("quantum systems designer", { gradient: "linear-gradient(90deg, #4338ca, #6d28d9, #a21caf)", darkGradient: "linear-gradient(90deg, #a5b4fc, #c4b5fd, #f0abfc)", glow: "rgba(109, 40, 217, 0.54)" },
    { ...typo.designer, letterSpacing: '0.09em' }, Radar, 'right', ic.orbit, 'prismFlip3D', fx.neon, ctr.neural, 'morphText'),
  theme("machine learning designer", { gradient: "linear-gradient(90deg, #2563eb, #0ea5e9, #06b6d4)", darkGradient: "linear-gradient(90deg, #93c5fd, #7dd3fc, #67e8f9)", glow: "rgba(14, 165, 233, 0.45)" },
    typo.designerMed, Cpu, 'right', ic.pulse, 'glitchIn', fx.matrix, ctr.neural, 'glitchDecode',
    { renderMeta: { decodeCycles: 4 } }),

  // ═══ SCULPTORS — crafted forms + tactile motion ═══
  theme("digital sculptor", { gradient: "linear-gradient(180deg, #be123c, #e11d48, #fb7185)", darkGradient: "linear-gradient(180deg, #fda4af, #fecdd3, #ffe4e6)", glow: "rgba(244, 63, 94, 0.52)" },
    { ...typo.sculptor, fontStyle: 'normal' }, PenTool, 'left', ic.chisel, 'sculpt3D', fx.fireThunder, ctr.sculptor, 'split',
    { renderMeta: { splitDistance: 24 } }),
  theme("augmented reality sculptor", { gradient: "linear-gradient(180deg, #be185d, #db2777, #f472b6)", darkGradient: "linear-gradient(180deg, #f9a8d4, #fbcfe8, #fce7f3)", glow: "rgba(236, 72, 153, 0.54)" },
    { ...typo.sculptorMed, letterSpacing: '0.045em' }, Glasses, 'left', ic.float, 'prismFlip3D', fx.holographic, ctr.sculptor, 'reveal',
    {
      renderMeta: { revealDirection: 'left' },
      secondaryIcon: Radar,
      secondaryIconPosition: 'right',
      secondaryIconClass: ic.orbit,
      iconWrapperClass: 'inline-flex',
      secondaryIconMotion: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.4 } },
    }),
  theme("resilience sculptor", { gradient: "linear-gradient(180deg, #9f1239, #e11d48, #f43f5e)", darkGradient: "linear-gradient(180deg, #fda4af, #fecdd3, #ffe4e6)", glow: "rgba(225, 29, 72, 0.5)" },
    { ...typo.sculptorMed, fontWeight: 500 }, Gem, 'left', ic.pulse, 'springOvershoot', fx.pulseRing, ctr.sculptor, 'morphText'),
  theme("information sculptor", { gradient: "linear-gradient(180deg, #ea580c, #ef4444, #ec4899)", darkGradient: "linear-gradient(180deg, #fdba74, #fca5a5, #f9a8d4)", glow: "rgba(239, 68, 68, 0.52)" },
    { ...typo.sculptor, letterSpacing: '0.05em' }, Boxes, 'left', ic.float, 'slideUp', fx.shimmerDots, ctr.sculptor, 'cascade',
    { renderMeta: { stagger: 0.02 } }),
  theme("experience sculptor", { gradient: "linear-gradient(180deg, #ea580c, #e11d48, #be185d)", darkGradient: "linear-gradient(180deg, #fdba74, #fda4af, #fbcfe8)", glow: "rgba(225, 29, 72, 0.52)" },
    { ...typo.sculptor, fontWeight: 400 }, Heart, 'left', ic.pulse, 'dreamFloat', fx.auroraPulse, ctr.sculptor, 'wave'),

  // ═══ ARTISANS / CRAFTSMEN — forged reliability ═══
  theme("intelligence artisan", { gradient: "linear-gradient(120deg, #92400e, #b45309, #d97706)", darkGradient: "linear-gradient(120deg, #fbbf24, #f59e0b, #fcd34d)", glow: "rgba(180, 83, 9, 0.52)" },
    { ...typo.artisan, letterSpacing: '0.025em' }, Lightbulb, 'left', ic.zap, 'slideDown', fx.fire, ctr.artisan, 'reveal',
    { renderMeta: { revealDirection: 'left' } }),
  theme("cyber defense artisan", { gradient: "linear-gradient(120deg, #dc2626, #b45309, #ea580c)", darkGradient: "linear-gradient(120deg, #fca5a5, #fbbf24, #fdba74)", glow: "rgba(220, 38, 38, 0.54)" },
    { ...typo.artisan, textTransform: 'uppercase' as const, letterSpacing: '0.035em' }, ShieldCheck, 'left', ic.alarm, 'shieldDeploy', fx.glitchMatrix, ctr.securityPulse, 'glitchDecode',
    { renderMeta: { decodeCycles: 3 } }),
  theme("blockchain artisan", { gradient: "linear-gradient(120deg, #78350f, #a16207, #ca8a04)", darkGradient: "linear-gradient(120deg, #fde68a, #fcd34d, #fbbf24)", glow: "rgba(161, 98, 7, 0.52)" },
    typo.artisanMono, Link, 'left', ic.none, 'blueprintFold', fx.shimmerCursor, ctr.artisan, 'scramble',
    {
      secondaryIcon: Workflow,
      secondaryIconPosition: 'right',
      secondaryIconClass: ic.conduct,
      iconWrapperClass: 'inline-flex',
      secondaryIconMotion: { initial: { opacity: 0, x: 6 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.35 } },
    }),
  theme("cybersecurity artisan", { gradient: "linear-gradient(120deg, #b91c1c, #dc2626, #f97316)", darkGradient: "linear-gradient(120deg, #fca5a5, #fecaca, #fdba74)", glow: "rgba(185, 28, 28, 0.54)" },
    typo.artisanBold, Lock, 'left', ic.zap, 'shieldDeploy', fx.scanline, ctr.securityPulse, 'reveal',
    {
      renderMeta: { revealDirection: 'right' },
      secondaryIcon: Fingerprint,
      secondaryIconPosition: 'right',
      secondaryIconClass: ic.pulse,
      iconWrapperClass: 'inline-flex',
      secondaryIconMotion: { initial: { opacity: 0, scale: 0.75 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.35 } },
    }),
  theme("knowledge craftsman", { gradient: "linear-gradient(120deg, #a16207, #ca8a04, #eab308)", darkGradient: "linear-gradient(120deg, #fcd34d, #fde68a, #fef9c3)", glow: "rgba(202, 138, 4, 0.52)" },
    { ...typo.artisan, fontWeight: 500 }, BookOpen, 'left', ic.none, 'slideDown', fx.iceTypewriter, ctr.artisan, 'typewriter',
    { renderMeta: { segmentMode: 'word', stagger: 0.085 } }),

  // ═══ CRAFTERS — living systems growth ═══
  theme("experience crafter", { gradient: "linear-gradient(150deg, #059669, #10b981, #34d399)", darkGradient: "linear-gradient(150deg, #6ee7b7, #a7f3d0, #bbf7d0)", glow: "rgba(16, 185, 129, 0.52)" },
    { ...typo.crafter, fontWeight: 500 }, Palette, 'right', ic.bounce, 'growSeed', fx.aurora, ctr.organic, 'wave'),
  theme("edge systems crafter", { gradient: "linear-gradient(150deg, #047857, #0d9488, #0891b2)", darkGradient: "linear-gradient(150deg, #6ee7b7, #5eead4, #67e8f9)", glow: "rgba(13, 148, 136, 0.52)" },
    { ...typo.crafter, letterSpacing: '0.045em' }, Route, 'right', ic.compassLock, 'slideRight', fx.matrix, ctr.mapperGrid, 'split'),
  theme("future systems crafter", { gradient: "linear-gradient(150deg, #16a34a, #22c55e, #84cc16)", darkGradient: "linear-gradient(150deg, #86efac, #bbf7d0, #d9f99d)", glow: "rgba(34, 197, 94, 0.52)" },
    { ...typo.crafter, letterSpacing: '0.06em' }, Satellite, 'right', ic.drift, 'growSeed', fx.auroraPulse, ctr.organic, 'reveal',
    { renderMeta: { revealDirection: 'right' } }),

  // ═══ VIRTUOSOS / ARTISTS — high-energy performance ═══
  theme("automation virtuoso", { gradient: "linear-gradient(160deg, #e11d48, #f97316, #eab308)", darkGradient: "linear-gradient(160deg, #fb7185, #fdba74, #fde047)", glow: "rgba(249, 115, 22, 0.62)" },
    typo.virtuoso, Zap, 'left', ic.zap, 'thunderExit', fx.fireThunder, ctr.virtuosoShell, 'cascade',
    { renderMeta: { segmentMode: 'word', stagger: 0.048, cascadeDistance: 22 } }),
  theme("robotics artist", { gradient: "linear-gradient(160deg, #a855f7, #c026d3, #ec4899)", darkGradient: "linear-gradient(160deg, #d8b4fe, #e879f9, #f9a8d4)", glow: "rgba(192, 38, 211, 0.54)" },
    typo.virtuosoBold, Bot, 'left', ic.pulse, 'zoomBlur', fx.neonHolo, ctr.virtuosoShell, 'morphText',
    {
      secondaryIcon: Factory,
      secondaryIconPosition: 'right',
      secondaryIconClass: ic.none,
      iconWrapperClass: 'inline-flex',
      secondaryIconMotion: { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: 0.05 } },
    }),
  theme("intelligent systems artist", { gradient: "linear-gradient(160deg, #7c3aed, #c026d3, #ec4899)", darkGradient: "linear-gradient(160deg, #c4b5fd, #e879f9, #f9a8d4)", glow: "rgba(168, 85, 247, 0.54)" },
    { ...typo.virtuosoBold, letterSpacing: '0.01em' }, BrainCircuit, 'left', ic.orbit, 'glitchBurst', fx.glitchFlicker, ctr.virtuosoShell, 'glitchDecode',
    { renderMeta: { decodeCycles: 4 } }),
  theme("scalability artist", { gradient: "linear-gradient(160deg, #be185d, #ec4899, #8b5cf6)", darkGradient: "linear-gradient(160deg, #f9a8d4, #fbcfe8, #c4b5fd)", glow: "rgba(236, 72, 153, 0.54)" },
    typo.virtuoso, Gauge, 'left', ic.zap, 'springOvershoot', fx.pulseRing, ctr.virtuosoShell, 'split'),

  // ═══ MAGES / WEAVERS — procedural sorcery ═══
  theme("workflow mage", { gradient: "linear-gradient(240deg, #4338ca, #7c3aed, #6366f1)", darkGradient: "linear-gradient(240deg, #a5b4fc, #c4b5fd, #a5b4fc)", glow: "rgba(124, 58, 237, 0.56)" },
    typo.mage, Workflow, 'left', ic.conduct, 'weave', fx.shimmerDots, ctr.mystic, 'wave',
    {
      renderMeta: { segmentMode: 'word', stagger: 0.052, waveLift: 11 },
      secondaryIcon: WandSparkles,
      secondaryIconPosition: 'right',
      secondaryIconClass: ic.cast,
      iconWrapperClass: 'inline-flex',
      iconMotion: { initial: { opacity: 0, rotate: -10, y: 8 }, animate: { opacity: 1, rotate: 0, y: 0 }, transition: { duration: 0.4 } },
      secondaryIconMotion: { initial: { opacity: 0, rotate: 15 }, animate: { opacity: 1, rotate: 0 }, transition: { duration: 0.42, delay: 0.04 } },
    }),
  theme("algorithm weaver", { gradient: "linear-gradient(200deg, #4f46e5, #7c3aed, #8b5cf6)", darkGradient: "linear-gradient(200deg, #a5b4fc, #c4b5fd, #ddd6fe)", glow: "rgba(124, 58, 237, 0.52)" },
    { ...typo.mage, letterSpacing: '0.07em', fontStyle: 'normal' }, GitBranch, 'right', ic.conduct, 'weave', fx.shimmer, ctr.mystic, 'cascade',
    { renderMeta: { stagger: 0.018 } }),

  // ═══ VISIONARIES / DREAMERS / FUTURISTS — airy long-horizon motion ═══
  theme("platform visionary", { gradient: "linear-gradient(0deg, #0891b2, #06b6d4, #22d3ee)", darkGradient: "linear-gradient(0deg, #67e8f9, #a5f3fc, #cffafe)", glow: "rgba(6, 182, 212, 0.5)" },
    typo.visionary, Telescope, 'right', ic.float, 'auroraBloom', fx.float, ctr.visionaryHalo, 'standard',
    { iconMotion: { initial: { opacity: 0, y: 10, rotate: -6 }, animate: { opacity: 1, y: 0, rotate: 0 }, transition: { duration: 0.52 } } }),
  theme("systems dreamer", { gradient: "linear-gradient(0deg, #7c3aed, #818cf8, #38bdf8)", darkGradient: "linear-gradient(0deg, #c4b5fd, #c7d2fe, #bae6fd)", glow: "rgba(129, 140, 248, 0.52)" },
    typo.visionaryItalic, Moon, 'right', ic.drift, 'dreamFloat', fx.aurora, ctr.visionaryHalo, 'morphText'),
  theme("digital futurist", { gradient: "linear-gradient(330deg, #06b6d4, #3b82f6, #8b5cf6)", darkGradient: "linear-gradient(330deg, #67e8f9, #93c5fd, #c4b5fd)", glow: "rgba(59, 130, 246, 0.52)" },
    { ...typo.visionary, fontWeight: 300, letterSpacing: '0.1em' }, Radar, 'right', ic.orbit, 'drift', fx.neon, ctr.visionaryHalo, 'wave',
    { renderMeta: { segmentMode: 'word', stagger: 0.05, waveLift: 10 } }),
  theme("enterprise dreamer", { gradient: "linear-gradient(0deg, #0284c7, #818cf8, #a78bfa)", darkGradient: "linear-gradient(0deg, #7dd3fc, #c7d2fe, #ddd6fe)", glow: "rgba(129, 140, 248, 0.52)" },
    { ...typo.visionaryItalic, letterSpacing: '0.11em' }, Factory, 'right', ic.float, 'dreamFloat', fx.holographic, ctr.visionaryHalo, 'split'),

  // ═══ SHAPERS / MAPPERS / CARTOGRAPHERS — navigation + route synthesis ═══
  theme("cloud shaper", { gradient: "linear-gradient(90deg, #0284c7, #38bdf8, #67e8f9)", darkGradient: "linear-gradient(90deg, #7dd3fc, #bae6fd, #a5f3fc)", glow: "rgba(56, 189, 248, 0.52)" },
    typo.mapperLight, Cloud, 'left', ic.float, 'slideRight', fx.ice, ctr.visionaryHalo, 'reveal',
    { renderMeta: { revealDirection: 'right' } }),
  theme("AI cartographer", { gradient: "linear-gradient(60deg, #0d9488, #059669, #0284c7)", darkGradient: "linear-gradient(60deg, #5eead4, #6ee7b7, #7dd3fc)", glow: "rgba(13, 148, 136, 0.52)" },
    { ...typo.mapper, letterSpacing: '0.055em' }, Map, 'left', ic.none, 'cartographyTilt', fx.matrix, ctr.mapperGrid, 'cascade',
    {
      renderMeta: { segmentMode: 'word', stagger: 0.055, cascadeDistance: 18 },
      secondaryIcon: Radar,
      secondaryIconPosition: 'right',
      secondaryIconClass: ic.orbit,
      iconWrapperClass: 'inline-flex',
      secondaryIconMotion: { initial: { opacity: 0, rotate: -18 }, animate: { opacity: 1, rotate: 0 }, transition: { duration: 0.38 } },
    }),
  theme("technological mapper", { gradient: "linear-gradient(60deg, #0f766e, #0891b2, #0284c7)", darkGradient: "linear-gradient(60deg, #5eead4, #67e8f9, #7dd3fc)", glow: "rgba(8, 145, 178, 0.52)" },
    typo.mapper, Navigation, 'left', ic.compassLock, 'cartographyTilt', fx.scanline, ctr.mapperGrid, 'split',
    {
      renderMeta: { splitDistance: 20 },
      secondaryIcon: Compass,
      secondaryIconPosition: 'right',
      secondaryIconClass: ic.spin,
      iconWrapperClass: 'inline-flex',
      secondaryIconMotion: { initial: { opacity: 0, rotate: -25 }, animate: { opacity: 1, rotate: 0 }, transition: { duration: 0.38 } },
    }),

  // ═══ ORCHESTRATOR — grand conductor bloom ═══
  theme("data orchestrator", { gradient: "linear-gradient(225deg, #7e22ce, #9333ea, #be123c)", darkGradient: "linear-gradient(225deg, #d8b4fe, #e9d5ff, #fda4af)", glow: "rgba(147, 51, 234, 0.62)" },
    typo.orchestrator, Music, 'left', ic.conduct, 'orchestralSwell', fx.auroraPulse, ctr.orchestratorStage, 'morphText',
    {
      secondaryIcon: Workflow,
      secondaryIconPosition: 'right',
      secondaryIconClass: ic.pulse,
      iconWrapperClass: 'inline-flex',
      secondaryIconMotion: { initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.38, ease: 'easeOut' } },
    }),
];

// ─── Shuffle helper (Fisher-Yates, avoids same-category clusters) ─────────────

function shuffleThemes(themes: WordTheme[]): WordTheme[] {
  const arr = [...themes];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getMotionUnits(text: string, segmentMode: 'char' | 'word' = 'char'): string[] {
  if (segmentMode === 'word') {
    return text.match(/\S+\s*/g) ?? [text];
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

type ThemeFamily =
  | 'architect'
  | 'security'
  | 'sorcerer'
  | 'alchemist'
  | 'designer'
  | 'sculptor'
  | 'artisan'
  | 'crafter'
  | 'virtuoso'
  | 'mage'
  | 'visionary'
  | 'mapper'
  | 'orchestrator';

interface StructuralSignature {
  shellClasses: string[];
  ambientClasses: string[];
  eyebrowClasses: string[];
  detailClasses: string[];
  ornamentClasses: string[];
  iconBadgeClasses: string[];
  eyebrows: string[];
  details: string[];
  ornaments: string[];
}

function pickSeeded<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function inferThemeFamily(text: string): ThemeFamily {
  if (text.includes('orchestrator')) return 'orchestrator';
  if (text.includes('cyber defense') || text.includes('cybersecurity') || text.includes('zero trust')) return 'security';
  if (text.includes('architect')) return text.includes('trust') ? 'security' : 'architect';
  if (text.includes('sorcerer') || text.includes('conjurer') || text.includes('mystic')) return 'sorcerer';
  if (text.includes('alchemist')) return 'alchemist';
  if (text.includes('designer')) return 'designer';
  if (text.includes('sculptor')) return 'sculptor';
  if (text.includes('artisan') || text.includes('craftsman')) return 'artisan';
  if (text.includes('crafter')) return 'crafter';
  if (text.includes('virtuoso') || text.includes('artist')) return 'virtuoso';
  if (text.includes('mage') || text.includes('weaver')) return 'mage';
  if (text.includes('visionary') || text.includes('dreamer') || text.includes('futurist')) return 'visionary';
  if (text.includes('mapper') || text.includes('cartographer') || text.includes('cloud shaper')) return 'mapper';
  return 'architect';
}

const structuralSignatures: Record<ThemeFamily, StructuralSignature> = {
  architect: {
    shellClasses: [styles.shellBlueprint, styles.shellMonolith, styles.shellCartography],
    ambientClasses: [styles.ambientCircuit, styles.ambientCoordinates, styles.ambientSweep],
    eyebrowClasses: [styles.eyebrowDraft, styles.eyebrowChip],
    detailClasses: [styles.detailEtched, styles.detailOrbit],
    ornamentClasses: [styles.ornamentSignal, styles.ornamentBrackets],
    iconBadgeClasses: [styles.iconBadgeFrame, styles.iconBadgeGlyph],
    eyebrows: ['schema lattice', 'systems board', 'compiled frame', 'runtime geometry'],
    details: ['signal grid', 'mesh locked', 'axis mapped', 'logic spine'],
    ornaments: ['<>', '::', '010', '[[]]'],
  },
  security: {
    shellClasses: [styles.shellVault, styles.shellBeacon, styles.shellMonolith],
    ambientClasses: [styles.ambientPulse, styles.ambientSweep, styles.ambientCircuit],
    eyebrowClasses: [styles.eyebrowAlarm, styles.eyebrowChip],
    detailClasses: [styles.detailAlarm, styles.detailEtched],
    ornamentClasses: [styles.ornamentSignal, styles.ornamentBrackets],
    iconBadgeClasses: [styles.iconBadgeVault, styles.iconBadgeFrame],
    eyebrows: ['sealed perimeter', 'threat model', 'policy mesh', 'trust boundary'],
    details: ['anomaly live', 'audit pulse', 'shielded path', 'zero trust'],
    ornaments: ['///', '!!', '[SAFE]', '<LOCK>'],
  },
  sorcerer: {
    shellClasses: [styles.shellSigil, styles.shellLoom, styles.shellBloom],
    ambientClasses: [styles.ambientRune, styles.ambientAurora, styles.ambientSpectrum],
    eyebrowClasses: [styles.eyebrowMist, styles.eyebrowAura],
    detailClasses: [styles.detailAura, styles.detailOrbit],
    ornamentClasses: [styles.ornamentHalo, styles.ornamentGlyph],
    iconBadgeClasses: [styles.iconBadgeOrb, styles.iconBadgeSpark],
    eyebrows: ['arcane runtime', 'spell lattice', 'ritual engine', 'veil current'],
    details: ['glyph wake', 'mana surge', 'rune drift', 'arc set'],
    ornaments: ['✦', '☽', '⟡', '✶'],
  },
  alchemist: {
    shellClasses: [styles.shellForge, styles.shellBlueprint, styles.shellBloom],
    ambientClasses: [styles.ambientEmber, styles.ambientSweep, styles.ambientRune],
    eyebrowClasses: [styles.eyebrowChip, styles.eyebrowAura],
    detailClasses: [styles.detailEtched, styles.detailChip],
    ornamentClasses: [styles.ornamentGlyph, styles.ornamentSignal],
    iconBadgeClasses: [styles.iconBadgeSpark, styles.iconBadgeFrame],
    eyebrows: ['crucible logic', 'transmute loop', 'reaction field', 'golden syntax'],
    details: ['element tuned', 'fused state', 'volatile blend', 'heat mapped'],
    ornaments: ['△', '⚗', '◈', '∴'],
  },
  designer: {
    shellClasses: [styles.shellDraft, styles.shellCartography, styles.shellBlueprint],
    ambientClasses: [styles.ambientMesh, styles.ambientCoordinates, styles.ambientTide],
    eyebrowClasses: [styles.eyebrowDraft, styles.eyebrowChip],
    detailClasses: [styles.detailChip, styles.detailEtched],
    ornamentClasses: [styles.ornamentBrackets, styles.ornamentSignal],
    iconBadgeClasses: [styles.iconBadgeFrame, styles.iconBadgeGlyph],
    eyebrows: ['behavior map', 'layout signal', 'pattern study', 'interaction field'],
    details: ['motion tuned', 'shape logic', 'intent curve', 'friction lowered'],
    ornaments: ['—', '::', '[]', '⋯'],
  },
  sculptor: {
    shellClasses: [styles.shellMonolith, styles.shellForge, styles.shellBloom],
    ambientClasses: [styles.ambientSpectrum, styles.ambientEmber, styles.ambientMesh],
    eyebrowClasses: [styles.eyebrowEtched, styles.eyebrowAura],
    detailClasses: [styles.detailEtched, styles.detailAura],
    ornamentClasses: [styles.ornamentGlyph, styles.ornamentHalo],
    iconBadgeClasses: [styles.iconBadgeFrame, styles.iconBadgeOrb],
    eyebrows: ['material study', 'carved signal', 'form pressure', 'surface memory'],
    details: ['edge tuned', 'mass balanced', 'shape locked', 'grain aligned'],
    ornaments: ['◢', '◈', '✺', '▣'],
  },
  artisan: {
    shellClasses: [styles.shellForge, styles.shellLoom, styles.shellVault],
    ambientClasses: [styles.ambientEmber, styles.ambientMesh, styles.ambientSweep],
    eyebrowClasses: [styles.eyebrowChip, styles.eyebrowEtched],
    detailClasses: [styles.detailChip, styles.detailEtched],
    ornamentClasses: [styles.ornamentSignal, styles.ornamentBrackets],
    iconBadgeClasses: [styles.iconBadgeSpark, styles.iconBadgeVault],
    eyebrows: ['hand tuned', 'forged intent', 'steady craft', 'field repair'],
    details: ['built to hold', 'grain checked', 'edge hardened', 'tool ready'],
    ornaments: ['#', '⟢', '⟜', '▤'],
  },
  crafter: {
    shellClasses: [styles.shellBloom, styles.shellLoom, styles.shellHorizon],
    ambientClasses: [styles.ambientTide, styles.ambientEmber, styles.ambientAurora],
    eyebrowClasses: [styles.eyebrowAura, styles.eyebrowChip],
    detailClasses: [styles.detailChip, styles.detailAura],
    ornamentClasses: [styles.ornamentHalo, styles.ornamentGlyph],
    iconBadgeClasses: [styles.iconBadgeSpark, styles.iconBadgeOrb],
    eyebrows: ['adaptive grain', 'growth pattern', 'living edge', 'soft systems'],
    details: ['branching path', 'future seeded', 'shape growing', 'loop evolving'],
    ornaments: ['❋', '◌', '✳', '↟'],
  },
  virtuoso: {
    shellClasses: [styles.shellStage, styles.shellBeacon, styles.shellSigil],
    ambientClasses: [styles.ambientSpectrum, styles.ambientSweep, styles.ambientPulse],
    eyebrowClasses: [styles.eyebrowStage, styles.eyebrowAura],
    detailClasses: [styles.detailStage, styles.detailOrbit],
    ornamentClasses: [styles.ornamentHalo, styles.ornamentSignal],
    iconBadgeClasses: [styles.iconBadgeSpark, styles.iconBadgeOrb],
    eyebrows: ['performance arc', 'tempo logic', 'spotlight state', 'high gain'],
    details: ['stage hot', 'signal loud', 'peak rise', 'timing crisp'],
    ornaments: ['✷', '⚡', '◢◣', '※'],
  },
  mage: {
    shellClasses: [styles.shellLoom, styles.shellSigil, styles.shellStage],
    ambientClasses: [styles.ambientRune, styles.ambientSpectrum, styles.ambientAurora],
    eyebrowClasses: [styles.eyebrowMist, styles.eyebrowAura],
    detailClasses: [styles.detailAura, styles.detailOrbit],
    ornamentClasses: [styles.ornamentGlyph, styles.ornamentHalo],
    iconBadgeClasses: [styles.iconBadgeOrb, styles.iconBadgeSpark],
    eyebrows: ['procedural spell', 'woven motion', 'incantation loop', 'threaded intent'],
    details: ['pattern rising', 'threads synced', 'spell aligned', 'pulse woven'],
    ornaments: ['⟡', '✧', '⟢', '☼'],
  },
  visionary: {
    shellClasses: [styles.shellHorizon, styles.shellBloom, styles.shellBeacon],
    ambientClasses: [styles.ambientAurora, styles.ambientTide, styles.ambientSpectrum],
    eyebrowClasses: [styles.eyebrowMist, styles.eyebrowStage],
    detailClasses: [styles.detailAura, styles.detailStage],
    ornamentClasses: [styles.ornamentHalo, styles.ornamentSignal],
    iconBadgeClasses: [styles.iconBadgeOrb, styles.iconBadgeFrame],
    eyebrows: ['far field', 'signal horizon', 'future trace', 'wide aperture'],
    details: ['long view', 'phase opening', 'horizon lit', 'next wave'],
    ornaments: ['~', '◎', '◠', '⤴'],
  },
  mapper: {
    shellClasses: [styles.shellCartography, styles.shellDraft, styles.shellBlueprint],
    ambientClasses: [styles.ambientCoordinates, styles.ambientMesh, styles.ambientSweep],
    eyebrowClasses: [styles.eyebrowDraft, styles.eyebrowChip],
    detailClasses: [styles.detailOrbit, styles.detailEtched],
    ornamentClasses: [styles.ornamentSignal, styles.ornamentBrackets],
    iconBadgeClasses: [styles.iconBadgeGlyph, styles.iconBadgeFrame],
    eyebrows: ['vector field', 'route grid', 'bearing locked', 'range map'],
    details: ['course set', 'nodes tracked', 'axis live', 'waypoints lit'],
    ornaments: ['⌖', '⤢', '▦', '::'],
  },
  orchestrator: {
    shellClasses: [styles.shellStage, styles.shellBeacon, styles.shellHorizon],
    ambientClasses: [styles.ambientSpectrum, styles.ambientPulse, styles.ambientAurora],
    eyebrowClasses: [styles.eyebrowStage, styles.eyebrowAura],
    detailClasses: [styles.detailStage, styles.detailOrbit],
    ornamentClasses: [styles.ornamentHalo, styles.ornamentSignal],
    iconBadgeClasses: [styles.iconBadgeSpark, styles.iconBadgeOrb],
    eyebrows: ['sync conductor', 'master score', 'signal ensemble', 'full stack cadence'],
    details: ['all channels', 'timelines fused', 'systems in time', 'tempo steady'],
    ornaments: ['♫', '✺', '◈', '⟁'],
  },
};

function createStructuralTheme(themeEntry: WordTheme, index: number): Partial<WordTheme> {
  const family = inferThemeFamily(themeEntry.text);
  const signature = structuralSignatures[family];
  const seed = createTextSeed(themeEntry.text) + index * 17;
  const supportsOrnament = ['standard', 'reveal', 'morphText', 'split'].includes(themeEntry.renderMode);
  const supportsDetail = !['scramble', 'glitchDecode', 'typewriter'].includes(themeEntry.renderMode);

  let eyebrow: string | undefined = pickSeeded(signature.eyebrows, seed, 6);
  let detailLabel: string | undefined = pickSeeded(signature.details, seed, 7);
  let ornament: string | undefined = supportsOrnament ? pickSeeded(signature.ornaments, seed, 8) : undefined;

  if (family === 'designer' || family === 'artisan' || family === 'crafter') {
    detailLabel = undefined;
    ornament = supportsOrnament && seed % 2 === 0 ? ornament : undefined;
  }

  if (family === 'sorcerer' || family === 'mage' || family === 'visionary') {
    if (seed % 2 === 0) {
      detailLabel = undefined;
    } else {
      eyebrow = undefined;
    }
  }

  if (family === 'sculptor' || family === 'alchemist' || family === 'virtuoso') {
    eyebrow = undefined;
    detailLabel = supportsDetail ? detailLabel : undefined;
  }

  if (family === 'architect' || family === 'security' || family === 'mapper') {
    ornament = supportsOrnament && seed % 3 === 0 ? ornament : undefined;
    detailLabel = supportsDetail ? detailLabel : undefined;
  }

  if (family === 'orchestrator') {
    ornament = supportsOrnament ? ornament : undefined;
    detailLabel = supportsDetail ? detailLabel : undefined;
  }

  const structuralTheme: Partial<WordTheme> = {
    shellClass: pickSeeded(signature.shellClasses, seed),
    ambientClass: pickSeeded(signature.ambientClasses, seed, 1),
    iconBadgeClass: pickSeeded(signature.iconBadgeClasses, seed, 5),
  };

  if (eyebrow) {
    structuralTheme.eyebrow = eyebrow;
    structuralTheme.eyebrowClass = pickSeeded(signature.eyebrowClasses, seed, 2);
  }

  if (detailLabel) {
    structuralTheme.detailLabel = detailLabel;
    structuralTheme.detailClass = pickSeeded(signature.detailClasses, seed, 3);
  }

  if (ornament) {
    structuralTheme.ornament = ornament;
    structuralTheme.ornamentClass = pickSeeded(signature.ornamentClasses, seed, 4);
  }

  return structuralTheme;
}

const ENHANCED_WORD_THEMES = WORD_THEMES.map((themeEntry, index) => ({
  ...themeEntry,
  ...createStructuralTheme(themeEntry, index),
}));

// ─── Scramble text component ──────────────────────────────────────────────────

const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function ScrambleText({ text, style, className }: {
  text: string;
  style: React.CSSProperties;
  className: string;
}) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let frame = 0;
    const totalFrames = text.length * 3;
    const interval = setInterval(() => {
      frame++;
      const resolved = Math.floor(frame / 3);
      let result = text.substring(0, resolved);
      for (let i = resolved; i < text.length; i++) {
        if (text[i] === ' ') result += ' ';
        else result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      setDisplayed(result);
      if (frame >= totalFrames) {
        setDisplayed(text);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span style={style} className={className}>
      {displayed || text}
    </span>
  );
}

function GlitchDecodeText({
  text,
  style,
  className,
  cycles = 4,
}: {
  text: string;
  style: React.CSSProperties;
  className: string;
  cycles?: number;
}) {
  const [displayed, setDisplayed] = useState(text);

  useEffect(() => {
    let frame = 0;
    const totalFrames = Math.max(text.length * cycles, text.length);
    const interval = setInterval(() => {
      frame += 1;
      const resolved = Math.floor((frame / totalFrames) * text.length);
      let result = text.slice(0, resolved);
      for (let i = resolved; i < text.length; i += 1) {
        if (text[i] === ' ') {
          result += ' ';
          continue;
        }
        result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      setDisplayed(result);
      if (frame >= totalFrames) {
        setDisplayed(text);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [cycles, text]);

  return (
    <span style={style} className={className}>
      {displayed}
    </span>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ANIMATION_INTERVAL = 3500;
const MAX_CHOREOGRAPHY_CHARS = 52;

// ─── Component ────────────────────────────────────────────────────────────────

export function LandingTitle() {
  const prefersReducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [shuffledThemes, setShuffledThemes] = useState<WordTheme[]>(ENHANCED_WORD_THEMES);

  const isDark = resolvedTheme === 'dark';

  // Keep initial render deterministic, then shuffle once after mount.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setShuffledThemes(shuffleThemes(ENHANCED_WORD_THEMES));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]);

  const advance = useCallback(() => {
    setWordIndex(prev => (prev + 1) % shuffledThemes.length);
  }, [shuffledThemes.length]);

  useEffect(() => {
    const timer = setInterval(advance, ANIMATION_INTERVAL);
    return () => clearInterval(timer);
  }, [advance]);

  const currentTheme = shuffledThemes[wordIndex];
  const previousThemeText = shuffledThemes[wordIndex === 0 ? shuffledThemes.length - 1 : wordIndex - 1]?.text ?? currentTheme.text;
  const Icon = currentTheme.icon;
  const SecondaryIcon = currentTheme.secondaryIcon;
  const textSeed = createTextSeed(currentTheme.text);
  const subtitleGlow = withAlpha(currentTheme.glow, isDark ? 0.48 : 0.3);
  const subtitleStroke = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(15, 23, 42, 0.08)';

  const gradientStyle: React.CSSProperties = {
    backgroundImage: isDark ? currentTheme.darkGradient : currentTheme.gradient,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextStroke: `0.012em ${subtitleStroke}`,
    filter: `drop-shadow(0 0 12px ${subtitleGlow}) brightness(${isDark ? 1.24 : 1.08}) saturate(${isDark ? 1.12 : 1.04})`,
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
    color: isDark ? 'rgba(248, 250, 252, 0.72)' : 'rgba(15, 23, 42, 0.38)',
    textShadow: isDark
      ? `0 0 22px ${withAlpha(currentTheme.glow, 0.32)}`
      : `0 0 12px ${withAlpha(currentTheme.glow, 0.16)}`,
  };

  const typographyBaseClasses = cn(
    'text-lg sm:text-xl md:text-2xl lg:text-3xl',
    'text-center leading-tight text-balance',
  );

  const typographyClasses = cn(
    typographyBaseClasses,
    "transition-[filter] duration-300 ease-out",
    currentTheme.effectClass,
  );

  const iconColor = currentTheme.glow.replace(/[\d.]+\)$/, '0.8)');

  const renderIcon = (position: 'left' | 'right') => {
    const iconsForPosition = [
      currentTheme.iconPosition === position
        ? {
            IconComponent: Icon,
            className: currentTheme.iconClass,
            motionMeta: currentTheme.iconMotion,
            key: 'primary',
          }
        : null,
      SecondaryIcon && (currentTheme.secondaryIconPosition ?? currentTheme.iconPosition) === position
        ? {
            IconComponent: SecondaryIcon,
            className: currentTheme.secondaryIconClass ?? currentTheme.iconClass,
            motionMeta: currentTheme.secondaryIconMotion ?? currentTheme.iconMotion,
            key: 'secondary',
          }
        : null,
    ].filter(Boolean) as Array<{
      IconComponent: LucideIcon;
      className: string;
      motionMeta?: IconMotionMeta;
      key: string;
    }>;

    if (!iconsForPosition.length) return null;

    return iconsForPosition.map(({ IconComponent, className, motionMeta, key }) => {
      const iconNode = (
        <span className={cn(styles.subtitleIconBadge, currentTheme.iconBadgeClass)}>
          <IconComponent
            className={cn('h-5 w-5 shrink-0 sm:h-6 sm:w-6 md:h-7 md:w-7', className)}
            style={{ color: iconColor, filter: `drop-shadow(0 0 8px ${currentTheme.glow})` }}
            aria-hidden="true"
          />
        </span>
      );

      if (prefersReducedMotion || !motionMeta) {
        return (
          <span key={key} className={currentTheme.iconWrapperClass}>
            {iconNode}
          </span>
        );
      }

      return (
        <motion.span
          key={key}
          className={currentTheme.iconWrapperClass}
          initial={motionMeta.initial}
          animate={motionMeta.animate}
          exit={motionMeta.exit}
          transition={motionMeta.transition}
        >
          {iconNode}
        </motion.span>
      );
    });
  };

  const withReadableBase = (node: React.ReactNode) => (
    <span className={styles.subtitleTextFrame}>
      <span aria-hidden="true" className={cn(styles.subtitleReadableEcho, typographyBaseClasses)} style={readableBaseStyle}>
        {currentTheme.text}
      </span>
      <span className={styles.subtitleAnimatedText}>{node}</span>
    </span>
  );

  const renderText = () => {
    const combinedStyle = { ...gradientStyle, ...typographyStyle };
    const segmentMode = currentTheme.renderMeta?.segmentMode ?? 'char';
    const motionUnits = getMotionUnits(currentTheme.text, segmentMode);
    const canRunCharChoreo = !prefersReducedMotion && currentTheme.text.length <= MAX_CHOREOGRAPHY_CHARS;

    if (prefersReducedMotion) {
      return withReadableBase(
        <span style={combinedStyle} className={typographyClasses} data-text={currentTheme.text}>
          {currentTheme.text}
        </span>
      );
    }

    if (currentTheme.renderMode === 'scramble') {
      return withReadableBase(
        <ScrambleText text={currentTheme.text} style={combinedStyle} className={typographyClasses} />
      );
    }

    if (currentTheme.renderMode === 'glitchDecode') {
      return withReadableBase(
        <GlitchDecodeText
          text={currentTheme.text}
          style={combinedStyle}
          className={cn(typographyClasses, styles.effectGlitchFlicker ?? '')}
          cycles={currentTheme.renderMeta?.decodeCycles ?? 4}
        />
      );
    }

    if (currentTheme.renderMode === 'typewriter' && canRunCharChoreo) {
      const stagger = currentTheme.renderMeta?.stagger ?? (segmentMode === 'word' ? 0.08 : 0.04);
      return withReadableBase(
        <motion.span
          style={{ ...combinedStyle, display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center' }}
          className={typographyClasses}
        >
          {motionUnits.map((unit, i) => (
            <motion.span
              key={`${unit}-${i}`}
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
              initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
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
        <motion.span style={{ ...combinedStyle, display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center' }} className={typographyClasses} initial={{ opacity: 0.9 }} animate={{ opacity: 1 }}>
          {motionUnits.map((unit, i) => (
            <motion.span
              key={`${unit}-${i}`}
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
              initial={{ opacity: 0, y: waveLift, rotateZ: i % 2 === 0 ? -6 : 6, filter: 'blur(3px)' }}
              animate={{ opacity: [0.3, 1, 1], y: [waveLift, -waveLift * 0.6, 0], rotateZ: [i % 2 === 0 ? -6 : 6, i % 2 === 0 ? 3 : -3, 0], filter: ['blur(3px)', 'blur(0.5px)', 'blur(0px)'] }}
              exit={{ opacity: 0, y: -waveLift * 0.8, rotateZ: i % 2 === 0 ? -8 : 8, filter: 'blur(4px)' }}
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
      const cascadeBlur = currentTheme.renderMeta?.cascadeBlur ?? (segmentMode === 'word' ? 4 : 3);
      return withReadableBase(
        <motion.span style={{ ...combinedStyle, display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center' }} className={typographyClasses}>
          {motionUnits.map((unit, i) => (
            <motion.span
              key={`${unit}-${i}`}
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
              initial={{ opacity: 0, y: -cascadeDistance, rotateX: 70, scale: 0.88, filter: `blur(${cascadeBlur}px)` }}
              animate={{ opacity: 1, y: [0, -2, 0], rotateX: [20, -6, 0], scale: [1.06, 0.98, 1], filter: [`blur(${cascadeBlur}px)`, 'blur(1px)', 'blur(0px)'] }}
              exit={{ opacity: 0, y: cascadeDistance * 0.55, rotateX: -55, scale: 0.9, filter: `blur(${cascadeBlur + 1}px)` }}
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
          style={{ ...combinedStyle, display: 'inline-block' }}
          className={typographyClasses}
          initial={{ clipPath: revealFromRight ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', opacity: 0.45, x: revealFromRight ? 20 : -20, skewX: revealSkew, filter: 'blur(3px)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1, x: 0, skewX: 0, filter: 'blur(0px)' }}
          exit={{ clipPath: revealFromRight ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', opacity: 0, x: revealFromRight ? -18 : 18, skewX: -revealSkew, filter: 'blur(4px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {currentTheme.text}
        </motion.span>
      );
    }

    if (currentTheme.renderMode === 'split') {
      const splitDistance = currentTheme.renderMeta?.splitDistance ?? 18;
      const segments = currentTheme.renderMeta?.splitDelimiter
        ? currentTheme.text.split(currentTheme.renderMeta.splitDelimiter)
        : currentTheme.text.split(' ');
      const left = segments.slice(0, Math.ceil(segments.length / 2)).join(' ');
      const right = segments.slice(Math.ceil(segments.length / 2)).join(' ');
      return withReadableBase(
        <span style={{ ...combinedStyle, perspective: '1000px', display: 'inline-flex', alignItems: 'center' }} className={typographyClasses}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ opacity: 0, x: -splitDistance, rotateY: 28, scale: 0.9, filter: 'blur(2px)' }}
            animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -splitDistance * 1.2, rotateY: 32, scale: 0.92, filter: 'blur(3px)' }}
            transition={{ duration: 0.46, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {left}
          </motion.span>
          {right ? (
            <motion.span
              style={{ display: 'inline-block', marginLeft: '0.35ch' }}
              initial={{ opacity: 0, x: splitDistance, rotateY: -28, scale: 0.9, filter: 'blur(2px)' }}
              animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: splitDistance * 1.2, rotateY: -32, scale: 0.92, filter: 'blur(3px)' }}
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
        <span style={combinedStyle} className={cn(typographyClasses, 'relative inline-grid')} data-text={currentTheme.text}>
          <motion.span
            key={`prev-${wordIndex}`}
            aria-hidden="true"
            className="absolute inset-0"
            initial={{ opacity: 0.55, filter: 'blur(0px)', y: 0, scale: 1, letterSpacing: typographyStyle.letterSpacing }}
            animate={{ opacity: 0, filter: 'blur(4px)', y: -8, scale: 1.02, letterSpacing: '0.08em' }}
            exit={{ opacity: 0, filter: 'blur(4px)', y: -8 }}
            transition={{ duration: 0.34, ease: 'easeOut' }}
          >
            {previousThemeText}
          </motion.span>
          <motion.span
            key={`next-${wordIndex}`}
            initial={{ opacity: 0, filter: 'blur(4px)', y: 8, scale: 0.99, letterSpacing: '0.08em' }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1, letterSpacing: typographyStyle.letterSpacing }}
            exit={{ opacity: 0, filter: 'blur(4px)', y: -6 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
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
  const accentOverlay = `radial-gradient(circle at ${accentX}% ${accentY}%, ${withAlpha(currentTheme.glow, isDark ? 0.18 : 0.11)}, transparent 58%)`;
  const subtitleThemeStyle = {
    border: currentTheme.containerBorder,
    boxShadow: currentTheme.containerShadow,
    borderRadius: currentTheme.containerRadius ?? `${12 + (textSeed % 6)}px`,
    background: currentTheme.containerBackground ? `${accentOverlay}, ${currentTheme.containerBackground}` : accentOverlay,
    '--subtitle-shell-edge': withAlpha(currentTheme.glow, isDark ? 0.24 : 0.14),
    '--subtitle-shell-glow-soft': withAlpha(currentTheme.glow, isDark ? 0.16 : 0.08),
    '--subtitle-shell-glow-strong': withAlpha(currentTheme.glow, isDark ? 0.34 : 0.17),
    '--subtitle-shell-ridge': isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.5)',
    '--subtitle-shell-shadow': isDark ? 'rgba(2, 6, 23, 0.52)' : 'rgba(15, 23, 42, 0.14)',
    '--subtitle-glow-soft': withAlpha(currentTheme.glow, isDark ? 0.18 : 0.12),
    '--subtitle-glow-strong': withAlpha(currentTheme.glow, isDark ? 0.34 : 0.2),
    '--subtitle-panel-edge': withAlpha(currentTheme.glow, isDark ? 0.28 : 0.18),
    '--subtitle-panel-bg': isDark ? 'rgba(10, 16, 34, 0.72)' : 'rgba(255, 255, 255, 0.76)',
    '--subtitle-panel-bg-2': isDark ? 'rgba(18, 26, 52, 0.6)' : 'rgba(248, 250, 252, 0.62)',
    '--subtitle-chip-bg': isDark ? 'rgba(8, 14, 32, 0.74)' : 'rgba(255, 255, 255, 0.72)',
    '--subtitle-chip-border': withAlpha(currentTheme.glow, isDark ? 0.2 : 0.16),
    '--subtitle-chip-text': isDark ? 'rgba(226, 232, 240, 0.74)' : 'rgba(15, 23, 42, 0.58)',
    '--subtitle-badge-bg': isDark ? 'rgba(10, 16, 34, 0.88)' : 'rgba(255, 255, 255, 0.9)',
    '--subtitle-badge-border': withAlpha(currentTheme.glow, isDark ? 0.26 : 0.18),
    transition: 'border 0.5s ease, box-shadow 0.5s ease, border-radius 0.5s ease',
  } as React.CSSProperties;

  const subtitleInner = (
    <>
      <span className={cn(styles.subtitleAmbient, currentTheme.ambientClass)} aria-hidden="true" />
      {currentTheme.eyebrow ? (
        <span className={cn(styles.subtitleEyebrow, currentTheme.eyebrowClass)} aria-hidden="true">
          {currentTheme.eyebrow}
        </span>
      ) : null}
      {currentTheme.detailLabel ? (
        <span className={cn(styles.subtitleDetail, currentTheme.detailClass)} aria-hidden="true">
          {currentTheme.detailLabel}
        </span>
      ) : null}
      {currentTheme.ornament ? (
        <span className={cn(styles.subtitleOrnament, currentTheme.ornamentClass)} aria-hidden="true">
          {currentTheme.ornament}
        </span>
      ) : null}
      <span className={cn('relative z-2 inline-flex items-center gap-2 sm:gap-3', styles.subtitleContent)}>
        {renderIcon('left')}
        {renderText()}
        {renderIcon('right')}
      </span>
    </>
  );

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale }}
      className={cn(
        "relative z-10",
        "py-1 sm:py-2 md:py-4 lg:py-6",
        "px-2 sm:px-4 md:px-6 lg:px-8",
        "flex flex-col items-center",
        "bg-linear-to-br",
        "from-background/50 via-background/30 to-background/20",
        "dark:from-background/30 dark:via-background/20 dark:to-background/10",
        "backdrop-blur-lg",
        "border-y border-primary/10",
        "dark:border-primary/20",
        "shadow-xl shadow-primary/5",
        "dark:shadow-primary/10",
        "transition-colors duration-300"
      )}
    >
      <h1
        className={cn(
          "relative font-extrabold tracking-tight leading-none select-none cursor-default text-center",
          "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
          "bg-clip-text text-transparent",
          "hover:scale-[1.02] transition-all duration-500",
          "drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]",
          "dark:drop-shadow-[0_0_15px_rgba(147,197,253,0.3)]",
          styles.enhancedTitleLanding
        )}
      >
        Wyatt Walsh
      </h1>

      {prefersReducedMotion ? (
        <div
          className={cn("subtitle-container relative isolate w-full max-w-[85vw] sm:max-w-2xl overflow-hidden px-3 sm:px-4 mt-1 sm:mt-2 h-14 sm:h-16 md:h-20 flex items-center justify-center", styles.subtitleShellFrame, currentTheme.containerClass, currentTheme.shellClass)}
          style={subtitleThemeStyle}
        >
          {subtitleInner}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            initial={currentTheme.initial}
            animate={currentTheme.animate}
            exit={currentTheme.exit}
            transition={currentTheme.transition}
            className={cn("subtitle-container relative isolate w-full max-w-[85vw] sm:max-w-2xl overflow-hidden px-3 sm:px-4 mt-1 sm:mt-2 h-14 sm:h-16 md:h-20 flex items-center justify-center", styles.subtitleShellFrame, currentTheme.containerClass, currentTheme.shellClass)}
            style={{ perspective: '1000px', transformStyle: 'preserve-3d', ...subtitleThemeStyle }}
            aria-live="off"
          >
            {subtitleInner}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
