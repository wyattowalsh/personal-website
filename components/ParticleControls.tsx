"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { cn } from "@/lib/utils";
import { Settings, Play, Pause, RefreshCw } from "lucide-react";
import type { ParticleFamily, ParticlePreset } from "./particles/types";

export type DensityLevel = 'full' | 'reduced' | 'off';

interface ParticleControlsProps {
  onConfigChange: (presetId: string) => void;
  onPause: () => void;
  onResume: () => void;
  onRefresh: () => void;
  isPaused: boolean;
  presets: readonly ParticlePreset[];
  currentPresetId: string;
  density: DensityLevel;
  onDensityChange: (density: DensityLevel) => void;
  canPause: boolean;
}

const FAMILY_LABELS: Record<ParticleFamily, string> = {
  technical: 'Technical',
  atmospheric: 'Atmospheric',
  organic: 'Organic',
  cosmic: 'Cosmic',
  playful: 'Playful',
};

export function ParticleControls({
  onConfigChange,
  onPause,
  onResume,
  onRefresh,
  isPaused,
  presets,
  currentPresetId,
  density,
  onDensityChange,
  canPause,
}: ParticleControlsProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const groupedPresets = useMemo(() => {
    const groups = new Map<ParticleFamily, ParticlePreset[]>();

    for (const preset of presets) {
      const existing = groups.get(preset.family);
      if (existing) {
        existing.push(preset);
      } else {
        groups.set(preset.family, [preset]);
      }
    }

    return Array.from(groups.entries());
  }, [presets]);
  const currentPreset = useMemo(
    () => presets.find((preset) => preset.id === currentPresetId),
    [currentPresetId, presets],
  );

  // Close panel on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

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
    "max-h-[70vh] w-80 overflow-y-auto backdrop-blur-md rounded-2xl p-3",
    // Light mode
    "bg-white/80",
    "border border-slate-200",
    // Dark mode
    "dark:bg-slate-800/80",
    "dark:border-slate-700",
    // Transitions
    "transition-all duration-300"
  );

  const iconButtonStyles = (disabled = false) => cn(
    buttonBaseStyles,
    disabled && "cursor-not-allowed opacity-50 hover:scale-100 hover:shadow-lg"
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
        <div className="flex flex-col gap-4">
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
          <div className="flex flex-col gap-2">
            <span className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Styles
            </span>

            {groupedPresets.map(([family, familyPresets]) => (
              <div key={family} className="flex flex-col gap-1.5">
                <span className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  {FAMILY_LABELS[family]}
                </span>

                {familyPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onConfigChange(preset.id)}
                    aria-label={`Switch to ${preset.label}`}
                    className={cn(
                      "rounded-xl px-3 py-2 text-left transition-all duration-200",
                      "border border-transparent",
                      "hover:bg-slate-200/50 hover:text-slate-900",
                      "dark:hover:bg-slate-700/50 dark:hover:text-slate-100",
                      currentPresetId === preset.id && [
                        "bg-slate-200/70 dark:bg-slate-700/70",
                        "border-slate-300/70 dark:border-slate-600/70",
                      ],
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                  >
                    <span className="block text-sm font-semibold text-slate-700 dark:text-slate-100">
                      {preset.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                      {preset.mood} · {preset.description}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {currentPreset ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "max-w-52 rounded-full border px-3 py-1.5 text-right shadow-lg backdrop-blur-md",
            "bg-white/80 border-slate-200 text-slate-700",
            "dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200",
          )}
        >
          <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            {FAMILY_LABELS[currentPreset.family]}
          </span>
          <span className="block text-sm font-semibold leading-tight">
            {currentPreset.label}
          </span>
        </motion.div>
      ) : null}

      <div className="flex gap-2">
        {/* Control buttons using buttonBaseStyles */}
        <motion.button
          whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close particle settings" : "Open particle settings"}
          aria-expanded={isOpen}
          className={iconButtonStyles()}
        >
          <Settings className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
          onClick={canPause ? (isPaused ? onResume : onPause) : undefined}
          aria-label={isPaused ? "Resume particles" : "Pause particles"}
          disabled={!canPause}
          className={iconButtonStyles(!canPause)}
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
          aria-label="Shuffle particle style"
          className={iconButtonStyles()}
        >
          <RefreshCw className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
