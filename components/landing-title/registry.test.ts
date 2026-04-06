import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LANDING_TITLE_SUBTITLE_ID,
  LANDING_TITLE_RENDERERS,
  LANDING_TITLE_SUBTITLE_OPTIONS,
  getSubtitleRenderer,
  getSubtitleRendererById,
  resolveSubtitleOption,
} from '@/components/landing-title/registry';

const EXPECTED_SUBTITLE_ORDER = [
  'cybernetic-architect',
  'code-architect',
  'zero-trust-architect',
  'synthetic-intelligence-architect',
  'data-sorcerer',
  'technological-conjurer',
  'innovation-mystic',
  'systems-alchemist',
  'distributed-systems-alchemist',
  'code-alchemist',
  'quantum-designer',
  'ecosystem-designer',
  'behavioral-designer',
  'adaptive-systems-designer',
  'process-designer',
  'quantum-systems-designer',
  'machine-learning-designer',
  'digital-sculptor',
  'augmented-reality-sculptor',
  'resilience-sculptor',
  'information-sculptor',
  'experience-sculptor',
  'intelligence-artisan',
  'cyber-defense-artisan',
  'blockchain-artisan',
  'cybersecurity-artisan',
  'knowledge-craftsman',
  'experience-crafter',
  'edge-systems-crafter',
  'future-systems-crafter',
  'automation-virtuoso',
  'robotics-artist',
  'intelligent-systems-artist',
  'scalability-artist',
  'workflow-mage',
  'algorithm-weaver',
  'platform-visionary',
  'systems-dreamer',
  'digital-futurist',
  'enterprise-dreamer',
  'cloud-shaper',
  'ai-cartographer',
  'technological-mapper',
  'data-orchestrator',
] as const;

describe('landing title registry contract', () => {
  it('keeps subtitle ids unique and aligned with registry entries', () => {
    const ids = LANDING_TITLE_SUBTITLE_OPTIONS.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const option of LANDING_TITLE_SUBTITLE_OPTIONS) {
      const renderer = getSubtitleRendererById(option.id);

      expect(renderer).not.toBeNull();
      expect(renderer?.id).toBe(option.id);
      expect(renderer?.lane).toBe(option.lane);
      expect(renderer?.text).toBe(option.text);
      expect(renderer?.signalDeck).toEqual(option.signalDeck);
    }
  });

  it('preserves the exact 44-item subtitle order with unique display text', () => {
    const ids = LANDING_TITLE_SUBTITLE_OPTIONS.map(({ id }) => id);
    const texts = LANDING_TITLE_SUBTITLE_OPTIONS.map(({ text }) => text);

    expect(ids).toHaveLength(44);
    expect(ids).toEqual(EXPECTED_SUBTITLE_ORDER);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('resolves lab selections from stable ids and legacy display text', () => {
    const selected = LANDING_TITLE_SUBTITLE_OPTIONS.find(({ id }) => id === DEFAULT_LANDING_TITLE_SUBTITLE_ID);
    expect(selected).toBeDefined();

    expect(resolveSubtitleOption(selected?.id ?? null)).toEqual(selected);
    expect(resolveSubtitleOption(selected?.text ?? null)).toEqual(selected);
    expect(resolveSubtitleOption('not-a-real-subtitle')).toEqual(
      LANDING_TITLE_SUBTITLE_OPTIONS[0],
    );
  });

  it('preserves the legacy lookup surface while preferring stable ids', () => {
    const renderer = LANDING_TITLE_RENDERERS[0];
    expect(renderer).toBeDefined();

    expect(getSubtitleRenderer(renderer?.id ?? '')).toBe(renderer);
    expect(getSubtitleRenderer(renderer?.text ?? '')).toBe(renderer);
  });
});
