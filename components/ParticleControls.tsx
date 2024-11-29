"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Settings, Play, Pause, RefreshCw } from "lucide-react";
import { getAllConfigUrls } from "./particles/particlesConfig";

interface ParticleControlsProps {
  onConfigChange: (configUrl: string) => void;
  onPause: () => void;
  onResume: () => void;
  onRefresh: () => void;
  isPaused: boolean;
  theme: "light" | "dark";
  currentConfigUrl: string;
}

export default function ParticleControls({
  onConfigChange,
  onPause,
  onResume,
  onRefresh,
  isPaused,
  theme,
  currentConfigUrl,
}: ParticleControlsProps) {
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
    "hover:shadow-xl"
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
        <div className="flex flex-col gap-2">
          {configs.map((config) => (
            <button
              key={config.url}
              onClick={() => onConfigChange(config.url)}
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
                config.url === currentConfigUrl && "bg-slate-200/70 dark:bg-slate-700/70"
              )}
            >
              {config.url.split("/").pop()?.split(".")[0]}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="flex gap-2">
        {/* Control buttons using buttonBaseStyles */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={buttonBaseStyles}
        >
          <Settings className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isPaused ? onResume : onPause}
          className={buttonBaseStyles}
        >
          {isPaused ? (
            <Play className="w-5 h-5" />
          ) : (
            <Pause className="w-5 h-5" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRefresh}
          className={buttonBaseStyles}
        >
          <RefreshCw className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
