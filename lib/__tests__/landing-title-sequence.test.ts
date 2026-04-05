import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildRotationSequence,
  deriveSignalDeckMeta,
  hasThemeAdjacencyConflict,
} from '@/lib/landing-title-sequence';

const SAMPLE_THEMES = [
  { text: 'experience sculptor' },
  { text: 'digital sculptor' },
  { text: 'experience crafter' },
  { text: 'quantum designer' },
  { text: 'behavioral designer' },
  { text: 'data orchestrator' },
  { text: 'systems dreamer' },
  { text: 'cloud shaper' },
  { text: 'code architect' },
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
    expect(deriveSignalDeckMeta('experience sculptor')).toEqual({
      family: 'Sculptor',
      descriptor: 'tactile systems',
    });

    expect(deriveSignalDeckMeta('data orchestrator')).toEqual({
      family: 'Orchestrator',
      descriptor: 'coordinated crescendo',
    });
  });
});

describe('hasThemeAdjacencyConflict', () => {
  it('flags repeated lead words, role words, and families', () => {
    expect(hasThemeAdjacencyConflict(
      { text: 'experience sculptor' },
      { text: 'experience crafter' },
    )).toBe(true);

    expect(hasThemeAdjacencyConflict(
      { text: 'digital sculptor' },
      { text: 'resilience sculptor' },
    )).toBe(true);

    expect(hasThemeAdjacencyConflict(
      { text: 'code architect' },
      { text: 'cybernetic architect' },
    )).toBe(true);

    expect(hasThemeAdjacencyConflict(
      { text: 'cloud shaper' },
      { text: 'data orchestrator' },
    )).toBe(false);
  });
});

describe('buildRotationSequence', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds a sequence without adjacent collisions and respects the anchor theme', () => {
    vi.spyOn(Math, 'random').mockImplementation(deterministicRandom());

    const anchorTheme = { text: 'cybernetic architect' };
    const sequence = buildRotationSequence(SAMPLE_THEMES, anchorTheme);

    expect(sequence.map((theme) => theme.text).sort()).toEqual(
      SAMPLE_THEMES.map((theme) => theme.text).sort(),
    );

    expect(hasThemeAdjacencyConflict(anchorTheme, sequence[0]!)).toBe(false);

    for (let index = 1; index < sequence.length; index += 1) {
      expect(hasThemeAdjacencyConflict(sequence[index - 1]!, sequence[index]!)).toBe(false);
    }
  });
});
