export interface ParticleConfig {
  url: string;
  hash: string;
  lastModified: string;
  theme: Theme;
}

export type Theme = 'light' | 'dark';

export type ParticleFeature = 'slim' | 'text' | 'twinkle';

export type ParticleFamily = 'technical' | 'atmospheric' | 'organic' | 'cosmic' | 'playful';

export type ParticleIntensity = 'calm' | 'balanced' | 'dramatic';

export interface ParticlePreset {
  id: string;
  url: string;
  hash: string;
  lastModified: string;
  theme: Theme;
  label: string;
  family: ParticleFamily;
  mood: string;
  description: string;
  weight: number;
  heroSafe: boolean;
  intensity: ParticleIntensity;
  requires: readonly ParticleFeature[];
  counterpartId?: string;
  desktopCount: number;
  mobileCount: number;
  fpsLimit: number;
}
