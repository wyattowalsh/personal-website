'use client';

import {
  type LandingTitleRendererEntry,
  type SubtitleLane,
} from '@/components/landing-title/shared';
import type { SignalDeckMeta } from '@/lib/landing-title-sequence';
import {
  ARCANE_MAGE_RENDERERS,
  ARCANE_SORCERER_RENDERERS,
  ARCANE_VISIONARY_RENDERERS,
} from '@/components/landing-title/arcane';
import {
  CRAFTED_ALCHEMIST_RENDERERS,
  CRAFTED_ARTISAN_RENDERERS,
  CRAFTED_CRAFTER_RENDERERS,
  CRAFTED_SCULPTOR_RENDERERS,
} from '@/components/landing-title/crafted';
import { PERFORMANCE_SHOWCASE_RENDERERS } from '@/components/landing-title/performance';
import {
  SYSTEMS_ARCHITECT_THEMES as SYSTEMS_ARCHITECT_RENDERERS,
  SYSTEMS_DESIGNER_THEMES as SYSTEMS_DESIGNER_RENDERERS,
  SYSTEMS_NAVIGATION_THEMES as SYSTEMS_NAVIGATION_RENDERERS,
  SYSTEMS_ORCHESTRATOR_THEMES as SYSTEMS_ORCHESTRATOR_RENDERERS,
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

const subtitleRendererEntries: LandingTitleRendererEntry[] = [
  ...SYSTEMS_ARCHITECT_RENDERERS,
  ...ARCANE_SORCERER_RENDERERS,
  ...CRAFTED_ALCHEMIST_RENDERERS,
  ...SYSTEMS_DESIGNER_RENDERERS,
  ...CRAFTED_SCULPTOR_RENDERERS,
  ...CRAFTED_ARTISAN_RENDERERS,
  ...CRAFTED_CRAFTER_RENDERERS,
  ...PERFORMANCE_SHOWCASE_RENDERERS,
  ...ARCANE_MAGE_RENDERERS,
  ...ARCANE_VISIONARY_RENDERERS,
  ...SYSTEMS_NAVIGATION_RENDERERS,
  ...SYSTEMS_ORCHESTRATOR_RENDERERS,
];
const subtitleRendererEntriesById = subtitleRendererEntries.map((entry) => [entry.id, entry] as const);
const subtitleRendererEntriesByText = subtitleRendererEntries.map((entry) => [entry.text, entry] as const);

const subtitleOptions = subtitleRendererEntries.map(({ id, lane, signalDeck, text }) => ({
  id,
  lane,
  signalDeck,
  text,
})) as readonly LandingTitleSubtitleOption[];

export const SUBTITLE_RENDERER_REGISTRY = Object.freeze(
  Object.fromEntries(subtitleRendererEntriesById),
) as Readonly<Record<string, LandingTitleRendererEntry>>;

export const SUBTITLE_RENDERER_TEXT_REGISTRY = Object.freeze(
  Object.fromEntries(subtitleRendererEntriesByText),
) as Readonly<Record<string, LandingTitleRendererEntry>>;

export const LANDING_TITLE_RENDERERS = subtitleRendererEntries;
export const LANDING_TITLE_SUBTITLE_OPTIONS = subtitleOptions;
export const DEFAULT_LANDING_TITLE_SUBTITLE = LANDING_TITLE_SUBTITLE_OPTIONS[0] ?? null;
export const DEFAULT_LANDING_TITLE_SUBTITLE_ID = DEFAULT_LANDING_TITLE_SUBTITLE?.id ?? 'cybernetic-architect';
export const LANDING_TITLE_SUBTITLE_IDS = LANDING_TITLE_SUBTITLE_OPTIONS.map(({ id }) => id) as readonly string[];
export const LANDING_TITLE_THEME_TEXTS = LANDING_TITLE_RENDERERS.map(({ text }) => text) as readonly string[];

export function getSubtitleRendererById(id: string): LandingTitleRendererEntry | null {
  return SUBTITLE_RENDERER_REGISTRY[id] ?? null;
}

export function getSubtitleRendererByText(text: string): LandingTitleRendererEntry | null {
  return SUBTITLE_RENDERER_TEXT_REGISTRY[text] ?? null;
}

export function getSubtitleRenderer(selection: string): LandingTitleRendererEntry | null {
  return getSubtitleRendererById(selection) ?? getSubtitleRendererByText(selection);
}

export function getSubtitleOptionById(id: string): LandingTitleSubtitleOption | null {
  return LANDING_TITLE_SUBTITLE_OPTIONS.find((option) => option.id === id) ?? null;
}

export function getSubtitleOptionByText(text: string): LandingTitleSubtitleOption | null {
  return LANDING_TITLE_SUBTITLE_OPTIONS.find((option) => option.text === text) ?? null;
}

export function resolveSubtitleOption(selection: string | null | undefined): LandingTitleSubtitleOption {
  return getSubtitleOptionById(selection ?? '')
    ?? getSubtitleOptionByText(selection ?? '')
    ?? DEFAULT_LANDING_TITLE_SUBTITLE
    ?? {
      id: DEFAULT_LANDING_TITLE_SUBTITLE_ID,
      lane: 'systems',
      signalDeck: { family: 'Architect', descriptor: 'systems precision' },
      text: 'cybernetic architect',
    };
}
