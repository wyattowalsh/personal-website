"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

// Helper function to determine if a color is dark
function isColorDark(color: string): boolean {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    // Calculate relative luminance
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }
  return false;
}

// Helper function to adjust color brightness
function adjustColorForTheme(color: string, isDarkMode: boolean): string {
  if (!color || color.startsWith('var(--')) return color;
  
  const isColorDarkShade = isColorDark(color);
  
  // Adjust colors for dark mode
  if (isDarkMode && isColorDarkShade) {
    // Lighten dark colors in dark mode
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Increase brightness by 60%
    const factor = 1.6;
    const newR = Math.min(255, Math.round(r * factor));
    const newG = Math.min(255, Math.round(g * factor));
    const newB = Math.min(255, Math.round(b * factor));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  
  // Adjust colors for light mode
  if (!isDarkMode && !isColorDarkShade) {
    // Darken light colors in light mode
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Decrease brightness by 40%
    const factor = 0.6;
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  
  return color;
}

interface SocialLinkProps {
  link: {
    name: string;
    url: string;
    icon: IconProp;
    color?: string;
  };
}

export default function SocialLink({ link }: SocialLinkProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isInternalLink = link.url.startsWith("/");
  const isDark = theme === "dark";
  
  // Adaptive color handling with brightness adjustment
  const baseColor = link.color || "var(--primary)";
  const linkColor = adjustColorForTheme(baseColor, isDark);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  // Enhanced gradient effect
  const background = useMotionTemplate`
    radial-gradient(
      800px circle at ${mouseX}px ${mouseY}px,
      ${isDark ? `${linkColor}15` : `${linkColor}20`} 0%,
      transparent 60%
    )
  `;

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const containerVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  const iconVariants = {
    initial: { rotate: 0 },
    hover: { 
      rotate: [0, -10, 10, 0],
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    }
  };

  const content = (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      className={cn(
        // Base layout
        "group relative flex flex-col items-center justify-center",
        "w-full h-full p-3 sm:p-4 md:p-5 lg:p-6",
        "gap-2 sm:gap-3 md:gap-4",
        
        // Card styling
        "rounded-xl overflow-hidden",
        "bg-gradient-to-br",
        "from-white/40 to-white/20",
        "dark:from-gray-800/40 dark:to-gray-800/20",
        
        // Glass effect
        "backdrop-blur-md",
        "border border-white/10",
        "dark:border-gray-700/30",
        
        // Shadows and glow
        "shadow-lg shadow-black/5",
        "dark:shadow-lg dark:shadow-black/20",
        "hover:shadow-xl hover:shadow-[${linkColor}]/10",
        "dark:hover:shadow-xl dark:hover:shadow-[${linkColor}]/20",
        
        // Transitions
        "transition-all duration-300 ease-out"
      )}
      style={{ background }}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        variants={iconVariants}
        className="relative"
      >
        <FontAwesomeIcon
          icon={link.icon}
          className={cn(
            // Icon sizing
            "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
            // Transitions
            "transition-all duration-300",
            // Hover effects
            "group-hover:scale-110",
            // Ensure contrast in dark mode
            isDark && baseColor === "#000000" ? "text-white" : "",
            // Add glow effect
            "drop-shadow-sm",
            "group-hover:drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
          )}
          style={{ color: linkColor }}
        />
      </motion.div>

      <span
        className={cn(
          // Text styling
          "text-sm sm:text-base md:text-lg",
          "font-medium text-center",
          // Colors
          "text-gray-800 dark:text-gray-200",
          // Transitions
          "transition-colors duration-300",
          // Hover state
          "group-hover:text-[${linkColor}]",
          "dark:group-hover:text-[${linkColor}]"
        )}
      >
        {link.name}
      </span>
    </motion.div>
  );

  if (isInternalLink) {
    return (
      <Link
        href={link.url}
        className={cn(
          "block w-full h-full",
          "focus:outline-none focus:ring-2",
          "focus:ring-[${linkColor}]/50",
          "rounded-xl"
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block w-full h-full",
        "focus:outline-none focus:ring-2",
        "focus:ring-[${linkColor}]/50",
        "rounded-xl"
      )}
    >
      {content}
    </a>
  );
}