"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface RisoColors {
  bg: string;
  bgGradient: string;
  paper: string;
  paperShadow: string;
  paperEdge: string;
  machineBody: string;
  machineDark: string;
  machineLight: string;
  machineAccent: string;
  machineMetal: string;
  inkBlue: string;
  inkRed: string;
  inkYellow: string;
  inkGreen: string;
  inkPink: string;
  inkOrange: string;
  screenBg: string;
  screenText: string;
  screenGlow: string;
  text: string;
  textMuted: string;
  glow: string;
}

const darkColors: RisoColors = {
  bg: "#0f0f1a",
  bgGradient: "#1a1a2e",
  paper: "#faf8f0",
  paperShadow: "#c9c7b8",
  paperEdge: "#e8e6d9",
  machineBody: "#d4d4d4",
  machineDark: "#1a1a1a",
  machineLight: "#ececec",
  machineAccent: "#c41e3a",
  machineMetal: "#8a8a8a",
  inkBlue: "#0096c7",
  inkRed: "#ef233c",
  inkYellow: "#ffbe0b",
  inkGreen: "#06d6a0",
  inkPink: "#f72585",
  inkOrange: "#fb5607",
  screenBg: "#001219",
  screenText: "#00ff9f",
  screenGlow: "#00ff9f",
  text: "#ffffff",
  textMuted: "#888899",
  glow: "#0096c7",
};

const lightColors: RisoColors = {
  bg: "#fefcf3",
  bgGradient: "#fff8e1",
  paper: "#ffffff",
  paperShadow: "#d4d4d4",
  paperEdge: "#f0f0f0",
  machineBody: "#f8f8f8",
  machineDark: "#2a2a2a",
  machineLight: "#ffffff",
  machineAccent: "#c41e3a",
  machineMetal: "#9a9a9a",
  inkBlue: "#0077b6",
  inkRed: "#d90429",
  inkYellow: "#ffbe0b",
  inkGreen: "#06d6a0",
  inkPink: "#f72585",
  inkOrange: "#fb5607",
  screenBg: "#0a1628",
  screenText: "#00ff9f",
  screenGlow: "#00ff9f",
  text: "#1a1a2e",
  textMuted: "#555566",
  glow: "#0077b6",
};

interface RisoHeroProps {
  className?: string;
  onLoad?: () => void;
}

export default function RisoHero({ className, onLoad }: RisoHeroProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), []);

  useEffect(() => {
    setMounted(true);
    onLoad?.();
  }, [onLoad]);

  const c = useMemo(() => {
    return resolvedTheme === "dark" ? darkColors : lightColors;
  }, [resolvedTheme]);

  if (!mounted) {
    return (
      <div
        className={cn("w-full h-full", className)}
        style={{ aspectRatio: "1200/630", background: darkColors.bg }}
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
        {/* Halftone patterns */}
        <pattern id={`halftone-${uid}`} patternUnits="userSpaceOnUse" width="8" height="8">
          <circle cx="4" cy="4" r="1.2" fill={c.inkBlue} fillOpacity="0.08" />
        </pattern>
        <pattern id={`halftone2-${uid}`} patternUnits="userSpaceOnUse" width="12" height="12">
          <circle cx="6" cy="6" r="2" fill={c.inkPink} fillOpacity="0.05" />
        </pattern>
        
        {/* Gradients */}
        <linearGradient id={`bgGrad-${uid}`} x1="0" y1="0" x2="1200" y2="630">
          <stop offset="0%" stopColor={c.bg} />
          <stop offset="50%" stopColor={c.bgGradient} />
          <stop offset="100%" stopColor={c.bg} />
        </linearGradient>
        
        <linearGradient id={`machineGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.machineLight} />
          <stop offset="50%" stopColor={c.machineBody} />
          <stop offset="100%" stopColor={c.machineMetal} />
        </linearGradient>
        
        <linearGradient id={`screenGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.screenBg} />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.glow} stopOpacity="0.3" />
          <stop offset="100%" stopColor={c.glow} stopOpacity="0" />
        </radialGradient>
        
        <radialGradient id={`glowPink-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.inkPink} stopOpacity="0.2" />
          <stop offset="100%" stopColor={c.inkPink} stopOpacity="0" />
        </radialGradient>

        {/* Screen scanline effect */}
        <pattern id={`scanlines-${uid}`} patternUnits="userSpaceOnUse" width="4" height="4">
          <line x1="0" y1="0" x2="4" y2="0" stroke={c.screenText} strokeWidth="0.5" strokeOpacity="0.1" />
        </pattern>
        
        {/* Paper texture */}
        <filter id={`paperNoise-${uid}`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence baseFrequency="0.9" numOctaves="4" result="noise" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
        
        {/* Glow filter */}
        <filter id={`glowFilter-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background layers */}
      <rect width="1200" height="630" fill={`url(#bgGrad-${uid})`} />
      <rect width="1200" height="630" fill={`url(#halftone-${uid})`} />
      <rect width="1200" height="630" fill={`url(#halftone2-${uid})`} />
      
      {/* Ambient glow spots */}
      <ellipse cx="200" cy="500" rx="300" ry="200" fill={`url(#glow-${uid})`} />
      <ellipse cx="1000" cy="150" rx="250" ry="180" fill={`url(#glowPink-${uid})`} />

      {/* Japanese corner marks - thicker, more stylized */}
      <g stroke={c.inkRed} strokeWidth="4" strokeLinecap="square" opacity="0.7">
        <path d="M30 30 L30 90 M30 30 L90 30" />
        <path d="M1170 30 L1170 90 M1170 30 L1110 30" />
        <path d="M30 600 L30 540 M30 600 L90 600" />
        <path d="M1170 600 L1170 540 M1170 600 L1110 600" />
      </g>
      
      {/* Decorative circles */}
      <circle cx="60" cy="60" r="8" fill="none" stroke={c.inkRed} strokeWidth="2" opacity="0.5" />
      <circle cx="1140" cy="60" r="8" fill="none" stroke={c.inkRed} strokeWidth="2" opacity="0.5" />
      <circle cx="60" cy="570" r="8" fill="none" stroke={c.inkRed} strokeWidth="2" opacity="0.5" />
      <circle cx="1140" cy="570" r="8" fill="none" stroke={c.inkRed} strokeWidth="2" opacity="0.5" />

      {/* RISO DUPLICATOR */}
      <g transform="translate(550, 70)">
        {/* Machine shadow - softer */}
        <ellipse cx="250" cy="495" rx="240" ry="35" fill={c.machineDark} fillOpacity="0.15" />
        <ellipse cx="250" cy="490" rx="200" ry="25" fill={c.machineDark} fillOpacity="0.1" />
        
        {/* Main body with gradient */}
        <rect x="30" y="60" width="440" height="400" rx="12" fill={`url(#machineGrad-${uid})`} />
        <rect x="30" y="60" width="440" height="400" rx="12" stroke={c.machineDark} strokeWidth="2" fill="none" />
        
        {/* Highlight edge */}
        <path d="M42 65 L458 65" stroke={c.machineLight} strokeWidth="3" opacity="0.8" />
        
        {/* Top feeder - more detailed */}
        <path d="M50 60 L50 15 Q50 5 60 5 L440 5 Q450 5 450 15 L450 60" fill={c.machineLight} stroke={c.machineDark} strokeWidth="2" />
        <rect x="70" y="10" width="360" height="45" rx="4" fill={c.paper} stroke={c.machineDark} strokeWidth="1" />
        
        {/* Paper stack in feeder - more sheets */}
        <g>
          <rect x="80" y="30" width="340" height="3" fill={c.paperShadow} rx="1" />
          <rect x="80" y="26" width="340" height="3" fill={c.paperEdge} rx="1" />
          <rect x="80" y="22" width="340" height="3" fill={c.paperEdge} rx="1" />
          <rect x="80" y="18" width="340" height="3" fill={c.paper} rx="1" />
          <rect x="80" y="14" width="340" height="3" fill={c.paper} rx="1" />
        </g>

        {/* Control panel - darker, sleeker */}
        <rect x="45" y="75" width="190" height="290" rx="6" fill={c.machineDark} />
        <rect x="45" y="75" width="190" height="290" rx="6" stroke="#000" strokeWidth="1" opacity="0.3" />
        
        {/* LCD Screen with glow effect */}
        <g filter={`url(#glowFilter-${uid})`}>
          <rect x="55" y="85" width="170" height="90" rx="4" fill={`url(#screenGrad-${uid})`} />
        </g>
        <rect x="55" y="85" width="170" height="90" rx="4" fill={`url(#scanlines-${uid})`} />
        <rect x="55" y="85" width="170" height="90" rx="4" stroke={c.screenGlow} strokeWidth="1" opacity="0.3" />
        
        {/* Screen content */}
        <text x="68" y="110" fontFamily="'Courier New', monospace" fontSize="13" fill={c.screenText} fontWeight="bold">
          RISO RP-3700
        </text>
        <text x="68" y="130" fontFamily="'Courier New', monospace" fontSize="11" fill={c.screenText} opacity="0.9">
          ● READY
        </text>
        <text x="68" y="148" fontFamily="'Courier New', monospace" fontSize="9" fill={c.screenText} opacity="0.7">
          MODE: TEMPLATE
        </text>
        <text x="68" y="164" fontFamily="'Courier New', monospace" fontSize="8" fill={c.screenText} opacity="0.5">
          gh:wyattowalsh/riso
        </text>
        
        {/* Blinking cursor */}
        <rect x="175" y="155" width="8" height="12" fill={c.screenText} opacity="0.8">
          <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="indefinite" />
        </rect>

        {/* Keypad - cleaner design */}
        <g transform="translate(55, 185)">
          {[0,1,2].map(row => (
            [0,1,2].map(col => {
              const num = row * 3 + col + 1;
              return (
                <g key={`key-${num}`} transform={`translate(${col * 55}, ${row * 38})`}>
                  <rect x="0" y="0" width="48" height="32" rx="4" fill={c.machineLight} />
                  <rect x="1" y="1" width="46" height="15" rx="3" fill="white" opacity="0.3" />
                  <text x="24" y="23" fontFamily="system-ui" fontSize="14" fill={c.machineDark} textAnchor="middle" fontWeight="500">
                    {num}
                  </text>
                </g>
              );
            })
          ))}
        </g>

        {/* START button - enhanced */}
        <g transform="translate(55, 310)">
          <rect x="0" y="0" width="170" height="44" rx="8" fill={c.inkGreen} />
          <rect x="2" y="2" width="166" height="20" rx="6" fill="white" opacity="0.2" />
          <text x="85" y="30" fontFamily="system-ui" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle">
            ▶ START
          </text>
          {/* Pulsing glow */}
          <rect x="-4" y="-4" width="178" height="52" rx="10" fill="none" stroke={c.inkGreen} strokeWidth="2" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* Drum area - enhanced with depth */}
        <rect x="245" y="75" width="220" height="250" rx="6" fill={c.machineLight} stroke={c.machineDark} strokeWidth="2" />
        
        {/* Rotating drum - enhanced */}
        <g transform="translate(355, 200)">
          <ellipse cx="0" cy="0" rx="85" ry="95" fill={c.machineDark} />
          <ellipse cx="0" cy="0" rx="75" ry="85" fill="#3a3a3a" />
          <ellipse cx="0" cy="0" rx="72" ry="82" fill="#4a4a4a" />
          {/* Drum ridges */}
          {[-70, -45, -20, 5, 30, 55].map((y, i) => (
            <line key={`ridge-${i}`} x1="-68" y1={y} x2="68" y2={y} stroke="#555" strokeWidth="1.5" opacity="0.6" />
          ))}
          {/* Ink layer with gradient effect */}
          <ellipse cx="0" cy="0" rx="65" ry="75" fill={c.inkBlue} fillOpacity="0.25" />
          <ellipse cx="-10" cy="-10" rx="40" ry="50" fill={c.inkBlue} fillOpacity="0.15" />
          {/* Highlight */}
          <ellipse cx="-30" cy="-40" rx="20" ry="25" fill="white" fillOpacity="0.1" />
        </g>

        {/* Output tray - enhanced */}
        <path d="M245 335 L245 455 Q245 465 255 465 L455 465 Q465 465 465 455 L465 335" fill={c.machineLight} stroke={c.machineDark} strokeWidth="2" />
        <path d="M250 340 L460 340" stroke={c.machineMetal} strokeWidth="1" opacity="0.5" />
        
        {/* Output papers - more detail */}
        <g transform="translate(260, 350)">
          {/* Paper stack shadows */}
          <rect x="8" y="8" width="180" height="105" rx="3" fill={c.paperShadow} opacity="0.5" />
          <rect x="6" y="6" width="180" height="105" rx="3" fill={c.paperShadow} opacity="0.7" />
          <rect x="4" y="4" width="180" height="105" rx="3" fill={c.paperEdge} />
          <rect x="2" y="2" width="180" height="105" rx="3" fill={c.paperEdge} />
          <rect x="0" y="0" width="180" height="105" rx="3" fill={c.paper} />
          
          {/* Riso-printed content - enhanced misregistration */}
          {/* Blue layer */}
          <g fill={c.inkBlue}>
            <rect x="12" y="10" width="70" height="10" rx="2" fillOpacity="0.9" />
            <rect x="12" y="26" width="155" height="3" rx="1" fillOpacity="0.6" />
            <rect x="12" y="34" width="130" height="3" rx="1" fillOpacity="0.5" />
            <rect x="12" y="42" width="90" height="3" rx="1" fillOpacity="0.4" />
          </g>
          
          {/* Red layer - offset for misregistration */}
          <g transform="translate(2, 1)" fill={c.inkRed}>
            <circle cx="155" cy="18" r="14" fillOpacity="0.7" />
            <rect x="12" y="50" width="100" height="3" rx="1" fillOpacity="0.6" />
          </g>
          
          {/* Yellow accent */}
          <circle cx="152" cy="16" r="10" fill={c.inkYellow} fillOpacity="0.4" />
          
          {/* Code block representation */}
          <rect x="12" y="60" width="155" height="38" rx="3" fill={c.screenBg} fillOpacity="0.08" />
          <g opacity="0.85">
            <rect x="18" y="66" width="35" height="2.5" rx="1" fill={c.inkGreen} />
            <rect x="58" y="66" width="55" height="2.5" rx="1" fill={c.text} fillOpacity="0.35" />
            <rect x="24" y="74" width="70" height="2.5" rx="1" fill={c.text} fillOpacity="0.3" />
            <rect x="24" y="82" width="45" height="2.5" rx="1" fill={c.inkBlue} fillOpacity="0.5" />
            <rect x="18" y="90" width="25" height="2.5" rx="1" fill={c.inkGreen} />
          </g>
        </g>

        {/* Ink cartridges - enhanced with labels */}
        <g transform="translate(390, 75)">
          <text x="32" y="-8" fontFamily="system-ui" fontSize="8" fill={c.textMuted} textAnchor="middle" fontWeight="500">INK DRUMS</text>
          {[
            { color: c.inkBlue, label: 'B' },
            { color: c.inkRed, label: 'R' },
            { color: c.inkYellow, label: 'Y' },
            { color: c.inkGreen, label: 'G' },
            { color: c.inkPink, label: 'P' },
            { color: c.inkOrange, label: 'O' },
          ].map((ink, i) => (
            <g key={`ink-${i}`} transform={`translate(${i * 15}, 0)`}>
              <rect x="0" y="0" width="12" height="35" rx="2" fill={ink.color} />
              <rect x="1" y="1" width="10" height="8" rx="1" fill="white" fillOpacity="0.4" />
              <text x="6" y="28" fontFamily="system-ui" fontSize="6" fill="white" textAnchor="middle" fontWeight="bold">{ink.label}</text>
            </g>
          ))}
        </g>

        {/* Brand plate - enhanced */}
        <g transform="translate(45, 385)">
          <rect x="0" y="0" width="140" height="40" rx="4" fill={c.machineAccent} />
          <rect x="2" y="2" width="136" height="18" rx="3" fill="white" fillOpacity="0.1" />
          <text x="70" y="18" fontFamily="'Hiragino Kaku Gothic Pro', system-ui" fontSize="13" fill="white" textAnchor="middle" fontWeight="bold">
            理想科学
          </text>
          <text x="70" y="32" fontFamily="system-ui" fontSize="9" fill="white" textAnchor="middle" opacity="0.9" letterSpacing="1">
            RISO KAGAKU
          </text>
        </g>
      </g>

      {/* Left floating prints - enhanced */}
      <g transform="translate(60, 130)">
        {/* Print 1 - tilted with shadow */}
        <g transform="rotate(-12)">
          <rect x="5" y="5" width="160" height="120" rx="2" fill={c.paperShadow} opacity="0.3" />
          <rect x="0" y="0" width="160" height="120" rx="2" fill={c.paper} stroke={c.paperEdge} strokeWidth="1" />
          {/* Riso art style content */}
          <rect x="15" y="15" width="80" height="12" rx="2" fill={c.inkBlue} fillOpacity="0.85" />
          <rect x="15" y="35" width="130" height="4" rx="1" fill={c.inkBlue} fillOpacity="0.5" />
          <rect x="15" y="45" width="110" height="4" rx="1" fill={c.inkBlue} fillOpacity="0.4" />
          {/* Overprint circles */}
          <circle cx="125" cy="85" r="28" fill={c.inkPink} fillOpacity="0.5" />
          <circle cx="120" cy="80" r="28" fill={c.inkYellow} fillOpacity="0.35" />
          <circle cx="115" cy="90" r="20" fill={c.inkBlue} fillOpacity="0.25" />
        </g>
        
        {/* Print 2 */}
        <g transform="translate(80, 150) rotate(8)">
          <rect x="4" y="4" width="140" height="100" rx="2" fill={c.paperShadow} opacity="0.3" />
          <rect x="0" y="0" width="140" height="100" rx="2" fill={c.paper} stroke={c.paperEdge} strokeWidth="1" />
          {/* Terminal output style */}
          <rect x="10" y="10" width="120" height="80" rx="3" fill={c.screenBg} fillOpacity="0.05" />
          <text x="15" y="28" fontFamily="'Courier New', monospace" fontSize="9" fill={c.inkBlue}>$ copier copy</text>
          <text x="15" y="44" fontFamily="'Courier New', monospace" fontSize="9" fill={c.inkGreen}>✓ CLI</text>
          <text x="55" y="44" fontFamily="'Courier New', monospace" fontSize="9" fill={c.inkGreen}>✓ API</text>
          <text x="15" y="58" fontFamily="'Courier New', monospace" fontSize="9" fill={c.inkGreen}>✓ MCP</text>
          <text x="55" y="58" fontFamily="'Courier New', monospace" fontSize="9" fill={c.inkGreen}>✓ Docs</text>
          <rect x="15" y="70" width="50" height="12" rx="2" fill={c.inkRed} fillOpacity="0.7" />
          <text x="40" y="80" fontFamily="system-ui" fontSize="7" fill="white" textAnchor="middle">SCAFFOLD</text>
        </g>
        
        {/* Print 3 - small accent */}
        <g transform="translate(30, 320) rotate(-5)">
          <rect x="3" y="3" width="90" height="70" rx="2" fill={c.paperShadow} opacity="0.3" />
          <rect x="0" y="0" width="90" height="70" rx="2" fill={c.paper} stroke={c.paperEdge} strokeWidth="1" />
          <circle cx="45" cy="35" r="22" fill={c.inkOrange} fillOpacity="0.6" />
          <circle cx="42" cy="32" r="18" fill={c.inkYellow} fillOpacity="0.4" />
          <text x="45" y="58" fontFamily="monospace" fontSize="7" fill={c.inkBlue} textAnchor="middle">v0.1.0</text>
        </g>
      </g>

      {/* Right decorative elements - enhanced */}
      <g transform="translate(980, 140)">
        {/* Large ink splatter composition */}
        <circle cx="70" cy="70" r="60" fill={c.inkBlue} fillOpacity="0.12" />
        <circle cx="80" cy="60" r="45" fill={c.inkPink} fillOpacity="0.1" />
        <circle cx="60" cy="80" r="35" fill={c.inkYellow} fillOpacity="0.08" />
        <circle cx="90" cy="90" r="25" fill={c.inkGreen} fillOpacity="0.1" />
        
        {/* Floating module badges */}
        <g transform="translate(20, 160)">
          <rect x="0" y="0" width="70" height="24" rx="12" fill={c.inkBlue} fillOpacity="0.15" stroke={c.inkBlue} strokeWidth="1" strokeOpacity="0.3" />
          <text x="35" y="16" fontFamily="system-ui" fontSize="10" fill={c.inkBlue} textAnchor="middle" fontWeight="500">Python</text>
        </g>
        <g transform="translate(80, 180)">
          <rect x="0" y="0" width="70" height="24" rx="12" fill={c.inkGreen} fillOpacity="0.15" stroke={c.inkGreen} strokeWidth="1" strokeOpacity="0.3" />
          <text x="35" y="16" fontFamily="system-ui" fontSize="10" fill={c.inkGreen} textAnchor="middle" fontWeight="500">Node.js</text>
        </g>
        <g transform="translate(40, 220)">
          <rect x="0" y="0" width="55" height="24" rx="12" fill={c.inkPink} fillOpacity="0.15" stroke={c.inkPink} strokeWidth="1" strokeOpacity="0.3" />
          <text x="27" y="16" fontFamily="system-ui" fontSize="10" fill={c.inkPink} textAnchor="middle" fontWeight="500">MCP</text>
        </g>
        <g transform="translate(100, 250)">
          <rect x="0" y="0" width="55" height="24" rx="12" fill={c.inkOrange} fillOpacity="0.15" stroke={c.inkOrange} strokeWidth="1" strokeOpacity="0.3" />
          <text x="27" y="16" fontFamily="system-ui" fontSize="10" fill={c.inkOrange} textAnchor="middle" fontWeight="500">SaaS</text>
        </g>
      </g>

      {/* Bottom text - enhanced */}
      <g transform="translate(600, 575)">
        <text x="0" y="0" fontFamily="system-ui" fontSize="18" fill={c.text} textAnchor="middle" fontWeight="700" letterSpacing="0.5">
          Production-Ready Project Scaffolding
        </text>
        <text x="0" y="24" fontFamily="'Courier New', monospace" fontSize="11" fill={c.textMuted} textAnchor="middle" letterSpacing="2">
          Python • Node.js • CLI • API • MCP • Docs • SaaS
        </text>
      </g>

      {/* Top branding - enhanced with retro feel */}
      <g transform="translate(100, 50)">
        {/* Glow effect behind logo */}
        <text fontFamily="'Helvetica Neue', system-ui" fontSize="48" fontWeight="900" fill={c.inkRed} fillOpacity="0.3" filter={`url(#glowFilter-${uid})`}>RISO</text>
        {/* Main logo */}
        <text fontFamily="'Helvetica Neue', system-ui" fontSize="48" fontWeight="900" fill={c.inkRed} letterSpacing="-2">RISO</text>
        {/* Tagline */}
        <text x="155" y="0" fontFamily="system-ui" fontSize="13" fill={c.textMuted} fontWeight="500" letterSpacing="1">template system</text>
        {/* URL */}
        <text x="0" y="22" fontFamily="'Courier New', monospace" fontSize="11" fill={c.inkBlue} fontWeight="500">startriso.com</text>
      </g>
    </svg>
  );
}
