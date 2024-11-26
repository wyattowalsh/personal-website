"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getRandomConfigUrl } from "@/components/particles/particlesConfig";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { type Container, type Engine } from "@tsparticles/engine";
import dynamic from 'next/dynamic';

// Dynamically import Particles
const Particles = dynamic(() => import("@tsparticles/react"), {
  ssr: false,
  loading: () => <></>,
});

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);
  const { theme, systemTheme, resolvedTheme } = useTheme();
  const [currentConfigUrl, setCurrentConfigUrl] = useState<string>("");
  const engineRef = useRef<Engine | null>(null);
  const containerRef = useRef<Container | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialize particle engine once
  useEffect(() => {
    if (!mounted) return;

    const initEngine = async () => {
      try {
        const { initParticlesEngine } = await import("@tsparticles/react");
        const { loadAll } = await import("@tsparticles/all");
        
        await initParticlesEngine(async (engine) => {
          engineRef.current = engine;
          await loadAll(engine);
        });
        setInit(true);
      } catch (error) {
        console.error("Failed to initialize particles engine:", error);
      }
    };

    initEngine();

    return () => {
      if (engineRef.current) {
        engineRef.current = null;
      }
    };
  }, [mounted]);

  // Cleanup function for particles container
  const cleanup = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.destroy();
      containerRef.current = null;
    }
  }, []);

  // Update config when theme changes
  useEffect(() => {
    if (!mounted || !init) return;

    const currentTheme = resolvedTheme as 'light' | 'dark';
    if (!currentTheme) return;

    const updateParticles = async () => {
      // Clean up existing particles
      cleanup();

      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get new config and update
      const newConfigUrl = getRandomConfigUrl(currentTheme);
      setCurrentConfigUrl(newConfigUrl);
    };

    updateParticles();

    return () => cleanup();
  }, [resolvedTheme, init, mounted, cleanup]);

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) {
      containerRef.current = container;
      await container.refresh();
    }
  }, []);

  // Don't render anything until mounted and initialized
  if (!mounted || !init || !currentConfigUrl) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentConfigUrl}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 -z-10"
        transition={{ duration: 0.8 }}
      >
        <Particles
          id={`tsparticles-${currentConfigUrl}`}
          className="absolute inset-0"
          url={currentConfigUrl}
          particlesLoaded={particlesLoaded}
          options={{
            fullScreen: false,
            detectRetina: true,
            fpsLimit: 120,
            interactivity: {
              detectsOn: "window",
              events: {
                onHover: {
                  enable: true,
                  mode: "grab"
                },
                resize: {
                  enable: true,
                  delay: 0.5
                }
              },
              modes: {
                grab: {
                  distance: 140,
                  links: {
                    opacity: 0.5
                  }
                }
              }
            }
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
