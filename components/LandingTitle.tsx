"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { cn } from "@/lib/utils";
import styles from '../app/page.module.scss';

const WORDS = [
    "cybernetic architect",
    "data sorcerer",
    "automation virtuoso",
    "systems alchemist",
    "digital sculptor",
    "intelligence artisan",
    "technological conjurer",
    "cloud shaper",
    "quantum designer",
    "innovation mystic",
    "experience crafter",
    "code architect",
    "workflow mage",
    "platform visionary",
    "algorithm weaver",
    "cyber defense artisan",
    "augmented reality sculptor",
    "machine learning designer",
    "blockchain artisan",
    "edge systems crafter",
    "robotics artist",
    "knowledge craftsman",
    "resilience sculptor",
    "ecosystem designer",
    "systems dreamer",
    "digital futurist",
    "information sculptor",
    "zero trust architect",
    "AI cartographer",
    "intelligent systems artist",
    "distributed systems alchemist",
    "technological mapper",
    "behavioral designer",
    "synthetic intelligence architect",
    "scalability artist",
    "process designer",
    "cybersecurity artisan",
    "data orchestrator",
    "future systems crafter",
    "quantum systems designer",
    "enterprise dreamer",
    "experience sculptor",
    "adaptive systems designer",
    "code alchemist"
] as const;

const ANIMATION_INTERVAL = 3000;

export default function LandingTitle() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [wordIndex, setWordIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Scroll-based animations
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]);

  // Word rotation effect - disabled when reduced motion is preferred
  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      setWordIndex(prev => (prev + 1) % WORDS.length);
    }, ANIMATION_INTERVAL);
    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale }}
      className={cn(
        "relative z-10",
        // Reduced padding
        "py-1 sm:py-2 md:py-4 lg:py-6", // Further reduced
        "px-2 sm:px-4 md:px-6 lg:px-8",
        // Base styles
        "flex flex-col items-center",
        // Theme-aware background
        "bg-gradient-to-br",
        "from-background/50 via-background/30 to-background/20",
        "dark:from-background/30 dark:via-background/20 dark:to-background/10",
        // Enhanced blur and border
        "backdrop-blur-lg",
        "border-y border-primary/10",
        "dark:border-primary/20",
        // Improved shadows
        "shadow-xl shadow-primary/5",
        "dark:shadow-primary/10",
        // Smooth transitions
        "transition-colors duration-300"
      )}
    >
      <h1
        className={cn(
          // Base styles
          "relative font-extrabold tracking-tight leading-none select-none cursor-default text-center",
          // Adjusted responsive sizes
          "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
          // Enhanced gradient effect
          "bg-clip-text text-transparent",
          "bg-gradient-to-r",
          "from-blue-600 via-purple-600 to-pink-600",
          "dark:from-blue-400 dark:via-purple-400 dark:to-pink-400",
          // Simpler hover effect without perspective
          "hover:scale-102 transition-all duration-500",
          // Enhanced shadow
          "drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]",
          "dark:drop-shadow-[0_0_15px_rgba(147,197,253,0.3)]",
          // Custom gradient animation class
          styles.enhancedTitleLanding
        )}
      >
        Wyatt Walsh
      </h1>

      {prefersReducedMotion ? (
        <div className="subtitle-container w-full max-w-[85vw] sm:max-w-2xl px-2 sm:px-0 mt-1 sm:mt-2">
          <p
            className={cn(
              "mt-2 sm:mt-3",
              "text-lg sm:text-xl md:text-2xl lg:text-3xl",
              "font-light text-center leading-relaxed tracking-wide",
              "bg-gradient-to-r bg-clip-text text-transparent",
              "from-blue-500/90 via-purple-500/90 to-pink-500/90",
              "dark:from-blue-300/90 dark:via-purple-300/90 dark:to-pink-300/90",
              "transition-all duration-300 ease-out"
            )}
          >
            {WORDS[0]}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            // Reduced gap between title and subtitle
            className="subtitle-container w-full max-w-[85vw] sm:max-w-2xl px-2 sm:px-0 mt-1 sm:mt-2"
          >
            <motion.p
              className={cn(
                // Reduced top margin
                "mt-2 sm:mt-3",
                // Rest of text styles
                "text-lg sm:text-xl md:text-2xl lg:text-3xl",
                "font-light text-center leading-relaxed tracking-wide",
                // Enhanced gradient
                "bg-gradient-to-r bg-clip-text text-transparent",
                "from-blue-500/90 via-purple-500/90 to-pink-500/90",
                "dark:from-blue-300/90 dark:via-purple-300/90 dark:to-pink-300/90",
                "transition-all duration-300 ease-out"
              )}
              data-text={WORDS[wordIndex]}
            >
              {WORDS[wordIndex]}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Theme-aware decorative elements */}
      <div className={cn(
        "cyber-grid absolute inset-0",
        "opacity-5 dark:opacity-10",
        "transition-opacity duration-300"
      )} />
      <div className={cn(
        "glitch-scanlines absolute inset-0",
        "pointer-events-none",
        "opacity-[0.015] dark:opacity-[0.03]",
        "transition-opacity duration-300"
      )} />
    </motion.div>
  );
}
