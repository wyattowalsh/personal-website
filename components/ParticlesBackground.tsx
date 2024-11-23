"use client";

import { useEffect, useState, useCallback } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
import { loadAll } from "@tsparticles/all";
import { getRandomConfigUrl } from "@/components/particles/particlesConfig";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);
  const { theme } = useTheme();
  const [key, setKey] = useState(0); // Add key for forcing re-render

  // Initialize particle engine once
  useEffect(() => {
    const initEngine = async () => {
      await initParticlesEngine(async (engine: Engine) => {
        await loadAll(engine);
      });
      setInit(true);
    };
    initEngine();
  }, []);

  // Force re-render when theme changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [theme]);

  const particlesLoaded = useCallback(async (container?: Container) => {
    await container?.refresh();
  }, []);

  return (
    <AnimatePresence mode="wait">
      {init && (
        <motion.div
          key={key} // Add key here to force re-render
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 -z-10"
          transition={{ duration: 0.8 }}
        >
          <Particles
            id={`tsparticles-${key}`} // Make ID unique on theme change
            className="absolute inset-0"
            url={getRandomConfigUrl(theme === "dark" ? "dark" : "light")}
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
                  resize: true
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
      )}
    </AnimatePresence>
  );
}
