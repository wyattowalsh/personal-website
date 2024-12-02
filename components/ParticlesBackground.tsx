"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getRandomConfigUrl } from "@/components/particles/particlesConfig";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { type Container, type Engine } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import ParticleControls from "./ParticleControls";

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);
  const { resolvedTheme } = useTheme();
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<Container | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentConfigUrl, setCurrentConfigUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Initialize theme
  const currentTheme = resolvedTheme as "light" | "dark" || "light";

  // Handle mounting
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      // Cleanup container if it exists
      if (containerRef.current) {
        containerRef.current.destroy();
      }
    };
  }, []);

  // Initialize particle engine once and set initial config
  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted, currentTheme]);

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
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 -z-10"
      >
        <AnimatePresence mode="wait">
          {currentConfigUrl && (
            <Particles
              key={currentConfigUrl}
              id={`tsparticles-${currentConfigUrl}`}
              className="absolute inset-0"
              url={currentConfigUrl}
              particlesLoaded={particlesLoaded}
              options={{
                fps_limit: 60,
                pauseOnBlur: true,
                pauseOnOutsideViewport: true,
                responsive: [
                  {
                    maxWidth: 768,
                    options: {
                      particles: {
                        number: { value: 30 }
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
      />
    </>
  );
}
