"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface ThemeColors {
  // Background
  bgStart: string;
  bgMid: string;
  bgEnd: string;
  // Glows
  glowA: string;
  glowB: string;
  glowAOpacity?: number;
  glowBOpacity?: number;
  // Rings/accents
  ringStart: string;
  ringMid: string;
  ringEnd: string;
  ring2Start: string;
  ring2End: string;
  // Elements
  trail: string;
  grid: string;
  gridOpacity?: number;
  // Nodes
  node1: string;
  node2: string;
  node3: string;
  node4: string;
  nodeCenter: string;
  // Client block
  clientBg: string;
  clientBorder: string;
  clientBar: string;
  // Markers
  arrow: string;
}

export interface HeroConfig {
  dark: ThemeColors;
  light: ThemeColors;
}

// Default ProxyWhirl configuration
export const proxyWhirlConfig: HeroConfig = {
  dark: {
    bgStart: "#05070f",
    bgMid: "#0b1226",
    bgEnd: "#0a0f1f",
    glowA: "#22d3ee",
    glowB: "#a78bfa",
    glowAOpacity: 0.45,
    glowBOpacity: 0.35,
    ringStart: "#38bdf8",
    ringMid: "#818cf8",
    ringEnd: "#22d3ee",
    ring2Start: "#a78bfa",
    ring2End: "#60a5fa",
    trail: "#22d3ee",
    grid: "#111827",
    gridOpacity: 0.25,
    node1: "#22d3ee",
    node2: "#a78bfa",
    node3: "#60a5fa",
    node4: "#38bdf8",
    nodeCenter: "#e2e8f0",
    clientBg: "#0f172a",
    clientBorder: "#1f2937",
    clientBar: "#1f2937",
    arrow: "#38bdf8",
  },
  light: {
    bgStart: "#f8fafc",
    bgMid: "#f1f5f9",
    bgEnd: "#e2e8f0",
    glowA: "#0891b2",
    glowB: "#7c3aed",
    glowAOpacity: 0.35,
    glowBOpacity: 0.25,
    ringStart: "#0ea5e9",
    ringMid: "#6366f1",
    ringEnd: "#06b6d4",
    ring2Start: "#8b5cf6",
    ring2End: "#3b82f6",
    trail: "#0891b2",
    grid: "#cbd5e1",
    gridOpacity: 0.4,
    node1: "#0891b2",
    node2: "#7c3aed",
    node3: "#3b82f6",
    node4: "#0ea5e9",
    nodeCenter: "#1e293b",
    clientBg: "#ffffff",
    clientBorder: "#e2e8f0",
    clientBar: "#e2e8f0",
    arrow: "#0ea5e9",
  },
};

// Riso configuration - retro copier vibes with warm/cool contrast
export const risoConfig: HeroConfig = {
  dark: {
    bgStart: "#0a0a0f",
    bgMid: "#12121a",
    bgEnd: "#0d0d14",
    glowA: "#f97316",      // Orange glow (riso ink)
    glowB: "#06b6d4",      // Cyan glow (riso ink)
    glowAOpacity: 0.4,
    glowBOpacity: 0.35,
    ringStart: "#f97316",  // Orange
    ringMid: "#ec4899",    // Pink (riso pink)
    ringEnd: "#06b6d4",    // Cyan
    ring2Start: "#84cc16", // Lime (riso green)
    ring2End: "#f97316",   // Orange
    trail: "#06b6d4",
    grid: "#1f1f2e",
    gridOpacity: 0.3,
    node1: "#f97316",      // Orange
    node2: "#ec4899",      // Pink
    node3: "#06b6d4",      // Cyan
    node4: "#84cc16",      // Lime
    nodeCenter: "#fafafa",
    clientBg: "#18181b",
    clientBorder: "#27272a",
    clientBar: "#3f3f46",
    arrow: "#f97316",
  },
  light: {
    bgStart: "#fefce8",    // Warm cream (like riso paper)
    bgMid: "#fef9c3",
    bgEnd: "#fef3c7",
    glowA: "#ea580c",
    glowB: "#0891b2",
    glowAOpacity: 0.3,
    glowBOpacity: 0.25,
    ringStart: "#ea580c",
    ringMid: "#db2777",
    ringEnd: "#0891b2",
    ring2Start: "#65a30d",
    ring2End: "#ea580c",
    trail: "#0891b2",
    grid: "#fde047",
    gridOpacity: 0.5,
    node1: "#ea580c",
    node2: "#db2777",
    node3: "#0891b2",
    node4: "#65a30d",
    nodeCenter: "#18181b",
    clientBg: "#fffbeb",
    clientBorder: "#fde68a",
    clientBar: "#fcd34d",
    arrow: "#ea580c",
  },
};

// Registry of hero configs by image path
const heroConfigs: Record<string, HeroConfig> = {
  "/proxywhirl-hero.svg": proxyWhirlConfig,
  "/riso-hero.svg": risoConfig,
};

export function getHeroConfig(imagePath: string): HeroConfig | null {
  return heroConfigs[imagePath] || null;
}

export function isThemedHero(imagePath: string): boolean {
  return imagePath in heroConfigs;
}

interface ThemeAwareHeroProps {
  config: HeroConfig;
  className?: string;
  onLoad?: () => void;
}

export default function ThemeAwareHero({ config, className, onLoad }: ThemeAwareHeroProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Generate unique IDs to avoid conflicts if multiple heroes on page - must be before any early returns
  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), []);

  useEffect(() => {
    setMounted(true);
    onLoad?.();
  }, [onLoad]);

  const colors = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    return isDark ? config.dark : config.light;
  }, [resolvedTheme, config]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn("w-full h-full", className)}
        style={{ aspectRatio: "1200/630", background: config.dark.bgMid }}
      />
    );
  }

  return (
    <svg
      width="1200"
      height="630"
      viewBox="0 0 1200 630"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full object-cover", className)}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={colors.bgStart} />
          <stop offset="0.5" stopColor={colors.bgMid} />
          <stop offset="1" stopColor={colors.bgEnd} />
        </linearGradient>
        <radialGradient
          id={`glowA-${uid}`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(900 180) rotate(90) scale(240 360)"
        >
          <stop offset="0" stopColor={colors.glowA} stopOpacity={colors.glowAOpacity ?? 0.45} />
          <stop offset="1" stopColor={colors.glowA} stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id={`glowB-${uid}`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(300 470) rotate(90) scale(200 300)"
        >
          <stop offset="0" stopColor={colors.glowB} stopOpacity={colors.glowBOpacity ?? 0.35} />
          <stop offset="1" stopColor={colors.glowB} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`ring-${uid}`} x1="360" y1="90" x2="1040" y2="560" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={colors.ringStart} />
          <stop offset="0.5" stopColor={colors.ringMid} />
          <stop offset="1" stopColor={colors.ringEnd} />
        </linearGradient>
        <linearGradient id={`ring2-${uid}`} x1="300" y1="40" x2="1100" y2="600" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={colors.ring2Start} />
          <stop offset="1" stopColor={colors.ring2End} />
        </linearGradient>
        <linearGradient id={`trail-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={colors.trail} stopOpacity="0" />
          <stop offset="0.2" stopColor={colors.trail} stopOpacity="0.6" />
          <stop offset="1" stopColor={colors.trail} stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker
          id={`arrow-${uid}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0L10 5L0 10Z" fill={colors.arrow} />
        </marker>
      </defs>

      {/* Background */}
      <rect width="1200" height="630" fill={`url(#bg-${uid})`} />
      <rect width="1200" height="630" fill={`url(#glowA-${uid})`} />
      <rect width="1200" height="630" fill={`url(#glowB-${uid})`} />

      {/* Grid */}
      <g opacity={colors.gridOpacity ?? 0.25}>
        <path
          d="M80 110H1120M80 200H1120M80 290H1120M80 380H1120M80 470H1120"
          stroke={colors.grid}
          strokeWidth="1"
        />
        <path
          d="M170 60V570M330 60V570M490 60V570M650 60V570M810 60V570M970 60V570M1130 60V570"
          stroke={colors.grid}
          strokeWidth="1"
        />
      </g>

      {/* Swirl rings */}
      <g transform="translate(0 5)">
        <circle
          cx="835"
          cy="320"
          r="220"
          stroke={`url(#ring-${uid})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="32 18"
        />
        <circle
          cx="835"
          cy="320"
          r="170"
          stroke={`url(#ring2-${uid})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="18 14"
        />
        <circle
          cx="835"
          cy="320"
          r="120"
          stroke={colors.ringStart}
          strokeOpacity="0.55"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="10 12"
        />
      </g>

      {/* Proxy nodes */}
      <g filter={`url(#glow-${uid})`}>
        <circle cx="760" cy="240" r="8" fill={colors.node1} />
        <circle cx="920" cy="240" r="7" fill={colors.node2} />
        <circle cx="945" cy="390" r="8" fill={colors.node3} />
        <circle cx="740" cy="390" r="7" fill={colors.node4} />
        <circle cx="835" cy="320" r="9" fill={colors.nodeCenter} />
      </g>

      {/* Traffic trails */}
      <g opacity="0.9">
        <path
          d="M360 360C520 360 640 320 760 240"
          stroke={`url(#trail-${uid})`}
          strokeWidth="3"
          markerEnd={`url(#arrow-${uid})`}
        />
        <path
          d="M360 300C520 300 650 320 835 320"
          stroke={`url(#trail-${uid})`}
          strokeWidth="3"
          markerEnd={`url(#arrow-${uid})`}
        />
        <path
          d="M360 420C520 420 650 410 740 390"
          stroke={`url(#trail-${uid})`}
          strokeWidth="3"
          markerEnd={`url(#arrow-${uid})`}
        />
      </g>

      {/* Left system block (client) */}
      <g>
        <rect x="120" y="210" width="200" height="180" rx="16" fill={colors.clientBg} stroke={colors.clientBorder} />
        <rect x="145" y="240" width="150" height="18" rx="9" fill={colors.clientBar} />
        <rect x="145" y="270" width="120" height="12" rx="6" fill={colors.clientBar} />
        <rect x="145" y="292" width="150" height="12" rx="6" fill={colors.clientBar} />
        <rect x="145" y="314" width="96" height="12" rx="6" fill={colors.clientBar} />
        <rect x="145" y="336" width="132" height="12" rx="6" fill={colors.clientBar} />
      </g>
    </svg>
  );
}
