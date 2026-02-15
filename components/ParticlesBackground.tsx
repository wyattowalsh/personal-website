"use client";

import { useEffect, useState, useCallback, useRef, type FC } from "react";
import { getRandomConfigUrl } from "@/components/particles/particlesConfig";
import { useTheme } from "next-themes";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { type Container } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import ParticleControls, { type DensityLevel } from "./ParticleControls";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';

interface ParticlesBackgroundProps {
  className?: string;
}

const ParticlesBackground: FC<ParticlesBackgroundProps> = ({ className = '' }) => {
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
  const currentTheme = resolvedTheme as "light" | "dark" || "light";

  // Density change handler
  const handleDensityChange = useCallback((newDensity: DensityLevel) => {
    setDensity(newDensity);
    // Refresh particles when density changes
    if (newDensity !== 'off') {
      const newConfigUrl = getRandomConfigUrl(currentTheme);
      setCurrentConfigUrl(newConfigUrl);
      setIsPaused(false);
    }
  }, [currentTheme]);

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
    setMounted(true);

    const initEngine = async () => {
      try {
        await initParticlesEngine(async (engine) => {
          await loadSlim(engine);
        });

        setInit(true);

        // Set initial config after engine is initialized
        const initialConfig = getRandomConfigUrl(currentTheme);
        setCurrentConfigUrl(initialConfig);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize particles");
        console.error("Particles initialization failed:", err);
      }
    };

    initEngine();

    return () => {
      setMounted(false);
      // Cleanup container if it exists
      if (containerRef.current) {
        containerRef.current.destroy();
      }
    };
  }, [currentTheme]);

  // Update theme effect
  useEffect(() => {
    if (!mounted || !init || !resolvedTheme) return;

    const theme = resolvedTheme as "light" | "dark";
    const newConfigUrl = getRandomConfigUrl(theme);
    setCurrentConfigUrl(newConfigUrl);
  }, [resolvedTheme, init, mounted]);

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) {
      // Cleanup previous container if it exists
      if (containerRef.current && containerRef.current !== container) {
        containerRef.current.destroy();
      }
      containerRef.current = container;
      setIsPaused(false);
    }
  }, []);

  const handleConfigChange = useCallback((configUrl: string) => {
    setCurrentConfigUrl(configUrl);
    setIsPaused(false);
  }, []);

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
    const newConfigUrl = getRandomConfigUrl(currentTheme);
    setCurrentConfigUrl(newConfigUrl);
    setIsPaused(false);
  }, [currentTheme]);

  if (!mounted || !init) return null;
  if (error) {
    console.error("Particles error:", error);
    return <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted/20" />;
  }

  // Show static gradient for users who prefer reduced motion or density is off
  if (prefersReducedMotion || density === 'off') {
    return (
      <>
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted/20" />
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
        <AnimatePresence mode="wait">
          {currentConfigUrl && (
            <Particles
              key={`${currentConfigUrl}-${density}`}
              id={`tsparticles-${currentConfigUrl}-${density}`}
              className="absolute inset-0"
              url={currentConfigUrl}
              particlesLoaded={particlesLoaded}
              options={{
                fpsLimit: 60,
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
          )}
        </AnimatePresence>
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

export default ParticlesBackground;
