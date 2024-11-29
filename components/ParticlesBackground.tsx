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
  const { resolvedTheme, theme } = useTheme();
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<Container | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentConfigUrl, setCurrentConfigUrl] = useState<string>("");

  // Initialize theme
  const initialTheme = resolvedTheme || theme || "light";
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(initialTheme as "light" | "dark");

  // Handle mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialize particle engine once and set initial config
  useEffect(() => {
    if (!mounted) return;

    const initEngine = async () => {
      await initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
      setInit(true);

      // Set initial config after engine is initialized
      const theme = resolvedTheme as "light" | "dark" || currentTheme;
      const initialConfig = getRandomConfigUrl(theme);
      setCurrentConfigUrl(initialConfig);
    };

    initEngine();
  }, [mounted]); // Only run on mount

  // Update theme effect
  useEffect(() => {
    if (!mounted || !init || !resolvedTheme) return;
    
    const theme = resolvedTheme as "light" | "dark";
    if (theme !== currentTheme) {
      setCurrentTheme(theme);
      const newConfigUrl = getRandomConfigUrl(theme);
      setCurrentConfigUrl(newConfigUrl);
    }
  }, [resolvedTheme, init, mounted, currentTheme]);

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) {
      containerRef.current = container;
    }
  }, []);

  const handleConfigChange = useCallback((configUrl: string) => {
    setCurrentConfigUrl(configUrl);
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
    const theme = resolvedTheme as 'light' | 'dark' || currentTheme;
    const newConfigUrl = getRandomConfigUrl(theme);
    setCurrentConfigUrl(newConfigUrl);
  }, [resolvedTheme, currentTheme]);

  if (!mounted || !init) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 -z-10"
      >
        {currentConfigUrl && (
          <Particles
            id={`tsparticles-${currentConfigUrl}`}
            className="absolute inset-0"
            url={currentConfigUrl}
            particlesLoaded={particlesLoaded}
          />
        )}
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
