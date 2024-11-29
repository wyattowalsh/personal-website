"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const ref = useRef<HTMLDivElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Scroll-based animations
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]);
  
  // Word rotation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex(prev => (prev + 1) % WORDS.length);
    }, ANIMATION_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
	ref={ref}
	style={{ opacity, scale }}
	className={cn(
		// Base styles
		"relative z-10",
		// Responsive padding (further reduced)
		"py-2 sm:py-4 md:py-6 lg:py-8",  // Reduced from py-4/6/8/12
   		"px-4 sm:px-6 md:px-8 lg:px-10",
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
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          // Responsive typography
          "relative text-4xl sm:text-5xl md:text-7xl lg:text-8xl",
          "font-bold tracking-tight leading-none py-2",
          // Gradient text
          "bg-gradient-to-r",
          "from-blue-600 via-purple-600 to-pink-600",
          "dark:from-blue-400 dark:via-purple-400 dark:to-pink-400",
          "bg-clip-text text-transparent",
          // Hover effects
          "transition-all duration-700",
          "hover:scale-[1.02]",
          "cursor-default select-none",
          // Glow effects
          "animate-title-glow",
          "[text-shadow:0_0_30px_var(--primary-rgb,0,0,0,0.2)]",
          "dark:[text-shadow:0_0_30px_var(--primary-rgb,255,255,255,0.2)]"
        )}
        data-text="Wyatt Walsh"
      >
        Wyatt Walsh
      </motion.h1>

      <AnimatePresence mode="wait">
        <motion.div
          key={wordIndex}
          className={cn(
            "subtitle-container",
            "w-full max-w-[90vw] sm:max-w-2xl",
            "perspective-1000",
            "px-4 sm:px-0"
          )}
        >
          <motion.p
            className={cn(
              // Responsive text
              "mt-4 sm:mt-6",
              "text-xl sm:text-2xl md:text-3xl",
              "font-light text-center",
              // Theme-aware styling
              "bg-gradient-to-r",
              "from-blue-500/90 via-purple-500/90 to-pink-500/90",
              "dark:from-blue-300/90 dark:via-purple-300/90 dark:to-pink-300/90",
              "bg-clip-text text-transparent",
              // Animation classes
              "glitch-text",
              "transition-colors duration-300"
            )}
            data-text={WORDS[wordIndex]}
          >
            {WORDS[wordIndex]}
          </motion.p>
        </motion.div>
      </AnimatePresence>

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
