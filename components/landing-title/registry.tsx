'use client';

import {
  type LandingTitleRendererEntry,
  type SubtitleLane,
} from '@/components/landing-title/shared';
import type { SignalDeckMeta } from '@/lib/landing-title-sequence';
import {
  ARCANE_SHOWCASE_RENDERERS,
} from '@/components/landing-title/arcane';
import {
  CRAFTED_SHOWCASE_RENDERERS,
} from '@/components/landing-title/crafted';
import { PERFORMANCE_SHOWCASE_RENDERERS } from '@/components/landing-title/performance';
import {
  SYSTEMS_SHOWCASE_RENDERERS,
} from '@/components/landing-title/systems';

export type {
  LandingTitleRendererContext,
  LandingTitleRendererEntry,
  SubtitleRenderMode,
  SubtitleRendererShellProps,
  SubtitleLane,
  SubtitleTheme,
} from '@/components/landing-title/shared';

export interface LandingTitleSubtitleOption {
  readonly id: string;
  readonly lane: SubtitleLane;
  readonly text: string;
  readonly signalDeck: SignalDeckMeta;
}

export const LANDING_TITLE_RENDERERS: LandingTitleRendererEntry[] = [
  ...SYSTEMS_SHOWCASE_RENDERERS,
  ...ARCANE_SHOWCASE_RENDERERS,
  ...CRAFTED_SHOWCASE_RENDERERS,
  ...PERFORMANCE_SHOWCASE_RENDERERS,
];

export const SUBTITLE_RENDERER_REGISTRY = Object.freeze(
  Object.fromEntries(LANDING_TITLE_RENDERERS.map((e) => [e.id, e])),
) as Readonly<Record<string, LandingTitleRendererEntry>>;

export const SUBTITLE_RENDERER_TEXT_REGISTRY = Object.freeze(
  Object.fromEntries(LANDING_TITLE_RENDERERS.map((e) => [e.text, e])),
) as Readonly<Record<string, LandingTitleRendererEntry>>;

const NORMALIZED_SUBTITLE_RENDERER_TEXT_REGISTRY = Object.freeze(
  Object.fromEntries(LANDING_TITLE_RENDERERS.map((e) => [normalizeSubtitleSelection(e.text), e])),
) as Readonly<Record<string, LandingTitleRendererEntry>>;

export const LANDING_TITLE_SUBTITLE_OPTIONS: readonly LandingTitleSubtitleOption[] =
  LANDING_TITLE_RENDERERS.map(({ id, lane, signalDeck, text }) => ({ id, lane, signalDeck, text }));
export const DEFAULT_LANDING_TITLE_SUBTITLE = LANDING_TITLE_SUBTITLE_OPTIONS[0] ?? null;
export const DEFAULT_LANDING_TITLE_SUBTITLE_ID = DEFAULT_LANDING_TITLE_SUBTITLE?.id ?? 'cybernetic-architect';
export const LANDING_TITLE_SUBTITLE_IDS = LANDING_TITLE_SUBTITLE_OPTIONS.map(({ id }) => id) as readonly string[];
export const LANDING_TITLE_THEME_TEXTS = LANDING_TITLE_RENDERERS.map(({ text }) => text) as readonly string[];

const SUBTITLE_OPTION_ID_REGISTRY = Object.freeze(
  Object.fromEntries(LANDING_TITLE_SUBTITLE_OPTIONS.map((option) => [option.id, option])),
) as Readonly<Record<string, LandingTitleSubtitleOption>>;

const NORMALIZED_SUBTITLE_OPTION_ID_REGISTRY = Object.freeze(
  Object.fromEntries(LANDING_TITLE_SUBTITLE_OPTIONS.map((option) => [normalizeSubtitleSelection(option.id), option])),
) as Readonly<Record<string, LandingTitleSubtitleOption>>;

const SUBTITLE_OPTION_TEXT_REGISTRY = Object.freeze(
  Object.fromEntries(LANDING_TITLE_SUBTITLE_OPTIONS.map((option) => [option.text, option])),
) as Readonly<Record<string, LandingTitleSubtitleOption>>;

const NORMALIZED_SUBTITLE_OPTION_TEXT_REGISTRY = Object.freeze(
  Object.fromEntries(LANDING_TITLE_SUBTITLE_OPTIONS.map((option) => [normalizeSubtitleSelection(option.text), option])),
) as Readonly<Record<string, LandingTitleSubtitleOption>>;

function normalizeSubtitleSelection(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * @deprecated Alias map from old subtitle ids/texts (pre-redesign 44-entry
 * inventory) to current 22-entry ids. Prevents silent fallback to default
 * when callers use historical values that were renamed or consolidated.
 *
 * Keys are either old display texts (space-separated) or old slugified
 * pseudo-ids (kebab-case). Values are always a current canonical id.
 */
export const DEPRECATED_SUBTITLE_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  // ── Old display texts that no longer match any current text ──────────

  // Current normalization pass (visible text changed, ids retained)
  'cybernetic architect'            : 'cybernetic-architect',
  'synthetic intelligence architect': 'synthetic-intelligence-architect',
  'ai cartographer'                 : 'ai-cartographer',
  'data orchestrator'               : 'data-orchestrator',
  'signal orchestrator'             : 'data-orchestrator',
  'archive sorcerer'                : 'data-sorcerer',
  'sigil mage'                      : 'workflow-mage',
  'algorithm weaver'                : 'algorithm-weaver',
  'systems seer'                    : 'systems-seer',
  'holographic sculptor'            : 'holographic-sculptor',
  'bastion artisan'                 : 'cyber-defense-artisan',
  'lattice artisan'                 : 'blockchain-artisan',

  // Architects (dropped)
  'code architect': 'cybernetic-architect',

  // Arcane (text changed or consolidated)
  'technological conjurer': 'silicon-conjurer',
  'innovation mystic': 'systems-seer',
  'emergence mystic': 'systems-seer',

  // Alchemists (consolidated → code-alchemist)
  'systems alchemist': 'code-alchemist',
  'distributed systems alchemist': 'code-alchemist',

  // Designers (consolidated → quantum-designer)
  'ecosystem designer': 'quantum-designer',
  'behavioral designer': 'quantum-designer',
  'adaptive systems designer': 'quantum-designer',
  'process designer': 'quantum-designer',
  'quantum systems designer': 'quantum-designer',
  'machine learning designer': 'quantum-designer',

  // Sculptors (consolidated)
  'augmented reality sculptor': 'holographic-sculptor',
  'resilience sculptor': 'digital-sculptor',
  'information sculptor': 'digital-sculptor',
  'experience sculptor': 'digital-sculptor',

  // Artisans (text changed or consolidated)
  'intelligence artisan': 'blockchain-artisan',
  'cybersecurity artisan': 'cyber-defense-artisan',

  // Crafters (consolidated → frontier-forger)
  'knowledge craftsman': 'frontier-forger',
  'experience crafter': 'frontier-forger',
  'edge systems crafter': 'frontier-forger',
  'future systems crafter': 'frontier-forger',
  'frontier crafter': 'frontier-forger',

  // Artists (consolidated → cortex-diviner)
  'intelligent systems artist': 'cortex-diviner',
  'scalability artist': 'cortex-diviner',
  'robotics artist': 'kinetic-machinist',
  'neural artist': 'cortex-diviner',

  // Visionaries / Dreamers (consolidated → navigation entries)
  'platform visionary': 'cloud-shaper',
  'systems dreamer': 'cloud-shaper',
  'digital futurist': 'ai-cartographer',
  'enterprise dreamer': 'cloud-shaper',

  // Navigation (consolidated)
  'technological mapper': 'ai-cartographer',

  // ── Old slugified pseudo-ids that don't match any current id ─────────

  'code-architect': 'cybernetic-architect',
  'technological-conjurer': 'silicon-conjurer',
  'innovation-mystic': 'systems-seer',
  'emergence-mystic': 'systems-seer',
  'systems-alchemist': 'code-alchemist',
  'distributed-systems-alchemist': 'code-alchemist',
  'ecosystem-designer': 'quantum-designer',
  'behavioral-designer': 'quantum-designer',
  'adaptive-systems-designer': 'quantum-designer',
  'process-designer': 'quantum-designer',
  'quantum-systems-designer': 'quantum-designer',
  'machine-learning-designer': 'quantum-designer',
  'augmented-reality-sculptor': 'holographic-sculptor',
  'resilience-sculptor': 'digital-sculptor',
  'information-sculptor': 'digital-sculptor',
  'experience-sculptor': 'digital-sculptor',
  'intelligence-artisan': 'blockchain-artisan',
  'cybersecurity-artisan': 'cyber-defense-artisan',
  'knowledge-craftsman': 'frontier-forger',
  'experience-crafter': 'frontier-forger',
  'edge-systems-crafter': 'frontier-forger',
  'future-systems-crafter': 'frontier-forger',
  'frontier-crafter': 'frontier-forger',
  'intelligent-systems-artist': 'cortex-diviner',
  'scalability-artist': 'cortex-diviner',
  'robotics-artist': 'kinetic-machinist',
  'neural-artist': 'cortex-diviner',
  'platform-visionary': 'cloud-shaper',
  'systems-dreamer': 'cloud-shaper',
  'digital-futurist': 'ai-cartographer',
  'enterprise-dreamer': 'cloud-shaper',
  'technological-mapper': 'ai-cartographer',
  'signal-orchestrator': 'data-orchestrator',
});

function resolveAlias(key: string): string | undefined {
  return DEPRECATED_SUBTITLE_ALIASES[normalizeSubtitleSelection(key)]
    ?? DEPRECATED_SUBTITLE_ALIASES[key];
}

export function getSubtitleRendererById(id: string): LandingTitleRendererEntry | null {
  const normalizedId = normalizeSubtitleSelection(id);

  return SUBTITLE_RENDERER_REGISTRY[id]
    ?? SUBTITLE_RENDERER_REGISTRY[normalizedId]
    ?? SUBTITLE_RENDERER_REGISTRY[resolveAlias(normalizedId) ?? '']
    ?? null;
}

export function getSubtitleRendererByText(text: string): LandingTitleRendererEntry | null {
  const normalizedText = normalizeSubtitleSelection(text);

  return SUBTITLE_RENDERER_TEXT_REGISTRY[text]
    ?? NORMALIZED_SUBTITLE_RENDERER_TEXT_REGISTRY[normalizedText]
    ?? SUBTITLE_RENDERER_REGISTRY[resolveAlias(normalizedText) ?? '']
    ?? null;
}

export function getSubtitleRenderer(selection: string): LandingTitleRendererEntry | null {
  return getSubtitleRendererById(selection) ?? getSubtitleRendererByText(selection);
}

export function getSubtitleOptionById(id: string): LandingTitleSubtitleOption | null {
  const normalizedId = normalizeSubtitleSelection(id);

  return SUBTITLE_OPTION_ID_REGISTRY[id]
    ?? NORMALIZED_SUBTITLE_OPTION_ID_REGISTRY[normalizedId]
    ?? SUBTITLE_OPTION_ID_REGISTRY[resolveAlias(normalizedId) ?? '']
    ?? null;
}

export function getSubtitleOptionByText(text: string): LandingTitleSubtitleOption | null {
  const normalizedText = normalizeSubtitleSelection(text);

  return SUBTITLE_OPTION_TEXT_REGISTRY[text]
    ?? NORMALIZED_SUBTITLE_OPTION_TEXT_REGISTRY[normalizedText]
    ?? SUBTITLE_OPTION_ID_REGISTRY[resolveAlias(normalizedText) ?? '']
    ?? null;
}

export function resolveSubtitleOption(selection: string | null | undefined): LandingTitleSubtitleOption {
  return getSubtitleOptionById(selection ?? '')
    ?? getSubtitleOptionByText(selection ?? '')
    ?? DEFAULT_LANDING_TITLE_SUBTITLE
    ?? {
      id: DEFAULT_LANDING_TITLE_SUBTITLE_ID,
      lane: 'systems',
      signalDeck: { family: 'Architect', descriptor: 'systems precision' },
      text: 'cyber architect',
    };
}
