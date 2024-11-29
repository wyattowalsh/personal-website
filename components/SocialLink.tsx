"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";
import { useTheme } from "next-themes";

interface SocialLinkProps {
  link: {
    name: string;
    url: string;
    icon: IconProp;
    color?: string;
  };
}

// Improved luminance calculation with gamma correction
function getLuminance(hexColor: string): number {
  const rgb = hexColor.replace('#', '').match(/.{2}/g);
  if (!rgb) return 0;
  
  // Convert to sRGB
  const [r, g, b] = rgb.map(x => {
    const channel = parseInt(x, 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  
  // Use perceived luminance weights
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRGB(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

// Enhanced color manipulation functions
function enhanceColor(hex: string, amount: number): string {
  const rgb = hex.replace('#', '').match(/.{2}/g);
  if (!rgb) return hex;
  
  const [r, g, b] = rgb.map(x => parseInt(x, 16));
  const enhanceChannel = (c: number) => {
    const saturationBoost = Math.floor(c * amount);
    return Math.min(255, Math.max(0, c + saturationBoost));
  };
  
  const rr = enhanceChannel(r).toString(16).padStart(2, '0');
  const gg = enhanceChannel(g).toString(16).padStart(2, '0');
  const bb = enhanceChannel(b).toString(16).padStart(2, '0');
  
  return `#${rr}${gg}${bb}`;
}

function lightenColor(hex: string, amount: number): string {
  const rgb = hex.replace('#', '').match(/.{2}/g);
  if (!rgb) return hex;
  
  const [r, g, b] = rgb.map(x => parseInt(x, 16));
  const lightenChannel = (c: number) => {
    const increment = Math.floor((255 - c) * amount);
    // Add smoothing to prevent harsh transitions
    return Math.min(255, c + increment);
  };
  
  const rr = lightenChannel(r).toString(16).padStart(2, '0');
  const gg = lightenChannel(g).toString(16).padStart(2, '0');
  const bb = lightenChannel(b).toString(16).padStart(2, '0');
  
  return `#${rr}${gg}${bb}`;
}

function darkenColor(hex: string, amount: number): string {
  const rgb = hex.replace('#', '').match(/.{2}/g);
  if (!rgb) return hex;
  
  const [r, g, b] = rgb.map(x => parseInt(x, 16));
  const darkenChannel = (c: number) => {
    const decrement = Math.floor(c * amount);
    // Add smoothing to prevent harsh transitions
    return Math.max(0, c - decrement);
  };
  
  const rr = darkenChannel(r).toString(16).padStart(2, '0');
  const gg = darkenChannel(g).toString(16).padStart(2, '0');
  const bb = darkenChannel(b).toString(16).padStart(2, '0');
  
  return `#${rr}${gg}${bb}`;
}

// Enhanced color adjustment functions
function adjustColorForMode(color: string, isDark: boolean) {
  const DEFAULT_COLOR = "#6a9fb5";
  const baseColor = color || DEFAULT_COLOR;
  const luminance = getLuminance(baseColor);

  // Enhanced color adjustment for both modes
  const darkModeAdjustment = {
    // For dark mode, make dark colors lighter and keep light colors relatively unchanged
    iconColor: luminance < 0.5
      ? lightenColor(baseColor, 0.8)  // Significantly lighten dark colors
      : luminance < 0.7
        ? lightenColor(baseColor, 0.4) // Moderately lighten medium colors
        : baseColor,                   // Keep light colors as is
    bgStyle: `rgba(${hexToRGB(baseColor)}, 0.15)`,
    bgHoverStyle: `rgba(${hexToRGB(baseColor)}, 0.25)`,
    textColor: "#ffffff",
    iconBgColor: "rgba(255, 255, 255, 0.1)",
  };

  const lightModeAdjustment = {
    // For light mode, darken light colors and enhance dark colors
    iconColor: luminance > 0.7
      ? darkenColor(baseColor, 0.6)   // Significantly darken very light colors
      : luminance > 0.5
        ? darkenColor(baseColor, 0.3) // Moderately darken light colors
        : enhanceColor(baseColor, 0.2), // Slightly enhance dark colors
    bgStyle: `rgba(${hexToRGB(baseColor)}, 0.1)`,
    bgHoverStyle: `rgba(${hexToRGB(baseColor)}, 0.15)`,
    textColor: "#000000",
    iconBgColor: "rgba(255, 255, 255, 0.95)",
  };

  return isDark ? darkModeAdjustment : lightModeAdjustment;
}

export default function SocialLink({ link }: SocialLinkProps): JSX.Element {
  const isInternalLink = link.url.startsWith("/");

  // Motion values for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  // Dynamic gradient background
  const gradientBackground = useMotionTemplate`
    radial-gradient(
      600px circle at ${mouseX}px ${mouseY}px,
      var(--tw-gradient-stops)
    )
  `;

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Ensure default color from links array is used
  const colors = adjustColorForMode(link.color || "#6a9fb5", isDark);

  const linkContent = (
    <motion.div
      className={cn(
        // Base layout
        "group relative flex flex-col items-center justify-center",
        "w-full h-full p-4 md:p-6 lg:p-8",
        "rounded-2xl overflow-hidden",
        // Enhanced glass morphism
        "backdrop-blur-sm",
        "bg-white/5 dark:bg-black/20",
        "border border-black/5 dark:border-white/10",
        // Hover and animation
        "hover:scale-105 hover:-translate-y-1",
        "transition-all duration-500 ease-out",
        // Shadows
        "shadow-lg hover:shadow-xl",
        "shadow-black/5 dark:shadow-white/5"
      )}
      style={{
        '--hover-color': colors.bgHoverStyle,
      } as any}
      whileHover={{
        scale: 1.05,
        rotateX: 2,
        rotateY: 2,
      }}
    >
      {/* Icon Container with guaranteed contrast */}
      <motion.div
        className={cn(
          "relative flex items-center justify-center",
          "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24",
          "rounded-xl",
          // Enhanced contrast background
          "bg-white/95 dark:bg-white/10", // Add contrasting background
          "backdrop-blur-sm",
          // Border and shadow for depth
          "border border-black/5 dark:border-white/10",
          "shadow-lg dark:shadow-black/30",
          // Animations
          "transform-gpu transition-all duration-500",
          "group-hover:scale-110 group-hover:rotate-3",
          // Additional contrast
          "after:absolute after:inset-0 after:rounded-xl",
          "after:bg-white/50 dark:after:bg-black/20",
          "after:backdrop-blur-sm"
        )}
        style={{
          color: colors.iconColor,
          backgroundColor: colors.iconBgColor,
        }}
      >
        <FontAwesomeIcon
          icon={link.icon}
          className={cn(
            "relative z-10",
            "text-3xl md:text-4xl lg:text-5xl",
            "transition-all duration-500",
            // Enhanced visibility
            "drop-shadow-md dark:drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]",
            // Hover effects
            "group-hover:scale-110 group-hover:drop-shadow-lg",
          )}
          style={{ color: colors.iconColor }}
        />
      </motion.div>

      {/* Label */}
      <span
        className={cn(
          "mt-4 text-sm md:text-base lg:text-lg",
          "font-medium text-center",
          "transition-all duration-500",
          "group-hover:scale-105",
          // Ensure text contrast
          "text-gray-900 dark:text-white",
          "drop-shadow-sm dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
        )}
      >
        {link.name}
      </span>

      {/* Enhanced hover effect */}
      <motion.div
        className={cn(
          "absolute inset-0 -z-10",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-500",
          "pointer-events-none"
        )}
        style={{
          background: `radial-gradient(
            600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            var(--hover-color),
            transparent 40%
          )`,
        }}
      />
    </motion.div>
  );

  if (isInternalLink) {
    return (
      <Link href={link.url} className="block w-full h-full rounded-2xl">
        {linkContent}
      </Link>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full h-full rounded-2xl"
    >
      {linkContent}
    </a>
  );
}