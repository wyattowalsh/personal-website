import { afterEach, describe, expect, it, vi } from 'vitest';

import { LANDING_TITLE_RENDERERS } from '@/components/landing-title/registry';
import {
  buildRotationSequence,
  deriveSignalDeckMeta,
  hasThemeAdjacencyConflict,
} from '@/lib/landing-title-sequence';

const SAMPLE_THEMES = [
  { text: 'digital sculptor' },
  { text: 'frontier forger' },
  { text: 'quantum designer' },
  { text: 'signal orchestrator' },
  { text: 'cloud shaper' },
  { text: 'cognitive architect' },
];

function deterministicRandom() {
  let seed = 0;

  return () => {
    seed = (seed + 0.173) % 1;
    return seed;
  };
}

describe('deriveSignalDeckMeta', () => {
  it('classifies known tagline families', () => {
    expect(deriveSignalDeckMeta('digital sculptor')).toEqual({
      family: 'Sculptor',
      descriptor: 'tactile systems',
    });

    expect(deriveSignalDeckMeta('signal orchestrator')).toEqual({
      family: 'Orchestrator',
      descriptor: 'coordinated crescendo',
    });
  });
});

describe('hasThemeAdjacencyConflict', () => {
  it('flags repeated lead words, role words, and families', () => {
    expect(hasThemeAdjacencyConflict(
      { text: 'signal orchestrator' },
      { text: 'signal oracle' },
    )).toBe(true);

    expect(hasThemeAdjacencyConflict(
      {
        text: 'holosculptor',
        signalDeck: { family: 'Sculptor', descriptor: 'volumetric material' },
      },
      { text: 'digital sculptor' },
    )).toBe(true);

    expect(hasThemeAdjacencyConflict(
      { text: 'cognitive architect' },
      { text: 'cyber architect' },
    )).toBe(true);

    expect(hasThemeAdjacencyConflict(
      { text: 'cloud shaper' },
      { text: 'frontier forger' },
    )).toBe(false);
  });

  it('prefers stable ids and signal deck metadata over mutable display text', () => {
    expect(hasThemeAdjacencyConflict(
      {
        id: 'synthetic-intelligence-architect',
        text: 'software chassis',
        signalDeck: { family: 'Architect', descriptor: 'systems precision' },
      },
      {
        id: 'cloud-shaper',
        text: 'creative systems copy',
        signalDeck: { family: 'Cartographer', descriptor: 'route synthesis' },
      },
    )).toBe(false);

    expect(hasThemeAdjacencyConflict(
      {
        id: 'synthetic-intelligence-architect',
        text: 'software chassis',
        signalDeck: { family: 'Architect', descriptor: 'systems precision' },
      },
      {
        id: 'zero-trust-architect',
        text: 'security shell',
        signalDeck: { family: 'Architect', descriptor: 'systems precision' },
      },
    )).toBe(true);
  });
});

describe('buildRotationSequence', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds a sequence without adjacent collisions and respects the anchor theme', () => {
    vi.spyOn(Math, 'random').mockImplementation(deterministicRandom());

    const anchorTheme = { text: 'cyber architect' };
    const sequence = buildRotationSequence(SAMPLE_THEMES, anchorTheme);

    expect(sequence.map((theme) => theme.text).sort()).toEqual(
      SAMPLE_THEMES.map((theme) => theme.text).sort(),
    );

    expect(hasThemeAdjacencyConflict(anchorTheme, sequence[0]!)).toBe(false);

    for (let index = 1; index < sequence.length; index += 1) {
      expect(hasThemeAdjacencyConflict(sequence[index - 1]!, sequence[index]!)).toBe(false);
    }
  });

  it('builds a collision-free sequence from the live landing title registry', () => {
    vi.spyOn(Math, 'random').mockImplementation(deterministicRandom());

    const anchorTheme = LANDING_TITLE_RENDERERS[0]!;
    const sequence = buildRotationSequence(LANDING_TITLE_RENDERERS, anchorTheme);

    expect(sequence).toHaveLength(LANDING_TITLE_RENDERERS.length);
    expect(sequence.map(({ id }) => id).sort()).toEqual(
      LANDING_TITLE_RENDERERS.map(({ id }) => id).sort(),
    );
    expect(hasThemeAdjacencyConflict(anchorTheme, sequence[0]!)).toBe(false);

    for (let index = 1; index < sequence.length; index += 1) {
      expect(hasThemeAdjacencyConflict(sequence[index - 1]!, sequence[index]!)).toBe(false);
    }
  });
});
