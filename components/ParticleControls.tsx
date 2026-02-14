"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { cn } from "@/lib/utils";
import { Settings, Play, Pause, RefreshCw } from "lucide-react";
import { getAllConfigUrls } from "./particles/particlesConfig";

export type DensityLevel = 'full' | 'reduced' | 'off';

interface ParticleControlsProps {
  onConfigChange: (configUrl: string) => void;
  onPause: () => void;
  onResume: () => void;
  onRefresh: () => void;
  isPaused: boolean;
  theme: "light" | "dark";
  currentConfigUrl: string;
  density: DensityLevel;
  onDensityChange: (density: DensityLevel) => void;
}

export default function ParticleControls({
  onConfigChange,
  onPause,
  onResume,
  onRefresh,
  isPaused,
  theme,
  currentConfigUrl,
  density,
  onDensityChange,
}: ParticleControlsProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const configs = useMemo(() => getAllConfigUrls(theme), [theme]);

  useEffect(() => {
    if (!configs.find((config) => config.url === currentConfigUrl)) {
      const firstConfig = configs[0]?.url;
      if (firstConfig) {
        onConfigChange(firstConfig);
      }
    }
  }, [configs, currentConfigUrl, onConfigChange]);

  const buttonBaseStyles = cn(
    "p-2 rounded-full",
    "backdrop-blur-md",
    "transition-all duration-300",
    // Light mode
    "bg-white/80 hover:bg-white/90",
    "border border-slate-200",
    "text-slate-600 hover:text-slate-900",
    // Dark mode
    "dark:bg-slate-800/80 dark:hover:bg-slate-800/90",
    "dark:border-slate-700",
    "dark:text-slate-300 dark:hover:text-slate-100",
    // Shadows
    "shadow-lg",
    "hover:shadow-xl",
    // Focus styles
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  );

  const menuBaseStyles = cn(
    "backdrop-blur-md rounded-lg p-2",
    // Light mode
    "bg-white/80",
    "border border-slate-200",
    // Dark mode
    "dark:bg-slate-800/80",
    "dark:border-slate-700",
    // Transitions
    "transition-all duration-300"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
    >
      <motion.div
        className={cn(
          menuBaseStyles,
          isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
      >
        <div className="flex flex-col gap-3">
          {/* Density Controls */}
          <div className="flex flex-col gap-1">
            <span className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Density
            </span>
            <div className="flex gap-1">
              {(['full', 'reduced', 'off'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => onDensityChange(level)}
                  aria-label={`Set particle density to ${level}`}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-md text-xs font-medium capitalize",
                    "transition-all duration-200",
                    // Light mode
                    "text-slate-600 hover:text-slate-900",
                    "hover:bg-slate-200/50",
                    // Dark mode
                    "dark:text-slate-300 dark:hover:text-slate-100",
                    "dark:hover:bg-slate-700/50",
                    // Active state
                    density === level && [
                      "bg-slate-200/70 dark:bg-slate-700/70",
                      "ring-2 ring-slate-400 dark:ring-slate-500"
                    ],
                    // Focus styles
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200 dark:bg-slate-700" />

          {/* Config Selection */}
          <div className="flex flex-col gap-1">
            <span className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Style
            </span>
            {configs.map((config) => {
              const configName = config.url.split("/").pop()?.split(".")[0] || 'config';
              return (
                <button
                  key={config.url}
                  onClick={() => onConfigChange(config.url)}
                  aria-label={`Switch to ${configName} particles`}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium",
                    "transition-colors duration-200",
                    // Light mode
                    "text-slate-600 hover:text-slate-900",
                    "hover:bg-slate-200/50",
                    // Dark mode
                    "dark:text-slate-300 dark:hover:text-slate-100",
                    "dark:hover:bg-slate-700/50",
                    // Active state
                    config.url === currentConfigUrl && "bg-slate-200/70 dark:bg-slate-700/70",
                    // Focus styles
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                >
                  {configName}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="flex gap-2">
        {/* Control buttons using buttonBaseStyles */}
        <motion.button
          whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close particle settings" : "Open particle settings"}
          className={buttonBaseStyles}
        >
          <Settings className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
          onClick={isPaused ? onResume : onPause}
          aria-label={isPaused ? "Resume particles" : "Pause particles"}
          className={buttonBaseStyles}
        >
          {isPaused ? (
            <Play className="w-5 h-5" />
          ) : (
            <Pause className="w-5 h-5" />
          )}
        </motion.button>

        <motion.button
          whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
          onClick={onRefresh}
          aria-label="Refresh particle animation"
          className={buttonBaseStyles}
        >
          <RefreshCw className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
