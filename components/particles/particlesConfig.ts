import { configUrls } from "./configUrls";
import type { ParticleConfig, ParticleFeature, ParticlePreset, Theme } from "./types";

type ParticlePresetMetadata = Omit<ParticlePreset, 'url' | 'hash' | 'lastModified' | 'theme'>;

const PARTICLE_PRESET_METADATA = {
  butterflies: {
    id: 'butterflies',
    label: 'Paper Moths',
    family: 'organic',
    mood: 'airy drift',
    description: 'Elegant paper moths with warm champagne accents.',
    weight: 0.45,
    heroSafe: true,
    intensity: 'balanced',
    requires: ['slim'],
    counterpartId: 'fireflies',
    desktopCount: 18,
    mobileCount: 10,
    fpsLimit: 30,
  },
  flowers: {
    id: 'flowers',
    label: 'Bloom Field',
    family: 'playful',
    mood: 'petal lift',
    description: 'A soft upward bloom with pastel petal geometry.',
    weight: 0.5,
    heroSafe: true,
    intensity: 'balanced',
    requires: ['slim'],
    counterpartId: 'nebula',
    desktopCount: 28,
    mobileCount: 14,
    fpsLimit: 28,
  },
  hex: {
    id: 'hex',
    label: 'Hex Lattice',
    family: 'technical',
    mood: 'architectural grid',
    description: 'A restrained geometric field with icy lattice motion.',
    weight: 1.6,
    heroSafe: true,
    intensity: 'balanced',
    requires: ['slim'],
    counterpartId: 'matrix',
    desktopCount: 34,
    mobileCount: 18,
    fpsLimit: 30,
  },
  net: {
    id: 'net',
    label: 'Signal Mesh',
    family: 'technical',
    mood: 'network shimmer',
    description: 'A premium technical mesh with soft links and subtle parallax.',
    weight: 2.3,
    heroSafe: true,
    intensity: 'calm',
    requires: ['slim'],
    counterpartId: 'galaxy',
    desktopCount: 36,
    mobileCount: 20,
    fpsLimit: 30,
  },
  snow: {
    id: 'snow',
    label: 'Ice Drift',
    family: 'atmospheric',
    mood: 'glacial hush',
    description: 'A sparse atmospheric drift with a cool, polished glow.',
    weight: 0.7,
    heroSafe: true,
    intensity: 'calm',
    requires: ['slim'],
    counterpartId: 'stars',
    desktopCount: 26,
    mobileCount: 14,
    fpsLimit: 26,
  },
  fireflies: {
    id: 'fireflies',
    label: 'Ember Fireflies',
    family: 'organic',
    mood: 'warm glints',
    description: 'Sparse amber embers that pulse like distant fireflies.',
    weight: 1.45,
    heroSafe: true,
    intensity: 'balanced',
    requires: ['slim', 'twinkle'],
    counterpartId: 'butterflies',
    desktopCount: 28,
    mobileCount: 14,
    fpsLimit: 30,
  },
  galaxy: {
    id: 'galaxy',
    label: 'Deep Orbit',
    family: 'cosmic',
    mood: 'slow orbit',
    description: 'A layered starfield with quiet depth and cool orbit energy.',
    weight: 2.1,
    heroSafe: true,
    intensity: 'calm',
    requires: ['slim'],
    counterpartId: 'net',
    desktopCount: 32,
    mobileCount: 18,
    fpsLimit: 30,
  },
  matrix: {
    id: 'matrix',
    label: 'Glyph Rain',
    family: 'technical',
    mood: 'symbol cascade',
    description: 'A rare dramatic preset with descending glyphs and spectral green.',
    weight: 0.4,
    heroSafe: true,
    intensity: 'dramatic',
    requires: ['slim', 'text'],
    counterpartId: 'hex',
    desktopCount: 22,
    mobileCount: 12,
    fpsLimit: 26,
  },
  nebula: {
    id: 'nebula',
    label: 'Nebula Veil',
    family: 'cosmic',
    mood: 'electric haze',
    description: 'A dramatic neon haze with restrained depth and bloom.',
    weight: 0.8,
    heroSafe: true,
    intensity: 'dramatic',
    requires: ['slim'],
    counterpartId: 'flowers',
    desktopCount: 30,
    mobileCount: 16,
    fpsLimit: 28,
  },
  stars: {
    id: 'stars',
    label: 'Stellar Drift',
    family: 'atmospheric',
    mood: 'twilight glimmer',
    description: 'A sparse night field with refined twinkle and minimal drift.',
    weight: 2.35,
    heroSafe: true,
    intensity: 'calm',
    requires: ['slim', 'twinkle'],
    counterpartId: 'snow',
    desktopCount: 24,
    mobileCount: 12,
    fpsLimit: 26,
  },
} satisfies Record<string, ParticlePresetMetadata>;

type ParticlePresetId = keyof typeof PARTICLE_PRESET_METADATA;

export const getConfigId = (url: string): string => url.split('/').pop()?.replace('.json', '') ?? '';

const allParticleConfigs = (Object.values(configUrls).flat() as ParticleConfig[]).map((config) => {
  const id = getConfigId(config.url) as ParticlePresetId;
  const metadata = PARTICLE_PRESET_METADATA[id];

  if (!metadata) {
    throw new Error(`Missing particle preset metadata for '${id}'.`);
  }

  return {
    ...config,
    ...metadata,
  } satisfies ParticlePreset;
});

const particlePresetById = new Map(allParticleConfigs.map((preset) => [preset.id, preset]));

export const getAllConfigUrls = (theme: Theme): readonly ParticleConfig[] => configUrls[theme];

export const getParticlePresets = (theme: Theme): readonly ParticlePreset[] =>
  allParticleConfigs.filter((preset) => preset.theme === theme);

export const getParticlePresetById = (id: string): ParticlePreset | undefined => particlePresetById.get(id);

export const getParticlePresetByUrl = (url: string): ParticlePreset | undefined => {
  const id = getConfigId(url);
  return id ? getParticlePresetById(id) : undefined;
};

export const isParticlePresetSupported = (
  preset: ParticlePreset,
  features: ReadonlySet<ParticleFeature>,
): boolean => preset.requires.every((feature) => features.has(feature));

export const getSupportedParticlePresets = (
  theme: Theme,
  features: ReadonlySet<ParticleFeature>,
): readonly ParticlePreset[] => getParticlePresets(theme).filter((preset) => isParticlePresetSupported(preset, features));

interface ChooseWeightedParticlePresetOptions {
  theme: Theme;
  features: ReadonlySet<ParticleFeature>;
  currentPresetId?: string;
  preferredPresetId?: string;
  recentPresetIds?: readonly string[];
}

const chooseWeighted = (presets: readonly ParticlePreset[]): ParticlePreset | undefined => {
  const totalWeight = presets.reduce((sum, preset) => sum + preset.weight, 0);
  if (!totalWeight) return presets[0];

  let threshold = Math.random() * totalWeight;

  for (const preset of presets) {
    threshold -= preset.weight;
    if (threshold <= 0) {
      return preset;
    }
  }

  return presets[presets.length - 1];
};

export const chooseWeightedParticlePreset = ({
  theme,
  features,
  currentPresetId,
  preferredPresetId,
  recentPresetIds = [],
}: ChooseWeightedParticlePresetOptions): ParticlePreset | undefined => {
  const supportedPresets = getSupportedParticlePresets(theme, features);
  if (!supportedPresets.length) return undefined;

  if (preferredPresetId) {
    const preferredPreset = supportedPresets.find((preset) => preset.id === preferredPresetId);
    if (preferredPreset) {
      return preferredPreset;
    }
  }

  const recentPresetSet = new Set(recentPresetIds);
  const recentFamily = recentPresetIds[0]
    ? getParticlePresetById(recentPresetIds[0])?.family
    : undefined;

  let candidates = supportedPresets.filter((preset) => {
    return preset.id !== currentPresetId && !recentPresetSet.has(preset.id);
  });

  if (!candidates.length) {
    candidates = supportedPresets.filter((preset) => preset.id !== currentPresetId);
  }

  if (!candidates.length) {
    candidates = [...supportedPresets];
  }

  if (recentFamily && candidates.some((preset) => preset.family !== recentFamily)) {
    candidates = candidates.filter((preset) => preset.family !== recentFamily);
  }

  return chooseWeighted(candidates);
};

export const getDefaultParticlePreset = (
  theme: Theme,
  features: ReadonlySet<ParticleFeature>,
): ParticlePreset | undefined => {
  const supportedPresets = getSupportedParticlePresets(theme, features);
  return [...supportedPresets].sort((a, b) => b.weight - a.weight)[0];
};
