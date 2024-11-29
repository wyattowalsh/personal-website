"use client";

import { useState } from "react";
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
  const configs = getAllConfigUrls(theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "flex flex-col items-end gap-2"
      )}
    >
      <motion.div
        className={cn(
          "bg-background/80 dark:bg-background/60",
          "backdrop-blur-md rounded-lg p-2",
          "border border-primary/10 dark:border-primary/20",
          "shadow-lg",
          "transition-all duration-300",
          isOpen ? "translate-y-0" : "translate-y-full opacity-0"
        )}
      >
        <div className="flex flex-col gap-2">
          {configs.map((config) => (
            <button
              key={config.url}
              onClick={() => onConfigChange(config.url)}
              className={cn(
                "px-4 py-2 rounded-md",
                "text-sm font-medium",
                "transition-colors duration-200",
                "hover:bg-primary/10 dark:hover:bg-primary/20",
                config.url === currentConfigUrl && "bg-primary/20 dark:bg-primary/30"
              )}
            >
              {config.url.split("/").pop()?.split(".")[0]}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "p-2 rounded-full",
            "bg-background/80 dark:bg-background/60",
            "backdrop-blur-md",
            "border border-primary/10 dark:border-primary/20",
            "shadow-lg",
            "transition-colors duration-200",
            "hover:bg-primary/10 dark:hover:bg-primary/20"
          )}
        >
          <Settings className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isPaused ? onResume : onPause}
          className={cn(
            "p-2 rounded-full",
            "bg-background/80 dark:bg-background/60",
            "backdrop-blur-md",
            "border border-primary/10 dark:border-primary/20",
            "shadow-lg",
            "transition-colors duration-200",
            "hover:bg-primary/10 dark:hover:bg-primary/20"
          )}
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
          className={cn(
            "p-2 rounded-full",
            "bg-background/80 dark:bg-background/60",
            "backdrop-blur-md",
            "border border-primary/10 dark:border-primary/20",
            "shadow-lg",
            "transition-colors duration-200",
            "hover:bg-primary/10 dark:hover:bg-primary/20"
          )}
        >
          <RefreshCw className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
