"use client";

import { useEffect, useState, useCallback, useRef, type FC } from "react";
import { getAllConfigUrls, getRandomConfigUrl } from "@/components/particles/particlesConfig";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { type Container } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { ParticleControls, type DensityLevel } from "./ParticleControls";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';

interface ParticlesBackgroundProps {
  className?: string;
}

const PARTICLES_ID = 'tsparticles-homepage';

export const ParticlesBackground: FC<ParticlesBackgroundProps> = ({ className = '' }) => {
  const [init, setInit] = useState(false);
  const { resolvedTheme } = useTheme();
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<Container | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentConfigUrl, setCurrentConfigUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Density state (localStorage persistence disabled temporarily)
  const [density, setDensity] = useState<DensityLevel>('full');

  // Initialize theme
  const currentTheme: "light" | "dark" = resolvedTheme === 'dark' ? 'dark' : 'light';

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

  const getPreferredConfigUrl = useCallback((theme: "light" | "dark", currentUrl: string) => {
    const configs = getAllConfigUrls(theme);
    if (!configs.length) return '';
    if (configs.some((config) => config.url === currentUrl)) return currentUrl;

    const currentName = currentUrl.split('/').pop()?.replace('.json', '');
    const matchedConfig = currentName
      ? configs.find((config) => config.url.endsWith(`/${currentName}.json`))
      : undefined;

    return matchedConfig?.url ?? configs[0]?.url ?? '';
  }, []);

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
        });

        setInit(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize particles");
        console.error("Particles initialization failed:", err);
      }
    };

    // Defer particle initialization to avoid competing with LCP
    let cleanup: (() => void) | undefined;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = requestIdleCallback(() => initEngine(), { timeout: 3000 });
      cleanup = () => cancelIdleCallback(id);
    } else {
      const timer = setTimeout(initEngine, 3000);
      cleanup = () => clearTimeout(timer);
    }

    return () => {
      cleanup?.();
      setMounted(false);
      resetParticles();
    };
  }, [resetParticles]);

  // Keep the selected style valid for the current theme without re-randomizing on every sync.
  useEffect(() => {
    if (!mounted || !init) return;

    const preferredConfigUrl = getPreferredConfigUrl(currentTheme, currentConfigUrl);
    if (preferredConfigUrl && preferredConfigUrl !== currentConfigUrl) {
      resetParticles();
      setCurrentConfigUrl(preferredConfigUrl); // eslint-disable-line react-hooks/set-state-in-effect -- sync selected config when the theme changes
      setIsPaused(false); // keep controls aligned with the live container
      return;
    }

    removeStaleParticleNodes();
  }, [currentConfigUrl, currentTheme, getPreferredConfigUrl, init, mounted, removeStaleParticleNodes, resetParticles]);

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

  const handleConfigChange = useCallback((configUrl: string) => {
    resetParticles();
    setCurrentConfigUrl(configUrl);
    setIsPaused(false);
  }, [resetParticles]);

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
    resetParticles();

    const availableConfigs = getAllConfigUrls(currentTheme);
    const alternateConfigs = availableConfigs.filter((config) => config.url !== currentConfigUrl);
    const newConfigUrl = alternateConfigs.length
      ? alternateConfigs[Math.floor(Math.random() * alternateConfigs.length)]?.url ?? getRandomConfigUrl(currentTheme)
      : getRandomConfigUrl(currentTheme);

    setCurrentConfigUrl(newConfigUrl);
    setIsPaused(false);
  }, [currentConfigUrl, currentTheme, resetParticles]);

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
          theme={currentTheme}
          currentConfigUrl={currentConfigUrl}
          density={density}
          onDensityChange={handleDensityChange}
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
        className="fixed inset-0 -z-10"
      >
        {currentConfigUrl ? (
          <Particles
            key={`${currentConfigUrl}-${density}`}
            id={PARTICLES_ID}
            className="absolute inset-0"
            url={currentConfigUrl}
            particlesLoaded={particlesLoaded}
            options={{
              fpsLimit: 30,
              pauseOnBlur: true,
              pauseOnOutsideViewport: true,
              particles: {
                number: {
                  value: Math.round(80 * getDensityMultiplier(density)),
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
                        value: Math.round(30 * getDensityMultiplier(density))
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
        theme={currentTheme}
        currentConfigUrl={currentConfigUrl}
        density={density}
        onDensityChange={handleDensityChange}
      />
    </div>
  );
};
