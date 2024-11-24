"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
import { loadAll } from "@tsparticles/all";
import { getRandomConfigUrl } from "@/components/particles/particlesConfig";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);
  const { theme, systemTheme } = useTheme();
  const [currentConfigUrl, setCurrentConfigUrl] = useState<string>("");
  const engineRef = useRef<Engine | null>(null);

  // Initialize particle engine once
  useEffect(() => {
    const initEngine = async () => {
      try {
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
      engineRef.current = null;
    };
  }, []);

  // Update config when theme changes
  useEffect(() => {
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    const newConfigUrl = getRandomConfigUrl(effectiveTheme === 'dark' ? 'dark' : 'light');
    setCurrentConfigUrl(newConfigUrl);
  }, [theme, systemTheme]);

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) {
      await container.refresh();
    }
  }, []);

  if (!init || !currentConfigUrl) return null;

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
