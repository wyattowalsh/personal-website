"use client";

import { useEffect, useMemo, useState, useCallback, useRef, type CSSProperties, type FC } from "react";
import {
  chooseWeightedParticlePreset,
  getParticlePresetById,
  getSupportedParticlePresets,
  isParticlePresetSupported,
} from "@/components/particles/particlesConfig";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { loadTextShape } from "@tsparticles/shape-text";
import { loadTwinkleUpdater } from "@tsparticles/updater-twinkle";
import type { ParticleFeature, ParticlePreset, Theme } from "@/components/particles/types";
import { ParticleControls, type DensityLevel } from "./ParticleControls";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';

interface ParticlesBackgroundProps {
  className?: string;
}

const PARTICLES_ID = 'tsparticles-homepage';
const PARTICLE_HISTORY_LIMIT = 3;
const DENSITY_STORAGE_KEY = 'tsparticles-density';
const SUPPORTED_PARTICLE_FEATURES = new Set<ParticleFeature>(['slim', 'text', 'twinkle']);

const getHistoryStorageKey = (theme: Theme) => `tsparticles-history:${theme}`;

const isDensityLevel = (value: string | null): value is DensityLevel =>
  value === 'full' || value === 'reduced' || value === 'off';

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const cloneValue = <T,>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneValue(item)]),
    ) as T;
  }

  return value;
};

const mergeOptions = <T extends Record<string, unknown>>(base: T, override: Record<string, unknown>): T => {
  const merged = cloneValue(base) as Record<string, unknown>;

  for (const [key, value] of Object.entries(override)) {
    const current = merged[key];
    merged[key] = isPlainObject(current) && isPlainObject(value)
      ? mergeOptions(current, value)
      : cloneValue(value);
  }

  return merged as T;
};

const getDensityMultiplier = (level: DensityLevel): number => {
  switch (level) {
    case 'full':
      return 1.0;
    case 'reduced':
      return 0.4;
    case 'off':
      return 0;
    default:
      return 1.0;
  }
};

const getRuntimeParticleOptions = (preset: ParticlePreset, density: DensityLevel): ISourceOptions => ({
  fpsLimit: preset.fpsLimit,
  fullScreen: {
    enable: false,
  },
  pauseOnBlur: true,
  pauseOnOutsideViewport: true,
  interactivity: {
    events: {
      onClick: {
        enable: false,
      },
    },
  },
  particles: {
    number: {
      value: Math.round(preset.desktopCount * getDensityMultiplier(density)),
      density: {
        enable: true,
      },
    },
  },
  responsive: [
    {
      maxWidth: 768,
      options: {
        particles: {
          number: {
            value: Math.round(preset.mobileCount * getDensityMultiplier(density)),
          },
        },
      },
    },
  ],
});

export const ParticlesBackground: FC<ParticlesBackgroundProps> = ({ className = '' }) => {
  const [init, setInit] = useState(false);
  const { resolvedTheme } = useTheme();
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<Container | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentPresetId, setCurrentPresetId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [configOptions, setConfigOptions] = useState<ISourceOptions | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const [density, setDensity] = useState<DensityLevel>('full');

  // Initialize theme
  const currentTheme: "light" | "dark" = resolvedTheme === 'dark' ? 'dark' : 'light';
  const availablePresets = useMemo(
    () => getSupportedParticlePresets(currentTheme, SUPPORTED_PARTICLE_FEATURES),
    [currentTheme],
  );
  const currentPreset = currentPresetId ? getParticlePresetById(currentPresetId) : undefined;
  const currentConfigUrl = currentPreset?.url ?? '';
  const staticMode = prefersReducedMotion || density === 'off';
  const particleOptions = useMemo(() => {
    if (!configOptions || !currentPreset || staticMode) return undefined;

    return mergeOptions(configOptions as Record<string, unknown>, getRuntimeParticleOptions(currentPreset, density) as Record<string, unknown>) as ISourceOptions;
  }, [configOptions, currentPreset, density, staticMode]);
  const particleStyle = useMemo<CSSProperties | undefined>(() => {
    if (!currentPreset) return undefined;

    return {
      mixBlendMode: currentPreset.backdrop.blendMode,
      opacity: currentPreset.backdrop.opacity,
    };
  }, [currentPreset]);

  const removeStaleParticleNodes = useCallback(() => {
    if (typeof document === 'undefined') return;

    document.querySelectorAll<HTMLElement>('[id^="tsparticles-"]').forEach((node) => {
      if (node.id !== PARTICLES_ID) {
        node.remove();
      }
    });
  }, []);

  const resetParticles = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.destroy();
      containerRef.current = null;
    }

    removeStaleParticleNodes();
  }, [removeStaleParticleNodes]);

  const getRecentPresetIds = useCallback((theme: Theme): string[] => {
    if (typeof window === 'undefined') return [];

    try {
      const rawHistory = window.sessionStorage.getItem(getHistoryStorageKey(theme));
      if (!rawHistory) return [];

      const parsed = JSON.parse(rawHistory);
      return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
    } catch {
      return [];
    }
  }, []);

  const pushRecentPresetId = useCallback((theme: Theme, presetId: string) => {
    if (typeof window === 'undefined' || !presetId) return;

    const history = getRecentPresetIds(theme).filter((value) => value !== presetId);
    history.unshift(presetId);
    window.sessionStorage.setItem(getHistoryStorageKey(theme), JSON.stringify(history.slice(0, PARTICLE_HISTORY_LIMIT)));
  }, [getRecentPresetIds]);

  const pickNextPresetId = useCallback((theme: Theme, preferredPresetId?: string) => {
    const nextPreset = chooseWeightedParticlePreset({
      theme,
      features: SUPPORTED_PARTICLE_FEATURES,
      currentPresetId: theme === currentTheme ? currentPresetId : undefined,
      preferredPresetId,
      recentPresetIds: getRecentPresetIds(theme),
    });

    return nextPreset?.id ?? '';
  }, [currentPresetId, currentTheme, getRecentPresetIds]);

  const selectPreset = useCallback((presetId: string) => {
    if (!presetId || presetId === currentPresetId) return;

    resetParticles();
    setCurrentPresetId(presetId);
    setIsPaused(false);
  }, [currentPresetId, resetParticles]);

  // Density change handler
  const handleDensityChange = useCallback((newDensity: DensityLevel) => {
    setDensity(newDensity);
    if (newDensity === 'off') {
      resetParticles();
      setIsPaused(false);
      return;
    }

    setIsPaused(false);
  }, [resetParticles]);

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
      resetParticles();
    };
  }, [resetParticles]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedDensity = window.localStorage.getItem(DENSITY_STORAGE_KEY);
      if (isDensityLevel(storedDensity)) {
        setDensity(storedDensity);
      }
    } catch {
      // Ignore storage failures; controls remain usable for the current page view.
    }
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
    } catch {
      // Ignore storage failures; the in-memory density state is still authoritative.
    }
  }, [density, mounted]);

  // Handle engine initialization only when animated particles can be shown.
  useEffect(() => {
    if (!mounted || staticMode || init) return;

    let active = true;

    const initEngine = async () => {
      try {
        await initParticlesEngine(async (engine) => {
          await loadSlim(engine);
          await loadTextShape(engine);
          await loadTwinkleUpdater(engine);
        });

        if (active) {
          setInit(true);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to initialize particles");
        }
        console.error("Particles initialization failed:", err);
      }
    };

    void initEngine();

    return () => {
      active = false;
    };
  }, [init, mounted, staticMode]);

  // Keep the selected style valid for the current theme without re-randomizing on every sync.
  useEffect(() => {
    if (!mounted) return;

    if (currentPreset?.theme === currentTheme && isParticlePresetSupported(currentPreset, SUPPORTED_PARTICLE_FEATURES)) {
      removeStaleParticleNodes();
      return;
    }

    const preferredPresetId = currentPreset?.counterpartId;
    const nextPresetId = pickNextPresetId(currentTheme, preferredPresetId);
    if (nextPresetId && nextPresetId !== currentPresetId) {
      resetParticles();
      setCurrentPresetId(nextPresetId);
      setIsPaused(false);
      return;
    }

    removeStaleParticleNodes();
  }, [currentPreset, currentPresetId, currentTheme, mounted, pickNextPresetId, removeStaleParticleNodes, resetParticles]);

  useEffect(() => {
    if (!currentConfigUrl || staticMode) {
      setConfigOptions(null);
      return;
    }

    let active = true;
    setConfigOptions(null);

    const loadConfig = async () => {
      try {
        const response = await fetch(currentConfigUrl);
        if (!response.ok) {
          throw new Error(`Failed to load particle config ${currentConfigUrl}: ${response.status}`);
        }

        const options = await response.json() as ISourceOptions;
        if (active) {
          setConfigOptions(options);
          setError(null);
        }
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : "Failed to load particle config";
          setConfigOptions(null);
          setError(message);
          console.error("Particles config load failed:", err);
        }
      }
    };

    void loadConfig();

    return () => {
      active = false;
    };
  }, [currentConfigUrl, staticMode]);

  useEffect(() => {
    if (!currentPreset || currentPreset.theme !== currentTheme) return;
    pushRecentPresetId(currentTheme, currentPreset.id);
  }, [currentPreset, currentTheme, pushRecentPresetId]);

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) {
      // Cleanup previous container if it exists
      if (containerRef.current && containerRef.current !== container) {
        containerRef.current.destroy();
      }
      containerRef.current = container;
      removeStaleParticleNodes();
      setIsPaused(false);
    }
  }, [removeStaleParticleNodes]);

  const handleConfigChange = useCallback((presetId: string) => {
    selectPreset(presetId);
  }, [selectPreset]);

  const handlePause = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const handleResume = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.play();
      setIsPaused(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    const nextPresetId = pickNextPresetId(currentTheme);
    if (nextPresetId) {
      selectPreset(nextPresetId);
    }
  }, [currentTheme, pickNextPresetId, selectPreset]);

  const controls = (
    <ParticleControls
      onConfigChange={handleConfigChange}
      onPause={handlePause}
      onResume={handleResume}
      onRefresh={handleRefresh}
      isPaused={isPaused}
      presets={availablePresets}
      currentPresetId={currentPresetId}
      density={density}
      onDensityChange={handleDensityChange}
      canPause={!staticMode && init && Boolean(currentPresetId)}
    />
  );

  if (!mounted) return null;
  if (error) {
    console.error("Particles error:", error);
    return (
      <>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-linear-to-br from-background via-background to-muted/20" aria-hidden="true" />
        {controls}
      </>
    );
  }

  // Show static gradient for users who prefer reduced motion or density is off
  if (staticMode || !init || !particleOptions) {
    return (
      <>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-linear-to-br from-background via-background to-muted/20" aria-hidden="true" />
        {controls}
      </>
    );
  }

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      >
        {currentPreset ? (
          <div className="absolute inset-0" style={particleStyle}>
            <Particles
              key={`${currentPreset.id}-${currentPreset.hash}-${density}`}
              id={PARTICLES_ID}
              className="absolute inset-0"
              particlesLoaded={particlesLoaded}
              options={particleOptions}
            />
          </div>
        ) : null}
      </motion.div>

      {controls}
    </div>
  );
};
