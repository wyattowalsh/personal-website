'use client';

import {
  Atom,
  Brain,
  BrainCircuit,
  Braces,
  Cloud,
  Cpu,
  Fingerprint,
  GitMerge,
  Map as MapIcon,
  Music,
  Navigation,
  Radar,
  SlidersHorizontal,
  Sprout,
  type LucideIcon,
} from 'lucide-react';
import type { CSSProperties } from 'react';

import styles from '@/components/landing-title/systems.module.css';
import type {
  LandingTitleRendererEntry,
  LandingTitleRendererContext,
  SubtitleRendererShellProps,
} from '@/components/landing-title/shared';
import type { SignalDeckMeta } from '@/lib/landing-title-sequence';
import { cn } from '@/lib/utils';

type MetaPlacement = 'top' | 'side' | 'inline' | 'footer';
type IconSide = 'left' | 'right';

interface SystemsPalette {
  gradient: string;
  darkGradient: string;
  glow: string;
}

interface SystemsVariant {
  id: string;
  text: string;
  signalDeck: SignalDeckMeta;
  icon: LucideIcon;
  palette: SystemsPalette;
  eyebrow: string;
  titleLines: readonly string[];
  chips: readonly string[];
  footer: readonly string[];
  caption: string;
  shellClass: string;
  titleClass: string;
  deckClass: string;
  metaPlacement: MetaPlacement;
  iconSide: IconSide;
  layoutClass?: string;
  iconClass?: string;
}

const systemsSubtitle = (
  id: string,
  text: string,
  family: SignalDeckMeta['family'],
  descriptor: SignalDeckMeta['descriptor'],
) => ({
  id,
  lane: 'systems' as const,
  signalDeck: { family, descriptor },
  text,
});

function withAlpha(color: string, alpha: number): string {
  return color.replace(/rgba\(([^)]+),\s*[\d.]+\)/, 'rgba($1, ' + alpha + ')');
}

function createStyleVars(palette: SystemsPalette, isDark: boolean): CSSProperties {
  const activeGradient = isDark ? palette.darkGradient : palette.gradient;

  return {
    '--systems-gradient': activeGradient,
    '--systems-glow': palette.glow,
    '--systems-border': withAlpha(palette.glow, isDark ? 0.42 : 0.22),
    '--systems-shadow': withAlpha(palette.glow, isDark ? 0.34 : 0.16),
    '--systems-shadow-strong': withAlpha(palette.glow, isDark ? 0.52 : 0.24),
    '--systems-panel': isDark ? 'rgba(8, 14, 28, 0.86)' : 'rgba(255, 255, 255, 0.82)',
    '--systems-panel-strong': isDark ? 'rgba(14, 21, 40, 0.92)' : 'rgba(244, 247, 252, 0.96)',
    '--systems-muted': isDark ? 'rgba(148, 163, 184, 0.84)' : 'rgba(71, 85, 105, 0.82)',
    '--systems-text': isDark ? 'rgba(248, 250, 252, 0.98)' : 'rgba(15, 23, 42, 0.96)',
  } as CSSProperties;
}

function renderDeck(
  variant: SystemsVariant,
  positionLabel: string,
  totalLabel: string,
  compact: boolean,
) {
  return (
    <div className={cn(styles.deck, variant.deckClass, compact && styles.deckCompact)} aria-hidden="true">
      <span className={styles.deckBadge}>
        <span className={styles.deckSwatch} />
        {variant.signalDeck.family}
      </span>
      <span className={styles.deckDescriptor}>{variant.signalDeck.descriptor}</span>
      <span className={styles.deckCounter}>
        {positionLabel}
        <span className={styles.deckCounterTotal}>/ {totalLabel}</span>
      </span>
    </div>
  );
}

function renderTitle(variant: SystemsVariant, context: LandingTitleRendererContext) {
  return (
    <div className={styles.lockup}>
      <div className={styles.eyebrowRow}>
        <span className={styles.eyebrow}>{variant.eyebrow}</span>
      </div>
      <div className={cn(styles.title, variant.titleClass)} data-motion={context.shouldAnimateTagline ? 'animated' : 'reduced'}>
        {variant.titleLines.map((line, lineIndex) => (
          <span key={`${variant.id}-${line}`} className={cn(styles.line, lineIndex === 0 ? styles.lineLead : styles.lineSupport)}>
            {line.split(' ').map((word) => (
              <span key={`${line}-${word}`} className={styles.word}>
                {word}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

function SystemsSubtitleRenderer({
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
}: SubtitleRendererShellProps & { config: SystemsVariant }) {
  const styleVars = createStyleVars(config.palette, context.isDark);
  const deck = renderDeck(config, positionLabel, totalLabel, context.compact);
  const Icon = config.icon;
  const iconNode = (
    <span
      className={cn(
        styles.iconWrap,
        config.iconSide === 'right' ? 'justify-self-end' : 'justify-self-start',
      )}
      aria-hidden="true"
    >
      <Icon className={cn(styles.icon, config.iconClass)} />
    </span>
  );

  return (
    <div
      className={cn(
        styles.cluster,
        context.showName ? styles.clusterWithName : styles.clusterStandalone,
        context.compact && styles.clusterCompact,
      )}
      style={styleVars}
      data-motion={context.shouldAnimateTagline ? 'animated' : 'reduced'}
      onMouseEnter={!context.prefersReducedMotion ? onMouseEnter : undefined}
      onMouseLeave={!context.prefersReducedMotion ? onMouseLeave : undefined}
    >
      {!hideSignalDeck && config.metaPlacement === 'top' ? deck : null}

      <div
        tabIndex={0}
        role="group"
        aria-label={`${config.text}. ${config.signalDeck.family} family, ${config.signalDeck.descriptor}. ${rotationStatusLabel}`}
        className={styles.control}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <div
          className={cn(styles.panel, config.shellClass, config.layoutClass)}
          data-motion={context.shouldAnimateTagline ? 'animated' : 'reduced'}
        >
          <span className={styles.aura} aria-hidden="true" />
          <span className={styles.trace} aria-hidden="true" />
          <span className={styles.nodes} aria-hidden="true" />

          <div className={styles.canvas}>
            {!hideSignalDeck && config.metaPlacement === 'side' ? deck : null}

            <div className={styles.body}>
              <div className={styles.titleRow}>
                {config.iconSide === 'left' ? iconNode : null}
                {renderTitle(config, context)}
                {config.iconSide === 'right' ? iconNode : null}
              </div>

              <div className={styles.chips} aria-hidden="true">
                {config.chips.map((chip) => (
                  <span key={`${config.id}-${chip}`} className={styles.chip}>
                    {chip}
                  </span>
                ))}
              </div>

              <p className={styles.caption}>{config.caption}</p>

              {!hideSignalDeck && config.metaPlacement === 'inline' ? deck : null}

              <div className={styles.footerRail} aria-hidden="true">
                {config.footer.map((item) => (
                  <span key={`${config.id}-${item}`} className={styles.footerItem}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {!hideSignalDeck && config.metaPlacement === 'footer' ? deck : null}
        </div>
      </div>
    </div>
  );
}

function createSystemsRenderer(config: SystemsVariant): LandingTitleRendererEntry {
  return {
    id: config.id,
    lane: 'systems',
    render: (props) => <SystemsSubtitleRenderer {...props} config={config} />,
    signalDeck: config.signalDeck,
    text: config.text,
    theme: {
      id: config.id,
      lane: 'systems',
      text: config.text,
      signalDeck: config.signalDeck,
      gradient: config.palette.gradient,
      darkGradient: config.palette.darkGradient,
      glow: config.palette.glow,
      fontFamily: 'mono',
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'none',
      fontStyle: 'normal',
      icon: config.icon,
      iconPosition: config.iconSide,
      iconClass: config.iconClass ?? '',
      initial: { opacity: 0, y: 18, scale: 0.96 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -18, scale: 0.98 },
      transition: { duration: 0.46, ease: [0.22, 1, 0.36, 1] },
      effectClass: '',
      renderMode: 'standard',
      containerBorder: `1px solid ${withAlpha(config.palette.glow, 0.28)}`,
      containerShadow: `0 0 18px ${withAlpha(config.palette.glow, 0.18)}`,
    },
  };
}

const SYSTEMS_VARIANTS: readonly SystemsVariant[] = [
  {
    ...systemsSubtitle('cybernetic-architect', 'cybernetic architect', 'Architect', 'systems precision'),
    icon: Cpu,
    palette: {
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 55%, #22d3ee 100%)',
      darkGradient: 'linear-gradient(135deg, #bfdbfe 0%, #c4b5fd 55%, #a5f3fc 100%)',
      glow: 'rgba(99, 102, 241, 0.78)',
    },
    eyebrow: 'CORE BUS',
    titleLines: ['CYBERNETIC', 'ARCHITECT'],
    chips: ['feedback', 'actuators', 'signal core'],
    footer: ['segmented chassis', 'neural relay'],
    caption: 'A hardened neural chassis with a visible signal spine instead of generic glitch haze.',
    shellClass: styles.shellChassis,
    titleClass: styles.titleCybernetic,
    deckClass: styles.deckSide,
    metaPlacement: 'side',
    iconSide: 'left',
    layoutClass: styles.layoutSide,
  },
  {
    ...systemsSubtitle('code-architect', 'code architect', 'Architect', 'systems precision'),
    icon: Braces,
    palette: {
      gradient: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 48%, #818cf8 100%)',
      darkGradient: 'linear-gradient(135deg, #dbeafe 0%, #bae6fd 48%, #c7d2fe 100%)',
      glow: 'rgba(59, 130, 246, 0.72)',
    },
    eyebrow: 'SPEC SHEET',
    titleLines: ['code', 'architect'],
    chips: ['modules', 'interfaces', 'contracts'],
    footer: ['margin notes', 'folded blueprint'],
    caption: 'A plan-sheet composition with measured margins, footer legend, and drafting discipline.',
    shellClass: styles.shellBlueprint,
    titleClass: styles.titleCode,
    deckClass: styles.deckTop,
    metaPlacement: 'top',
    iconSide: 'right',
  },
  {
    ...systemsSubtitle('zero-trust-architect', 'zero trust architect', 'Architect', 'systems precision'),
    icon: Fingerprint,
    palette: {
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 42%, #f97316 100%)',
      darkGradient: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 42%, #fdba74 100%)',
      glow: 'rgba(239, 68, 68, 0.76)',
    },
    eyebrow: 'VERIFY BEFORE ENTRY',
    titleLines: ['ZERO TRUST', 'ARCHITECT'],
    chips: ['identity', 'policy', 'containment'],
    footer: ['clearance locked', 'every request challenged'],
    caption: 'A layered access gate with explicit verification rails and no decorative excess.',
    shellClass: styles.shellVault,
    titleClass: styles.titleTrust,
    deckClass: styles.deckTop,
    metaPlacement: 'top',
    iconSide: 'left',
  },
  {
    ...systemsSubtitle('synthetic-intelligence-architect', 'synthetic intelligence architect', 'Architect', 'systems precision'),
    icon: BrainCircuit,
    palette: {
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 52%, #38bdf8 100%)',
      darkGradient: 'linear-gradient(135deg, #c7d2fe 0%, #93c5fd 52%, #bae6fd 100%)',
      glow: 'rgba(79, 70, 229, 0.82)',
    },
    eyebrow: 'MODEL STACK',
    titleLines: ['synthetic intelligence', 'architect'],
    chips: ['inference lanes', 'memory seams', 'supervision'],
    footer: ['tiered cognition schematic', 'mobile-safe hierarchy'],
    caption: 'A vertically tiered cognition schematic built to keep the long phrase authoritative on small screens.',
    shellClass: styles.shellCognition,
    titleClass: styles.titleSynthetic,
    deckClass: styles.deckInline,
    metaPlacement: 'inline',
    iconSide: 'left',
    layoutClass: styles.layoutStack,
  },
  {
    ...systemsSubtitle('quantum-designer', 'quantum designer', 'Designer', 'semantic motion'),
    icon: Atom,
    palette: {
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 56%, #8b5cf6 100%)',
      darkGradient: 'linear-gradient(135deg, #99f6e4 0%, #7dd3fc 56%, #c4b5fd 100%)',
      glow: 'rgba(20, 184, 166, 0.74)',
    },
    eyebrow: 'STATE FIELD',
    titleLines: ['QUANTUM', 'DESIGNER'],
    chips: ['phase', 'orbit', 'collapse'],
    footer: ['probability bands', 'offset wells'],
    caption: 'A field instrument with orbital state markers instead of another drafted document shell.',
    shellClass: styles.shellQuantum,
    titleClass: styles.titleQuantum,
    deckClass: styles.deckInline,
    metaPlacement: 'inline',
    iconSide: 'right',
  },
  {
    ...systemsSubtitle('ecosystem-designer', 'ecosystem designer', 'Designer', 'semantic motion'),
    icon: Sprout,
    palette: {
      gradient: 'linear-gradient(135deg, #16a34a 0%, #14b8a6 54%, #84cc16 100%)',
      darkGradient: 'linear-gradient(135deg, #bbf7d0 0%, #99f6e4 54%, #d9f99d 100%)',
      glow: 'rgba(34, 197, 94, 0.72)',
    },
    eyebrow: 'DEPENDENCY ECOLOGY',
    titleLines: ['ecosystem', 'designer'],
    chips: ['pods', 'flows', 'mutuals'],
    footer: ['habitat diagram', 'linked corridors'],
    caption: 'An interdependent habitat map that reads as systems ecology instead of a softened generic pill.',
    shellClass: styles.shellHabitat,
    titleClass: styles.titleEcosystem,
    deckClass: styles.deckFooter,
    metaPlacement: 'footer',
    iconSide: 'left',
  },
  {
    ...systemsSubtitle('behavioral-designer', 'behavioral designer', 'Designer', 'semantic motion'),
    icon: Brain,
    palette: {
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 55%, #8b5cf6 100%)',
      darkGradient: 'linear-gradient(135deg, #a5f3fc 0%, #bfdbfe 55%, #ddd6fe 100%)',
      glow: 'rgba(14, 165, 233, 0.76)',
    },
    eyebrow: 'FEEDBACK LOOP',
    titleLines: ['behavioral', 'designer'],
    chips: ['cue', 'response', 'reward'],
    footer: ['iterative loop rail', 'sampled triggers'],
    caption: 'A loop diagram shell with visible behavior phases rather than a flat analysis card.',
    shellClass: styles.shellBehavior,
    titleClass: styles.titleBehavior,
    deckClass: styles.deckSide,
    metaPlacement: 'side',
    iconSide: 'right',
    layoutClass: styles.layoutSide,
  },
  {
    ...systemsSubtitle('adaptive-systems-designer', 'adaptive systems designer', 'Designer', 'semantic motion'),
    icon: SlidersHorizontal,
    palette: {
      gradient: 'linear-gradient(135deg, #10b981 0%, #22c55e 42%, #38bdf8 100%)',
      darkGradient: 'linear-gradient(135deg, #a7f3d0 0%, #bbf7d0 42%, #bae6fd 100%)',
      glow: 'rgba(16, 185, 129, 0.8)',
    },
    eyebrow: 'PARAMETER STATES',
    titleLines: ['adaptive systems', 'designer'],
    chips: ['observe', 'shift', 'stabilize'],
    footer: ['reflowing shell', 'hinged modules'],
    caption: 'A modular frame that visibly adapts between wide and narrow layouts instead of simply wrapping.',
    shellClass: styles.shellAdaptive,
    titleClass: styles.titleAdaptive,
    deckClass: styles.deckInline,
    metaPlacement: 'inline',
    iconSide: 'left',
    layoutClass: styles.layoutStack,
  },
  {
    ...systemsSubtitle('process-designer', 'process designer', 'Designer', 'semantic motion'),
    icon: GitMerge,
    palette: {
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 54%, #22c55e 100%)',
      darkGradient: 'linear-gradient(135deg, #bae6fd 0%, #99f6e4 54%, #bbf7d0 100%)',
      glow: 'rgba(20, 184, 166, 0.74)',
    },
    eyebrow: 'ROUTE LOGIC',
    titleLines: ['process', 'designer'],
    chips: ['entry', 'merge', 'handoff'],
    footer: ['pipeline board', 'directed lanes'],
    caption: 'A routed pipeline board that keeps process designer as the flow benchmark for the lane.',
    shellClass: styles.shellPipeline,
    titleClass: styles.titleProcess,
    deckClass: styles.deckTop,
    metaPlacement: 'top',
    iconSide: 'left',
  },
  {
    ...systemsSubtitle('quantum-systems-designer', 'quantum systems designer', 'Designer', 'semantic motion'),
    icon: Radar,
    palette: {
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 45%, #ec4899 100%)',
      darkGradient: 'linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 45%, #fbcfe8 100%)',
      glow: 'rgba(139, 92, 246, 0.82)',
    },
    eyebrow: 'PHASE CHANNELS',
    titleLines: ['quantum systems', 'designer'],
    chips: ['synchronized', 'bridged', 'stateful'],
    footer: ['multi-band coordination', 'phase bridges'],
    caption: 'A phase-band instrument focused on orchestrating states, not just showing a quantum symbol.',
    shellClass: styles.shellPhase,
    titleClass: styles.titlePhase,
    deckClass: styles.deckFooter,
    metaPlacement: 'footer',
    iconSide: 'right',
    layoutClass: styles.layoutStack,
  },
  {
    ...systemsSubtitle('machine-learning-designer', 'machine learning designer', 'Designer', 'semantic motion'),
    icon: Cpu,
    palette: {
      gradient: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 48%, #22d3ee 100%)',
      darkGradient: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 48%, #a5f3fc 100%)',
      glow: 'rgba(14, 165, 233, 0.8)',
    },
    eyebrow: 'TRAINING BOARD',
    titleLines: ['machine learning', 'designer'],
    chips: ['epoch', 'gradient', 'loss'],
    footer: ['error correction marks', 'tuning handles'],
    caption: 'A training-board identity that separates machine learning from the architect neural treatments.',
    shellClass: styles.shellTraining,
    titleClass: styles.titleTraining,
    deckClass: styles.deckTop,
    metaPlacement: 'top',
    iconSide: 'left',
    layoutClass: styles.layoutStack,
  },
  {
    ...systemsSubtitle('cloud-shaper', 'cloud shaper', 'Cartographer', 'route synthesis'),
    icon: Cloud,
    palette: {
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #67e8f9 46%, #c084fc 100%)',
      darkGradient: 'linear-gradient(135deg, #bae6fd 0%, #cffafe 46%, #ddd6fe 100%)',
      glow: 'rgba(56, 189, 248, 0.74)',
    },
    eyebrow: 'ELEVATION CURVES',
    titleLines: ['cloud', 'shaper'],
    chips: ['contours', 'density', 'altitude'],
    footer: ['tiered weather layers', 'volumetric edge'],
    caption: 'A contour-based cloud object that gives shaping real volume instead of a polite flat panel.',
    shellClass: styles.shellCloud,
    titleClass: styles.titleCloud,
    deckClass: styles.deckSide,
    metaPlacement: 'side',
    iconSide: 'right',
    layoutClass: styles.layoutSide,
  },
  {
    ...systemsSubtitle('ai-cartographer', 'AI cartographer', 'Cartographer', 'route synthesis'),
    icon: MapIcon,
    palette: {
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 46%, #3b82f6 100%)',
      darkGradient: 'linear-gradient(135deg, #99f6e4 0%, #a5f3fc 46%, #bfdbfe 100%)',
      glow: 'rgba(20, 184, 166, 0.8)',
    },
    eyebrow: 'ATLAS LEGEND',
    titleLines: ['AI', 'cartographer'],
    chips: ['survey', 'routes', 'waypoints'],
    footer: ['legend plate', 'plotted route'],
    caption: 'A proper navigational plate with legend logic, plotted points, and AI route markings.',
    shellClass: styles.shellAtlas,
    titleClass: styles.titleAtlas,
    deckClass: styles.deckTop,
    metaPlacement: 'top',
    iconSide: 'left',
  },
  {
    ...systemsSubtitle('technological-mapper', 'technological mapper', 'Cartographer', 'route synthesis'),
    icon: Navigation,
    palette: {
      gradient: 'linear-gradient(135deg, #0891b2 0%, #0ea5e9 44%, #22d3ee 100%)',
      darkGradient: 'linear-gradient(135deg, #a5f3fc 0%, #bae6fd 44%, #cffafe 100%)',
      glow: 'rgba(8, 145, 178, 0.78)',
    },
    eyebrow: 'TOPOLOGY BOUNDS',
    titleLines: ['technological', 'mapper'],
    chips: ['nodes', 'edges', 'surface'],
    footer: ['locked extents', 'infrastructure overlay'],
    caption: 'An infrastructural topology map that separates technological mapper from the atlas-style cartographer.',
    shellClass: styles.shellTopology,
    titleClass: styles.titleTopology,
    deckClass: styles.deckSide,
    metaPlacement: 'side',
    iconSide: 'right',
    layoutClass: styles.layoutSide,
  },
  {
    ...systemsSubtitle('data-orchestrator', 'data orchestrator', 'Orchestrator', 'coordinated crescendo'),
    icon: Music,
    palette: {
      gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 45%, #f97316 100%)',
      darkGradient: 'linear-gradient(135deg, #e9d5ff 0%, #fbcfe8 45%, #fdba74 100%)',
      glow: 'rgba(168, 85, 247, 0.84)',
    },
    eyebrow: 'CHANNEL TIMELINE',
    titleLines: ['DATA', 'ORCHESTRATOR'],
    chips: ['queue', 'sync', 'tempo'],
    footer: ['channel rack', 'coordinated pulses'],
    caption: 'A compact console with multichannel timing cues instead of another centered hero pill.',
    shellClass: styles.shellRack,
    titleClass: styles.titleOrchestrator,
    deckClass: styles.deckFooter,
    metaPlacement: 'footer',
    iconSide: 'left',
  },
] as const;

export const SYSTEMS_ARCHITECT_THEMES: LandingTitleRendererEntry[] = SYSTEMS_VARIANTS
  .filter((variant) => variant.signalDeck.family === 'Architect')
  .map(createSystemsRenderer);

export const SYSTEMS_DESIGNER_THEMES: LandingTitleRendererEntry[] = SYSTEMS_VARIANTS
  .filter((variant) => variant.signalDeck.family === 'Designer')
  .map(createSystemsRenderer);

export const SYSTEMS_NAVIGATION_THEMES: LandingTitleRendererEntry[] = SYSTEMS_VARIANTS
  .filter((variant) => variant.signalDeck.family === 'Cartographer')
  .map(createSystemsRenderer);

export const SYSTEMS_ORCHESTRATOR_THEMES: LandingTitleRendererEntry[] = SYSTEMS_VARIANTS
  .filter((variant) => variant.signalDeck.family === 'Orchestrator')
  .map(createSystemsRenderer);

export const SYSTEMS_SUBTITLE_THEMES: LandingTitleRendererEntry[] = SYSTEMS_VARIANTS.map(createSystemsRenderer);
