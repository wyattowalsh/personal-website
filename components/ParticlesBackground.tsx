"use client";

import { useEffect, useMemo, useState, useCallback, useRef, type FC } from "react";
import {
  chooseWeightedParticlePreset,
  getParticlePresetById,
  getSupportedParticlePresets,
  isParticlePresetSupported,
} from "@/components/particles/particlesConfig";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { type Container } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { loadTextShape } from "@tsparticles/shape-text";
import { loadTwinkleUpdater } from "@tsparticles/updater-twinkle";
import type { ParticleFeature, Theme } from "@/components/particles/types";
import { ParticleControls, type DensityLevel } from "./ParticleControls";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';

interface ParticlesBackgroundProps {
  className?: string;
}

const PARTICLES_ID = 'tsparticles-homepage';
const PARTICLE_HISTORY_LIMIT = 3;
const SUPPORTED_PARTICLE_FEATURES = new Set<ParticleFeature>(['slim', 'text', 'twinkle']);

const getHistoryStorageKey = (theme: Theme) => `tsparticles-history:${theme}`;

export const ParticlesBackground: FC<ParticlesBackgroundProps> = ({ className = '' }) => {
  const [init, setInit] = useState(false);
  const { resolvedTheme } = useTheme();
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<Container | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentPresetId, setCurrentPresetId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Density state (localStorage persistence disabled temporarily)
  const [density, setDensity] = useState<DensityLevel>('full');

  // Initialize theme
  const currentTheme: "light" | "dark" = resolvedTheme === 'dark' ? 'dark' : 'light';
  const availablePresets = useMemo(
    () => getSupportedParticlePresets(currentTheme, SUPPORTED_PARTICLE_FEATURES),
    [currentTheme],
  );
  const currentPreset = currentPresetId ? getParticlePresetById(currentPresetId) : undefined;
  const currentConfigUrl = currentPreset?.url ?? '';

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

  // Calculate density multiplier
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

  // Handle mounting and initialization
  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect -- client mount guard for hydration

    const initEngine = async () => {
      try {
        await initParticlesEngine(async (engine) => {
          await loadSlim(engine);
          await loadTextShape(engine);
          await loadTwinkleUpdater(engine);
        });

        setInit(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize particles");
        console.error("Particles initialization failed:", err);
      }
    };

    void initEngine();

    return () => {
      setMounted(false);
      resetParticles();
    };
  }, [resetParticles]);

  // Keep the selected style valid for the current theme without re-randomizing on every sync.
  useEffect(() => {
    if (!mounted || !init) return;

    if (currentPreset?.theme === currentTheme && isParticlePresetSupported(currentPreset, SUPPORTED_PARTICLE_FEATURES)) {
      removeStaleParticleNodes();
      return;
    }

    const preferredPresetId = currentPreset?.counterpartId;
    const nextPresetId = pickNextPresetId(currentTheme, preferredPresetId);
    if (nextPresetId && nextPresetId !== currentPresetId) {
      resetParticles();
      setCurrentPresetId(nextPresetId); // eslint-disable-line react-hooks/set-state-in-effect -- sync selected config when the theme changes
      setIsPaused(false);
      return;
    }

    removeStaleParticleNodes();
  }, [currentPreset, currentPresetId, currentTheme, init, mounted, pickNextPresetId, removeStaleParticleNodes, resetParticles]);

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

  if (!mounted || !init) return null;
  if (error) {
    console.error("Particles error:", error);
    return <div className="fixed inset-0 -z-10 bg-linear-to-br from-background via-background to-muted/20" />;
  }

  // Show static gradient for users who prefer reduced motion or density is off
  if (prefersReducedMotion || density === 'off') {
    return (
      <>
        <div className="fixed inset-0 -z-10 bg-linear-to-br from-background via-background to-muted/20" />
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
          canPause={!prefersReducedMotion && density !== 'off' && Boolean(currentPresetId)}
        />
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
      >
        {currentConfigUrl ? (
          <Particles
            key={`${currentConfigUrl}-${density}`}
            id={PARTICLES_ID}
            className="absolute inset-0 opacity-90 mix-blend-multiply dark:mix-blend-screen"
            url={currentConfigUrl}
            particlesLoaded={particlesLoaded}
            options={{
              fpsLimit: currentPreset?.fpsLimit ?? 30,
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
                  value: Math.round((currentPreset?.desktopCount ?? 32) * getDensityMultiplier(density)),
                  density: {
                    enable: true,
                  }
                }
              },
              responsive: [
                {
                  maxWidth: 768,
                  options: {
                    particles: {
                      number: {
                        value: Math.round((currentPreset?.mobileCount ?? 18) * getDensityMultiplier(density))
                      }
                    }
                  }
                }
              ]
            }}
          />
        ) : null}
      </motion.div>

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
        canPause={Boolean(currentPresetId)}
      />
    </div>
  );
};
