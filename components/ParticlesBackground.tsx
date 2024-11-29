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
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  // Handle mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialize particle engine once
  useEffect(() => {
    if (!mounted) return;

    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, [mounted]);

  // Update theme and config when theme changes
  useEffect(() => {
    if (!mounted || !init) return;
    const theme = resolvedTheme as "light" | "dark";
    if (!theme) return;
    setCurrentTheme(theme);
    const newConfigUrl = getRandomConfigUrl(theme);
    setCurrentConfigUrl(newConfigUrl);
  }, [resolvedTheme, init, mounted]);

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
    const currentTheme = resolvedTheme as 'light' | 'dark';
    const newConfigUrl = getRandomConfigUrl(currentTheme);
    setCurrentConfigUrl(newConfigUrl);
  }, [resolvedTheme]);

  if (!mounted || !init || !currentConfigUrl) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 -z-10"
      >
        <Particles
          id={`tsparticles-${currentConfigUrl}`}
          className="absolute inset-0"
          url={currentConfigUrl}
          particlesLoaded={particlesLoaded}
        />
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
