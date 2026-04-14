import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  chooseWeightedParticlePreset,
  getParticlePresetById,
  getParticlePresetByUrl,
  getSupportedParticlePresets,
} from '@/components/particles/particlesConfig';
import type { ParticleFeature } from '@/components/particles/types';

const slimOnly = new Set<ParticleFeature>(['slim']);
const enhanced = new Set<ParticleFeature>(['slim', 'text', 'twinkle']);

describe('particle preset catalog', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('filters out presets that require plugins beyond slim', () => {
    const lightIds = getSupportedParticlePresets('light', slimOnly).map((preset) => preset.id);
    const darkIds = getSupportedParticlePresets('dark', slimOnly).map((preset) => preset.id);

    expect(lightIds).toEqual(['butterflies', 'flowers', 'hex', 'net', 'snow']);
    expect(darkIds).toEqual(['galaxy', 'nebula']);
  });

  it('exposes enhanced presets once text and twinkle support are available', () => {
    const darkIds = getSupportedParticlePresets('dark', enhanced).map((preset) => preset.id);

    expect(darkIds).toEqual(['fireflies', 'galaxy', 'matrix', 'nebula', 'stars']);
  });

  it('resolves preset metadata from url and id', () => {
    const presetById = getParticlePresetById('net');
    const presetByUrl = getParticlePresetByUrl('/particles/dark/stars.json');

    expect(presetById?.label).toBe('Signal Mesh');
    expect(presetByUrl?.label).toBe('Stellar Drift');
  });

  it('prefers the requested counterpart when it is supported', () => {
    const preset = chooseWeightedParticlePreset({
      theme: 'dark',
      features: enhanced,
      preferredPresetId: 'galaxy',
      recentPresetIds: ['stars'],
    });

    expect(preset?.id).toBe('galaxy');
  });

  it('avoids immediate repeats and recent-family repeats when alternatives exist', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const preset = chooseWeightedParticlePreset({
      theme: 'light',
      features: enhanced,
      currentPresetId: 'hex',
      recentPresetIds: ['net'],
    });

    expect(preset?.id).toBe('butterflies');
    expect(preset?.family).not.toBe('technical');
  });
});
