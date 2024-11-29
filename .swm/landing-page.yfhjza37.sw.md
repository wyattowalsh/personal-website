---
title: landing-page
---
<SwmSnippet path="/app/globals.scss" line="1">

---

&nbsp;

```scss
@use 'sass:math';
@use 'variables.module.scss' as variables;

@use "tailwindcss/base";
@use "tailwindcss/components";
@use "tailwindcss/utilities";

@function random-percentage() {
  @return math.random(100) + 0%;
}

@function random-translate() {
  @return math.random(10) - 5 + px;
}

@layer base {
  :root {
    @include variables.light;
  }

  html.dark {
    @include variables.dark;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    transition: background-color 0.3s ease, color 0.3s ease;
    cursor: none;
  }

  a:not(.no-underline) {
    @apply text-primary underline transition-colors duration-300;
  }

  a.no-underline,
  .no-underline a {
    text-decoration: none;
  }

  a:hover {
    color: var(--primary-foreground);
    text-decoration: underline;
  }

  .prose {
    @apply mx-auto;
    color: var(--foreground);
  }

  code {
    @apply bg-muted text-accent-foreground px-1.5 py-0.5 rounded;
    
    // Add specific styles for inline code
    &:not(pre code) {
      font-family: var(--font-code);
      font-weight: 500;
      font-size: 0.9em;
      letter-spacing: -0.025em;
      vertical-align: baseline;
      position: relative;
      white-space: pre;
      box-decoration-break: clone;
    }
    @apply font-mono text-sm bg-gray-100 rounded;
  }

  pre {
    @apply bg-card text-card-foreground p-4 rounded-lg overflow-x-auto;
  }

  .math-container {
    @apply relative my-4 mx-16;
    
    .katex-display {
      @apply overflow-x-auto overflow-y-visible;
      
      &::-webkit-scrollbar {
        @apply h-1.5;
      }
      
      &::-webkit-scrollbar-track {
        @apply bg-transparent;
      }
      
      &::-webkit-scrollbar-thumb {
        @apply bg-slate-400/20 hover:bg-slate-400/30 rounded-full transition-colors duration-300;
      }
    }

    .katex {
      @apply overflow-visible;
    }

    &:hover {
      .katex-display::-webkit-scrollbar-thumb {
        @apply bg-primary opacity-20 hover:opacity-30;
      }
    }
  }

  .math-inline {
    @apply inline-flex items-center rounded border border-opacity-30 border-border bg-muted bg-opacity-30 px-2 py-1 dark:bg-opacity-10 dark:bg-muted;
  }

  .math {
    font-family: 'KaTeX_Main', serif;
    color: var(--math-text-color);
  }

  .math-inline {
    display: inline-block;
    background-color: var(--math-inline-bg);
    padding: 0.1em 0.2em;
    border-radius: 4px;
  }

  .math-display {
    display: block;
    background-color: var(--math-display-bg);
    padding: 0.5em;
    margin: 1em 0;
    border-radius: 8px;
    text-align: center;
    position: relative;
  }

  .equation-number {
    position: absolute;
    right: 0.5em;
    bottom: 0.5em;
    font-size: 0.85em;
    color: var(--math-index-color);
  }

  // Add styles for anchor links on headings
  h1, h2, h3, h4, h5, h6 {
    scroll-margin-top: 100px;
    position: relative;
    
    .anchor-link {
      @apply opacity-0 absolute;
      left: -1.5em;
      padding-right: 0.5em;
      cursor: pointer;
      
      &:hover {
        @apply opacity-100;
      }
      
      .anchor-icon {
        @apply inline-block align-middle;
        width: 1em;
        height: 1em;
      }
    }
    
    &:hover .anchor-link {
      @apply opacity-100;
    }
  }

  // Enhanced equation styles
  .math-display {
    .equation-number-container {
      @apply absolute right-4 bottom-4;
      @apply flex items-center gap-2;
      @apply opacity-0 hover:opacity-100;
      @apply transition-opacity duration-200;
    }

    .equation-number {
      @apply text-math-display-number text-sm;
      @apply transition-all duration-300;
      @apply hover:text-math-display-number-hover;
      @apply cursor-pointer;
      @apply select-none;
      @apply flex items-center gap-1;
      
      &:hover {
        @apply scale-105;
      }
    }

    &:target {
      @apply ring-2 ring-primary/50;
      @apply bg-primary/5;
      animation: highlight 2s ease-out;
    }

    // Ensure math content is properly positioned
    .math-content {
      @apply relative py-2;
      @apply overflow-x-auto overflow-y-hidden;
      @apply scrollbar-thin scrollbar-track-transparent;
      @apply scrollbar-thumb-math; // Use new custom utility
    }
  }

  h1, h2, h3, h4, h5, h6 {
    @apply scroll-mt-20 relative;

    .anchor {
      @apply absolute opacity-0 -left-5 top-1/2 -translate-y-1/2;
      @apply transition-all duration-200 ease-out;
      @apply p-1 rounded-md;
      @apply hover:bg-primary/5;
      
      .anchor-icon {
        @apply block w-4 h-4;
        @apply text-muted-foreground;
        @apply transition-all duration-200;
        @apply transform scale-90;
        
        &:hover {
          @apply text-primary scale-100;
        }
      }
    }

    &:hover .anchor {
      @apply opacity-100;
    }
  }

  // Enhanced header styles with autolink
  h1, h2, h3, h4, h5, h6 {
    @apply scroll-mt-20 relative;
    
    // Anchor link container
    .anchor {
      @apply absolute -left-8 top-1/2 -translate-y-1/2;
      @apply opacity-0 invisible;
      @apply p-2 -m-2; // Larger touch target
      @apply rounded-lg;
      @apply transition-all duration-300 ease-out;
      @apply hover:bg-primary/5 dark:hover:bg-primary/10;
      @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50;
      @apply sm:visible; // Only show on larger screens
      
      // Responsive positioning
      @apply md:-left-10;
      @apply lg:-left-12;
      
      // Icon styling
      .anchor-icon {
        @apply block;
        @apply text-muted-foreground opacity-50;
        @apply dark:text-muted-foreground dark:opacity-40;
        @apply transition-all duration-300;
        @apply transform scale-75;
        @apply hover:scale-100 hover:text-primary hover:opacity-100;
        @apply dark:hover:text-primary dark:hover:opacity-100;
        
        // Responsive icon sizing
        @apply w-4 h-4;
        @apply sm:w-5 sm:h-5;
        @apply md:w-6 md:h-6;
        
        // Add subtle glow on hover
        @apply hover:drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)];
        @apply dark:hover:drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)];
      }
    }

    // Show anchor on header hover
    &:hover .anchor {
      @apply opacity-100;
      @apply visible;
      @apply translate-x-0;
    }

    // Mobile-friendly touch target
    @media (hover: none) {
      .anchor {
        @apply opacity-50 visible;
        @apply -left-6 sm:-left-8;
        
        .anchor-icon {
          @apply scale-90;
        }
      }
    }

    // Active state styles
    .anchor:active {
      @apply scale-95;
      @apply bg-primary/10 dark:bg-primary/15;
    }

    // When header is targeted by URL hash
    &:target {
      @apply relative;
      
      &::before {
        content: "";
        @apply absolute -inset-x-4 -inset-y-2;
        @apply bg-primary/5 dark:bg-primary/10;
        @apply rounded-lg;
        @apply animate-[highlight_2s_ease-out];
      }
      
      .anchor {
        @apply opacity-100 visible;
      }
    }
  }

  // Default text selection
  ::selection {
    @apply bg-selection-bg text-selection-text;
  }

  // Heading-specific text selection
  h1, h2, h3, h4, h5, h6 {
    &::selection {
      @apply bg-selection-heading-bg text-selection-heading-text;
    }

    // Also style selection within headings (e.g., for nested elements)
    & *::selection {
      @apply bg-selection-heading-bg text-selection-heading-text;
    }
  }

  // Enhanced responsive heading styles
  h1 {
    @apply text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl;
    @apply leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-tight;
    @apply tracking-tight sm:tracking-tight md:tracking-tight;
    @apply mb-4 sm:mb-6 md:mb-8;
  }

  h2 {
    @apply text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl;
    @apply leading-tight sm:leading-tight md:leading-tight;
    @apply tracking-tight;
    @apply mt-8 sm:mt-10 md:mt-12 mb-4 sm:mb-6;
  }

  h3 {
    @apply text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl;
    @apply leading-snug sm:leading-snug md:leading-snug;
    @apply mt-6 sm:mt-8 md:mt-10 mb-3 sm:mb-4;
  }

  h4 {
    @apply text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl;
    @apply leading-snug;
    @apply mt-4 sm:mt-6 md:mt-8 mb-2 sm:mb-3;
  }

  // Enhanced heading hover and focus states
  h1, h2, h3, h4, h5, h6 {
    @apply relative overflow-visible;
    
    // Progressive reveal effect on hover
    &::after {
      @apply content-[''] absolute bottom-0 left-0 w-full;
      @apply h-[2px] bg-primary/30 dark:bg-primary/20;
      @apply transform scale-x-0 origin-left;
      @apply transition-transform duration-300 ease-out;
    }

    &:hover::after {
      @apply scale-x-100;
    }

    // Enhanced focus styles
    &:focus-visible {
      @apply outline-none ring-2 ring-primary/50 dark:ring-primary/40;
      @apply rounded-lg;
    }

    // Improved anchor link visibility
    .anchor {
      @apply opacity-0 transform -translate-x-2;
      @apply transition-all duration-300 ease-out;

      @screen md {
        @apply opacity-0 -translate-x-4;
      }

      @screen lg {
        @apply opacity-0 -translate-x-6;
      }
    }

    &:hover .anchor {
      @apply opacity-100 translate-x-0;
    }
  }

  // Enhanced mobile experience
  @media (hover: none) {
    h1, h2, h3, h4, h5, h6 {
      .anchor {
        @apply opacity-50 translate-x-0;
      }
    }
  }

  // Add custom utility classes
  .tilt-effect {
    transform-style: preserve-3d;
    perspective: 1000px;
    transition: transform 200ms ease-in-out; // Replace $animation-duration-fast with 200ms
  }
  .tilt-effect:hover {
    transform: rotateX(10deg) rotateY(-10deg);
  }
}

// Remove or adjust styles that may interfere with 'strong' and 'em'
// For example, if you have:
// strong, em {
//   // Custom styles that affect nesting
// }

// Modify or remove these styles to prevent conflicts

@keyframes glitch-anim {
  $steps: 20;
  @for $i from 0 through $steps {
    #{math.percentage(math.div($i, 2 * $steps))} {
      clip-path: inset(random-percentage() 0 random-percentage() 0);
      transform: translate(random-translate(), random-translate());
    }
  }
}

@layer components {
  .cyber-grid {
    background-image: 
      linear-gradient(var(--cyber-grid-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--cyber-grid-color) 1px, transparent 1px);
    background-size: var(--cyber-grid-size) var(--cyber-grid-size);
    width: 100%;
    height: 100%;
    transform-origin: center;
    animation: grid-flow 20s linear infinite;
  }

  .glitch-scanlines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0%,
      var(--scan-line-color) 0.5%,
      transparent 1%
    );
    animation: scanlines 10s linear infinite;
  }

  .noise-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org-2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: var(--noise-intensity);
    mix-blend-mode: overlay;
    pointer-events: none;
  }

  .glitch-text {
    position: relative;
    animation: glitch-text 3s infinite;
    
    &::before,
    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    &::before {
      left: 2px;
      text-shadow: -2px 0 var(--glitch-color-1);
      clip: rect(24px, 550px, 90px, 0);
      animation: glitch-anim 3s infinite linear alternate-reverse;
    }
    
    &::after {
      left: -2px;
      text-shadow: -2px 0 var(--glitch-color-2);
      clip: rect(85px, 550px, 140px, 0);
      animation: glitch-anim 2s infinite linear alternate-reverse;
    }
  }

  .math-display {
    @apply relative my-8 px-8 py-6;
    @apply rounded-xl border border-math-border;
    @apply bg-math-bg/95 dark:bg-math-bg/80;
    @apply shadow-math hover:shadow-math-hover;
    @apply transition-all duration-300;
    // Replace @apply group with direct class
    &:not(.no-group) {
      isolation: isolate;
      /* Add the group class via composition */
      composes: group from global;
    }

    // Enhanced controls container
    .equation-controls {
      @apply absolute top-2 right-2; // Move to top-right
      @apply flex items-center gap-2;
      @apply opacity-0 group-hover:opacity-100;
      @apply transition-opacity duration-200;
      @apply z-20;
    }

    // Copy button styles
    .copy-button {
      @apply p-1.5 rounded-md;
      @apply text-math-controls-text hover:text-math-controls-text-hover;
      @apply bg-transparent hover:bg-math-controls-bg;
      @apply transition-all duration-200;
      @apply transform hover:scale-110;
    }

    // Link button styles 
    .link-button {
      @apply p-1.5 rounded-md ml-1;
      @apply text-math-controls-text hover:text-math-controls-text-hover;
      @apply bg-transparent hover:bg-math-controls-bg;
      @apply transition-all duration-200;
      @apply transform hover:scale-110;
    }

    // Update equation number styles
    .equation-number {
      @apply absolute right-3 bottom-2; // Move to bottom-right
      @apply text-sm font-medium px-2 py-1 rounded-md;
      @apply text-math-controls-text hover:text-math-controls-text-hover;
      @apply bg-transparent hover:bg-math-controls-bg;
      @apply transition-all duration-200;
      @apply cursor-pointer select-none;
      @apply z-10; // Keep below controls
    }

    // Add hover state
    &:hover {
      @apply border-primary/30;
      
      .equation-controls,
      .equation-number {
        @apply opacity-100;
      }
    }

    // Ensure math content is properly positioned
    .math-content {
      @apply relative py-2; // Add padding to avoid overlap
      @apply overflow-x-auto overflow-y-hidden;
      @apply scrollbar-thin scrollbar-track-transparent;
      @apply scrollbar-thumb-math; // Use our new custom utility
    }

    // Target state highlight
    &:target {
      @apply ring-2 ring-primary/50;
      @apply bg-primary/5;
      animation: equation-highlight 2s ease-out;
    }
  }

  .math-inline {
    @apply relative inline-flex items-center;
    @apply px-2 py-0.5 rounded-md;
    @apply bg-math-bg/40 dark:bg-math-bg/20;
    @apply border border-math-border/30;
    @apply transition-all duration-300;
    @apply hover:bg-math-bg/60 dark:hover:bg-math-bg/40;
    @apply hover:border-math-border/50;
    @apply hover:shadow-sm dark:hover:shadow-primary/5;
  }

  .subtitle-container {
    perspective: 1000px;
    
    .subtitle-text {
      backface-visibility: hidden;
      transform-style: preserve-3d;
      background: linear-gradient(
        45deg,
        var(--subtitle-gradient-start),
        var(--subtitle-gradient-end)
      );
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      
      animation: subtitle-gradient 8s linear infinite;
      background-size: 200% 200%;
    }
  }

  // Neon glow effect
  .neon-text {
    color: var(--neon-color);
    text-shadow:
      0 0 5px var(--neon-color),
      0 0 10px var(--neon-color),
      0 0 20px var(--neon-color),
      0 0 40px var(--neon-color);
  }

  // Glassmorphism style
  .glassmorphism {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  // Neon border
  .neon-border {
    border: 1px solid var(--neon-color);
    box-shadow: 0 0 10px var(--neon-color);
  }

  // Neon hover effect
  .neon-hover:hover {
    box-shadow: 0 0 10px var(--neon-color), 0 0 20px var(--neon-color);
  }

  // Custom cursor
  .custom-cursor {
    position: fixed;
    top: 0;
    left: 0;
    width: 15px;
    height: 15px;
    background-color: var(--neon-color);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
  }
}

@layer utilities {
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r;
    &.primary {
      @apply from-blue-500 via-blue-600 to-blue-700
             dark:from-blue-400 dark:via-blue-500 dark:to-blue-600;
    }
    &.accent {
      @apply from-pink-500 via-purple-500 to-indigo-500
             dark:from-pink-400 dark:via-purple-400 dark:to-indigo-400;
    }
  }

  .hover-lift {
    @apply transition-transform duration-300 ease-out;
    &:hover {
      @apply -translate-y-1;
    }
  }

  .glow {
    @apply relative;
    &::after {
      @apply content-[''] absolute inset-0 z-[-1];
      @apply bg-gradient-glow;
      @apply blur-xl opacity-0 transition-opacity duration-300;
    }
    &:hover::after {
      @apply opacity-100;
    }
  }

  .prose {
    @apply max-w-none;
    @apply sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%] xl:max-w-[80%] 2xl:max-w-[75%];
    @apply mx-auto;
  }

  // Enhance text readability on different screen sizes
  .text-adaptive {
    @apply text-sm sm:text-base md:text-lg lg:text-xl;
    @apply leading-relaxed sm:leading-relaxed md:leading-relaxed;
    @apply tracking-wide sm:tracking-normal md:tracking-normal;
  }
}

@keyframes grid-flow {
  0% {
    transform: perspective(500px) rotateX(60deg) translateY(0);
  }
  100% {
    transform: perspective(500px) rotateX(60deg) translateY(var(--cyber-grid-size));
  }
}

@keyframes scanlines {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100%);
  }
}

@keyframes subtitle-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes highlight {
  0% {
    background-color: var(--primary-20);
  }
  100% {
    background-color: transparent;
  }
}

@keyframes equation-highlight {
  0% { @apply bg-primary/20; }
  100% { @apply bg-primary/5; }
}

@keyframes highlight {
  from {
    @apply bg-primary/20 dark:bg-primary/25;
  }
  to {
    @apply bg-primary/5 dark:bg-primary/10;
  }
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

// Add to globals.scss
.social-link-card {
  @apply transform-gpu;
  @apply flex flex-col items-center justify-center;
  @apply p-6 sm:p-8 rounded-xl;
  @apply bg-gradient-to-br;
  @apply bg-opacity-80 dark:bg-opacity-40;
  @apply backdrop-blur-md;
  @apply border border-primary/10 dark:border-primary/20;
  @apply shadow-lg shadow-primary/5 dark:shadow-primary/10;
  @apply transition-all duration-500;
  @apply hover:scale-105;
  @apply hover:border-primary/30 dark:hover:border-primary/40;
  @apply hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/20;
  @apply hover:backdrop-blur-lg;

  // Enhanced glow effect
  &::before {
    @apply content-[''] absolute inset-0;
    @apply bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0;
    @apply rounded-xl opacity-0 blur-xl;
    @apply transition-opacity duration-500;
    @apply pointer-events-none -z-10;
  }

  &:hover::before {
    @apply opacity-100;
  }

  // Icon styles
  .icon {
    @apply w-8 h-8 mb-3;
    @apply text-primary/80 dark:text-primary/70;
    @apply transition-transform duration-500;
    @apply group-hover:scale-110;
    @apply filter drop-shadow-lg;
  }

  // Text styles
  .text {
    @apply text-sm font-medium;
    @apply text-foreground/80 dark:text-foreground/70;
    @apply transition-colors duration-500;
    @apply group-hover:text-primary;
  }
}

@keyframes floating {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.landing-container {
  @apply relative min-h-screen;
  @apply overflow-hidden isolate;
  @apply bg-gradient-to-b;
  @apply from-background via-background/95 to-background/90;
  @apply dark:from-background dark:via-background/95 dark:to-background/90;

  &::before {
    @apply content-[''] absolute inset-0;
    @apply bg-[radial-gradient(circle_at_center,transparent_0%,var(--primary)_100%)];
    @apply opacity-[0.03] dark:opacity-[0.06];
    @apply pointer-events-none;
  }

  // Add floating orbs
  .orb {
    @apply absolute rounded-full;
    @apply bg-gradient-to-r from-primary/20 to-accent/20;
    @apply dark:from-primary/30 dark:to-accent/30;
    @apply blur-3xl;
    @apply animate-floating; // This will now work with the new animation
    @apply pointer-events-none;
  }
}
```

---

</SwmSnippet>

<SwmSnippet path="/app/layout.tsx" line="1">

---

&nbsp;

```tsx
import { Metadata, Viewport } from "next";
import { Fira_Code, Montserrat, Inter } from "next/font/google";
import "./globals.scss";
import "katex/dist/katex.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollIndicator from "@/components/ScrollIndicator";
import Header from "@/components/Header";
import KaTeXLoader from "@/components/KaTeXLoader";
import CustomScrollbars from "@/components/Scroll";
import { StrictMode } from 'react';
import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';
import { cn } from "@/lib/utils";
import { getDefaultMetadata } from '@/lib/metadata';
import { generateWebSiteSchema } from '@/lib/schema';
import CustomCursor from "@/components/CustomCursor";

config.autoAddCss = false;

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  preload: true,
  fallback: ['system-ui', 'arial']
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Base metadata configuration
export const metadata: Metadata = {
  title: {
    default: "Wyatt's Personal Web App",
    template: "%s"  // Remove the template here to let child layouts handle it
  },
  description: "Personal website and blog of Wyatt Walsh, featuring articles about software development, web technologies, and more.",
  metadataBase: new URL('https://w4w.dev'),
  ...getDefaultMetadata(),
  other: {
    ...getDefaultMetadata().other 
  },
  // Add OpenGraph metadata
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://w4w.dev',
    siteName: "Wyatt's Personal Web App",
    title: "Wyatt's Personal Web App",
    description: "Personal website and blog of Wyatt Walsh, featuring articles about software development, web technologies, and more.",
    images: [
      {
        url: '/logo.webp',
        width: 256,
        height: 256,
        alt: 'Wyatt Walsh'
      }
    ]
  },
  // Add Twitter metadata
  twitter: {
    card: 'summary',
    title: "Wyatt's Personal Web App",
    description: "Personal website and blog of Wyatt Walsh",
    images: ['/logo.webp'],
    creator: '@w4walsh'
  },
  // ...rest of metadata
};

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StrictMode>
      <html lang="en" suppressHydrationWarning className={cn("antialiased", inter.variable)}>
        <body
          className={cn(
            "min-h-screen bg-background font-sans",
            "motion-safe:transition-colors motion-safe:duration-300",
            "selection:bg-primary/20 selection:text-primary",
            "scrollbar-thin scrollbar-track-transparent",
            "scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20",
            montserrat.variable,
            firaCode.variable
          )}
          suppressHydrationWarning
        >
          <CustomCursor /> {/* Add custom cursor */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <CustomScrollbars>{children}</CustomScrollbars>
              </main>
            </div>
          </ThemeProvider>
          <ScrollIndicator />
          <KaTeXLoader />
          <GoogleTagManager gtmId="GTM-P7VFKNK6" />
          <GoogleAnalytics gaId="G-17PRGFZN0C" />
        </body>
      </html>
    </StrictMode>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/app/page.module.scss" line="1">

---

&nbsp;

```scss
@use "variables.module.scss"as variables;

@keyframes backgroundAnimation {

  0%,
  100% {
    background-position: 0% 50%;
    will-change: background-position;
  }

  50% {
    background-position: 100% 50%;
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.5;
    transform: translateY(-50%) scale(1);
  }

  50% {
    opacity: 1;
    transform: translateY(-50%) scale(1.5);
  }
}

@keyframes patternMove {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 1000px 1000px;
  }
}

// Add new animations
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.enhanced-title-landing {
  font-size: 3.5rem;
  font-weight: 700;
  background: var(--gradient-text);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleGradient 5s ease infinite;
  text-transform: none;
  position: relative;
  font-family: var(--font-enhanced-title);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  @apply text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold;
  letter-spacing: -0.02em;

  @screen sm {
    letter-spacing: -0.03em;
  }

  @screen lg {
    letter-spacing: -0.04em;
  }
}

@keyframes titleGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.enhanced-separator {
  position: relative;
  width: 75%;
  max-width: 28rem;
  height: 2px;
  margin: 2rem auto;
  background: linear-gradient(90deg,
      transparent 0%,
      var(--primary) 50%,
      transparent 100%);
  opacity: 0.7;
  transition: all 0.3s ease;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--primary);
    transform: translateY(-50%);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    box-shadow: 0 0 15px var(--primary);
  }

  &::before {
    left: 0;
    animation-delay: 0s;
  }

  &::after {
    right: 0;
    animation-delay: 1s;
  }

  &:hover {
    opacity: 1;
    transform: scaleX(1.05);
    filter: brightness(1.2);
    box-shadow: 0 0 20px var(--primary);

    &::before,
    &::after {
      animation-duration: 1.5s;
    }
  }
}

.enhanced-animated-text {
  background: var(--gradient-text);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientBackground 8s ease infinite;
  position: relative;

  text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  will-change: background-position, transform;
}

.enhanced-animated-text:hover {
  animation-play-state: paused;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
}

@keyframes gradientBackground {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

html.dark .enhanced-animated-text {
  background: var(--gradient-text);
}

@media (max-width: 1024px) {
  .logo-image {
    max-width: 192px;
  }
}

.image-container {
  position: relative;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 9999px;
    background: linear-gradient(45deg,
        var(--primary) 0%,
        var(--accent) 50%,
        var(--primary) 100%);
    opacity: 0.5;
    z-index: -1;
    transition: all 0.3s ease;
    animation: rotate 10s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: radial-gradient(circle at center,
        var(--primary) 0%,
        transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    filter: blur(15px);
  }

  &:hover {
    transform: scale(1.02);

    &::before {
      opacity: 0.8;
      filter: blur(3px);
    }

    &::after {
      opacity: 0.4;
    }

    img {
      transform: scale(1.05);
      filter: brightness(1.1);
    }
  }
}

@media (prefers-reduced-motion: no-preference) {
  .image-container {
    animation: float 6s ease-in-out infinite;
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// Add new glass-morphism utility
.glass-panel {
  @apply backdrop-blur-md bg-white/10 dark:bg-black/10;
  @apply border border-white/20 dark:border-white/10;
  @apply shadow-xl;
}

// Add animated background patterns
.bg-grid-pattern {
  background-image: linear-gradient(var(--primary)/10% 1px,
      transparent 1px),
    linear-gradient(90deg,
      var(--primary)/10% 1px,
      transparent 1px);
  background-size: 20px 20px;
}

.bg-noise-pattern {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.5;
}

.mainContainer {
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, transparent 0%, rgba(var(--primary-rgb), 0.03) 100%);
    pointer-events: none;
  }
  animation: fadeInUp 0.5s ease-out;
}

.progressBar {
  @apply fixed top-0 left-0 right-0 h-1.5 z-50;
  background: linear-gradient(90deg,
      var(--primary) 0%,
      rgba(var(--primary-rgb), 0.8) 50%,
      var(--primary) 100%);
  transform-origin: left;
  box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.3);
}

.imageContainer {
  width: 100%;
  max-width: 256px;
  margin: 0 auto;
  perspective: 1000px;

  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 9999px;
    background: linear-gradient(45deg,
        var(--primary) 0%,
        transparent 50%,
        var(--primary) 100%);
    opacity: 0.5;
    z-index: -1;
    transition: all 0.5s ease;
    animation: rotate 10s linear infinite;
  }

  .imageGlow {
    position: absolute;
    inset: -20px;
    background: radial-gradient(circle at center,
        rgba(var(--primary-rgb), 0.2) 0%,
        transparent 70%);
    opacity: 0;
    transition: opacity 0.5s ease;
    filter: blur(15px);
    z-index: -1;
  }

  &:hover {
    .imageGlow {
      opacity: 1;
    }

    &::before {
      opacity: 0.8;
      filter: blur(3px);
    }
  }
}

.profileImage {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  filter: brightness(1) contrast(1);
  transform-style: preserve-3d;

  &:hover {
    filter: brightness(1.1) contrast(1.1);
    transform: scale(1.02) translateZ(20px);
  }
}

.enhancedSeparator {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(90deg,
        transparent,
        rgba(var(--primary-rgb), 0.4),
        transparent);
    animation: shimmer 3s infinite;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

// Parallax container adjustments
.landing-container {
  // ...existing styles...
  overflow: hidden;
}

// Cursor animation
@keyframes cursorAnimation {
  from {
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    transform: translate(-50%, -50%) scale(1.5);
  }
}

.custom-cursor {
  animation: cursorAnimation 0.5s infinite alternate;
}
```

---

</SwmSnippet>

<SwmSnippet path="/app/page.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Links from "@/components/Links";
import { Separator } from "@/components/ui/separator";
import LandingTitle from "@/components/LandingTitle";
import ParticlesBackground from "@/components/ParticlesBackground";
import {
	motion,
	useScroll,
	useSpring,
	useTransform,
	AnimatePresence,
} from "framer-motion";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import styles from "./page.module.scss";
import Tilt from "@/components/Tilt";
import { Parallax, ParallaxLayer } from "@react-spring/parallax"; // Add parallax

export default function HomePage() {
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	const isLargeScreen = useMediaQuery("(min-width: 1024px)");
	const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
	const imageOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.4]);
	const imageRotate = useTransform(scrollYProgress, [0, 0.5], [0, -5]);

	// Enhanced animations
	const pageVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.8,
				ease: [0.6, -0.05, 0.01, 0.99],
				staggerChildren: 0.2,
			},
		},
	};

	const imageContainerVariants = {
		hidden: { scale: 0.8, opacity: 0, rotate: -10 },
		visible: {
			scale: 1,
			opacity: 1,
			rotate: 0,
			transition: {
				type: "spring",
				duration: 1,
				bounce: 0.4,
			},
		},
		hover: {
			scale: 1.05,
			rotate: 5,
			transition: { type: "spring", stiffness: 400, damping: 10 },
		},
	};

	const parallaxRef = useRef(null);

	return (
		<Parallax pages={2} ref={parallaxRef}>
			{/* Parallax background layer */}
			<ParallaxLayer offset={0} speed={0}>
				<ParticlesBackground /> {/* Enhanced particle effects */}
			</ParallaxLayer>

			{/* Parallax foreground content */}
			<ParallaxLayer offset={0} speed={0.3}>
				<motion.div
					className={cn(
						"landing-container",
						"min-h-screen w-full",
						"md:h-screen", // Keep this
						"bg-gradient-to-b from-background via-background/95 to-background/90",
						"dark:from-background dark:via-background/95 dark:to-background/90",
						"overflow-hidden isolate",
						"relative"
					)}
				>
					<motion.div 
						className="orb w-[40rem] h-[40rem] -left-48 top-1/4"
						animate={{
							y: [0, 50, 0],
							opacity: [0.3, 0.5, 0.3],
							scale: [1, 1.2, 1],
						}}
						transition={{
							duration: 10,
							repeat: Infinity,
							ease: "easeInOut"
						}}
					/>
					<motion.div 
						className="orb w-[40rem] h-[40rem] -right-48 bottom-1/4"
						animate={{
							y: [0, -50, 0],
							opacity: [0.3, 0.5, 0.3],
							scale: [1.2, 1, 1.2],
						}}
						transition={{
							duration: 12,
							repeat: Infinity,
							ease: "easeInOut"
						}}
					/>
					<motion.div className={styles.progressBar} style={{ scaleX }} />

					<motion.div
						ref={ref}
						className={cn(
							"relative z-10 flex flex-col",
							"min-h-screen md:h-screen", // Keep full height
							"px-4 sm:px-6 lg:px-8",
							"py-12 sm:py-16 lg:py-20",
							"max-w-7xl mx-auto w-full",
							"backdrop-blur-sm"
						)}
					>
						<AnimatePresence mode="wait">
							<motion.div
								className={cn(
									"flex flex-col items-center justify-center",
									"h-full",
									// Add padding controls for medium+ screens
									"md:py-12 lg:py-16", // Reduced vertical padding
									// Add max-height control for medium+ screens
									"md:max-h-[800px] lg:max-h-[900px]", // Limit maximum height
									// Adjust spacing between elements
									"space-y-8 md:space-y-10 lg:space-y-12" // Reduced spacing
								)}
								variants={{
									hidden: { opacity: 0 },
									visible: { opacity: 1 },
								}}
							>
								<motion.div
									className={cn(
										styles.imageContainer,
										"relative group",
										"w-48 h-48 md:w-40 md:h-40 lg:w-48 lg:h-48" // Control image size
									)}
									variants={imageContainerVariants}
									whileHover="hover"
									style={{
										scale: imageScale,
										opacity: imageOpacity,
										rotate: imageRotate,
									}}
								>
									<div className={styles.imageGlow} />
									<Tilt>
										<Image
											className={cn(
												"rounded-full shadow-2xl transition-all duration-300",
												"border-4 border-white/90 dark:border-gray-800/90",
												styles.profileImage
											)}
											src="/logo.webp"
											alt="Logo — Wyatt Walsh"
											width={256}
											height={256}
											priority
											quality={100}
										/>
									</Tilt>
								</motion.div>

								<LandingTitle />

								<motion.div
									variants={{
										hidden: { opacity: 0, y: 20 },
										visible: {
											opacity: 1,
											y: 0,
											transition: { duration: 0.5, delay: 0.4 },
										},
									}}
									className={cn(
										"w-full",
										"flex items-center justify-center", // Add this line
										"max-w-[1200px] md:max-w-[90%] lg:max-w-[85%]"
									)}
								>
									<Links />
								</motion.div>
							</motion.div>
						</AnimatePresence>
					</motion.div>
				</motion.div>
			</ParallaxLayer>

			{/* Additional parallax layer for Links */}
			<ParallaxLayer offset={1} speed={0.5}>
				<motion.div
					className={cn(
						"w-full",
						"flex items-center justify-center", // Add this line
						"max-w-[1200px] md:max-w-[90%] lg:max-w-[85%]"
					)}
				>
					<Links />
				</motion.div>
			</ParallaxLayer>
		</Parallax>
	);
}

```

---

</SwmSnippet>

<SwmSnippet path="/app/variables.module.scss" line="1">

---

&nbsp;

```scss
// variables.module.scss

// Base Colors
$color-hue: 198;
$color-saturation: 33.6%;
$color-lightness: 56.3%;
$foreground-lightness-light: 0%;
$foreground-lightness-dark: 90%;
$background-lightness-light: 95%;
$background-lightness-dark: 5%;

// Shadows
$shadow-glow: 0 0 15px rgba(59, 130, 246, 0.5);
$shadow-soft-light: 0 10px 25px rgba(0, 0, 0, 0.1);
$shadow-soft-dark: 0 10px 25px rgba(0, 0, 0, 0.5);

// Fonts
$font-sans: 'Montserrat',
sans-serif;
$font-display: 'Oswald',
sans-serif;
$font-code: 'Fira Code',
monospace;

// Gradients
$gradient-background-light: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
$gradient-background-dark: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$gradient-text-light: linear-gradient(90deg, #1a56db 0%, #7c3aed 100%);
$gradient-text-dark: linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%);
$gradient-border-light: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
$gradient-border-dark: linear-gradient(90deg, #667eea 0%, #764ba2 100%);

// Math controls
$math-controls-text: hsl(215, 20.2%, 65.1%);
$math-controls-text-hover: hsl(222.2, 47.4%, 11.2%);
$math-controls-bg: hsla(210, 40%, 98%, 0.9);
$math-controls-hover: hsla(210, 40%, 95%, 1);

// Ensure math controls variables are properly set
$math-controls-bg: hsla(210, 40%, 98%, 0.95);
$math-controls-text: hsl(215.4, 16.3%, 46.9%);

// New Math component variables
$math-text-color: hsl(222, 47%, 11%); // Slate-900
$math-index-color: hsl(215, 20%, 65%); // Slate-500
$math-inline-bg: hsla(210, 40%, 98%, 0.9);
$math-display-bg: hsla(210, 40%, 98%, 0.95);
$math-display-number: hsl(215, 20%, 65%); // Slate-500
$math-display-number-hover: hsl(222.2, 47.4%, 11.2%); // Slate-900

// Light Mode Variables
@use 'sass:map';

// Light Mode Math Colors
$light-math-colors: (
  'math-bg': '245 247 250',  // RGB format
  'math-bg-transparent': '245 247 250',
  'math-border': 'hsla(214.3, 31.8%, 91.4%, 0.6)',
  'math-controls-text': '100 116 139', // slate-500
  'math-controls-text-hover': '15 23 42', // slate-900
);

// Dark Mode Math Colors
$dark-math-colors: (
  'math-bg': '17 19 23',  // RGB format
  'math-bg-transparent': '17 19 23',
  'math-border': 'hsla(217.2, 32.6%, 17.5%, 0.6)',
  'math-controls-text': '148 163 184', // slate-400
  'math-controls-text-hover': '241 245 249', // slate-100
);

$light-math-colors: (
  'math-bg': '245 247 250',  // RGB values without rgb() wrapper
  'math-bg-transparent': '245 247 250',
  'math-border': 'hsla(214.3, 31.8%, 91.4%, 0.6)',
  'math-shadow': '0 4px 16px rgba(0, 0, 0, 0.06)',
  'math-hover-shadow': '0 8px 30px rgba(59, 130, 246, 0.15)',
  'math-equation-bg': hsla(210, 40%, 98%, 0.9),
  'math-controls-bg': 'hsla(210, 40%, 98%, 0.95)',
  'math-controls-hover': 'hsla(210, 40%, 95%, 1)',
  'math-controls-text': '100 116 139', // RGB values for slate-500
  'math-controls-text-hover': '15 23 42', // RGB values for slate-900
);

// Dark Mode Variables
$dark-math-colors: (
  'math-bg': '17 19 23',  // RGB values without rgb() wrapper
  'math-bg-transparent': '17 19 23',
  'math-border': 'hsla(217.2, 32.6%, 17.5%, 0.6)',
  'math-shadow': '0 4px 16px rgba(0, 0, 0, 0.3)',
  'math-hover-shadow': '0 8px 30px rgba(59, 130, 246, 0.25)',
  'math-equation-bg': hsla(222.2, 84%, 4.9%, 0.8),
  'math-controls-bg': 'hsla(222.2, 84%, 4.9%, 0.9)',
  'math-controls-hover': 'hsla(222.2, 84%, 4.9%, 1)',
  'math-controls-text': '148 163 184', // RGB values for slate-400
  'math-controls-text-hover': '241 245 249', // RGB values for slate-100
);

// Add new enhanced gradient variables
$enhanced-gradients: (
  'primary': (
    'light': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
    'dark': 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)'
  ),
  'accent': (
    'light': 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
    'dark': 'linear-gradient(135deg, #f9a8d4 0%, #f472b6 50%, #ec4899 100%)'
  )
);

// Add new animation timing variables
$animation-timing: (
  'fast': 200ms,
  'normal': 300ms,
  'slow': 500ms,
  'very-slow': 1000ms
);

// New Color Variables
$primary-color: #0ea5e9;
$accent-color: #a855f7;
$secondary-color: #4f46e5;

// New Gradient Variables
$gradient-primary: linear-gradient(90deg, $primary-color 0%, $accent-color 100%);
$gradient-secondary: linear-gradient(90deg, $secondary-color 0%, $primary-color 100%);

// New Animation Variables
$animation-duration-fast: 0.5s;
$animation-duration-slow: 3s;

// Light Theme Variables
@mixin light {
  --primary-rgb: 59, 130, 246; // Add this if not present
  --primary: rgb(var(--primary-rgb));
  --background: hsl(198 100% 95%);
  --foreground: hsl(198 5% 0%);
  --primary: hsl(198 33.6% 56.3%);
  --primary-foreground: hsl(0, 0%, 100%);
  --secondary: hsl(198 30% 70%);
  --secondary-foreground: hsl(0, 0%, 0%);
  --accent: hsl(160, 30%, 80%);
  --accent-foreground: hsl(#{$color-hue}, 5%, 10%);
  --destructive: hsl(0, 100%, 30%);
  --destructive-foreground: hsl(#{$color-hue}, 5%, 90%);
  --border: hsl(198 30% 50%);
  --input: hsl(198 30% 18%);
  --ring: hsl(198 33.6% 56.3%);
  --radius: 0.5rem;

  --card: hsl(198 50% 90%);
  --card-foreground: hsl(198 5% 10%);
  --popover: hsl(#{$color-hue}, 100%, 95%);
  --popover-foreground: hsl(#{$color-hue}, 100%, 0%);
  --muted: hsl(160 30% 85%);
  --muted-foreground: hsl(198 5% 35%);

  --font-sans: #{$font-sans};
  --font-display: #{$font-display};
  --font-code: #{$font-code};

  --gradient-background: #{$gradient-background-light};
  --gradient-text: #{$gradient-text-light};
  --gradient-heading: linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%);
  --gradient-separator: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  --gradient-border: #{$gradient-border-light};

  --shadow-glow: 0 0 15px rgba(59, 130, 246, 0.3);
  --shadow-soft: #{$shadow-soft-light};

  --glitch-color1: rgba(255, 0, 255, 0.8); // Enhanced Magenta
  --glitch-color2: rgba(0, 255, 255, 0.8); // Enhanced Cyan
  --glitch-color3: rgba(255, 255, 0, 0.8); // Enhanced Yellow
  --glitch-color4: rgba(0, 255, 0, 0.8); // Enhanced Green
  --glitch-shadow: rgba(62, 184, 229, 0.7); // Light blue glow
  --glitch-text-base: #000;
  --glitch-blur: 0.75px;
  --glitch-noise-opacity: 0.15;
  --glitch-gap: 0.25;

  --separator-shadow-color1: #2563eb;
  --separator-shadow-color2: #9333ea;
  --separator-pulse-color1: #2563eb;
  --separator-pulse-color2: rgba(37, 99, 235, 0.5);
  --separator-pulse-color3: #9333ea;
  --separator-pulse-color4: rgba(147, 51, 234, 0.5);

  --gradient-header-overlay: linear-gradient(to bottom,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.6) 100%);
  --shadow-header: 0 4px 30px rgba(0, 0, 0, 0.1);

  --border-muted: hsl(214.3, 31.8%, 85%);

  // Code block colors
  --code-bg: hsl(210, 40%, 98%);
  --code-fg: hsl(222.2, 84%, 4.9%);
  --code-border: hsl(214.3, 31.8%, 91.4%);
  --code-line-highlight: hsl(210, 40%, 90%);
  --code-line-number: hsl(215.4, 16.3%, 46.9%);

  // Math specific variables
  --math-bg: hsla(210, 40%, 98%, 0.95);
  --math-bg-transparent: hsla(210, 40%, 98%, 0.4);
  --math-border: hsla(214.3, 31.8%, 91.4%, 0.6);
  --math-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  --math-hover-shadow: 0 8px 30px rgba(59, 130, 246, 0.15);
  --math-equation-bg: hsla(210, 40%, 98%, 0.9);

  --glitch-shadow-1: 2px 2px #ff00c1, -2px -2px #00fff9;
  --glitch-shadow-2: 3px 3px #ff00c1, -3px -3px #00fff9;
  --glitch-shadow-3: 1px 1px #ff00c1, -1px -1px #00fff9;
  --glitch-color-1: #ff00c1;
  --glitch-color-2: #00fff9;

  --math-controls-bg: hsla(210, 40%, 98%, 0.95);
  --math-controls-hover: hsla(210, 40%, 95%, 1);
  --math-controls-text: hsl(215.4, 16.3%, 46.9%);
  --math-controls-text-hover: hsl(222.2, 47.4%, 11.2%);
  --math-display-number: hsl(215, 20%, 65%);
  --math-display-number-hover: hsl(215, 20%, 40%);

  // Enhanced 404 page variables
  --cyber-grid-color: rgba(59, 130, 246, 0.1);
  --cyber-grid-size: 30px;
  --glitch-blur-intensity: 2px;
  --noise-intensity: 0.1;
  --scan-line-color: rgba(0, 0, 0, 0.1);

  // Typography
  --heading-color: hsl(198 5% 10%);
  --heading-color-hover: hsl(198 33.6% 56.3%);
  --text-color: hsl(198 5% 20%);
  --text-color-muted: hsl(198 5% 40%);
  --link-color: var(--primary);
  --link-color-hover: var(--primary-foreground);
  --code-bg: hsl(210 40% 96%);
  --code-color: hsl(198 5% 20%);
  --blockquote-bg: hsl(210 40% 96.1%);
  --blockquote-color: hsl(198 5% 40%);
  --blockquote-border: var(--primary);

  --card-gradient-from: rgba(255, 255, 255, 0.8);
  --card-gradient-to: rgba(255, 255, 255, 0.3);
  --card-border: rgba(255, 255, 255, 0.5);
  --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  --card-hover-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

  @each $name, $value in $light-math-colors {
    --#{$name}: #{$value};
  }

  // Header specific colors
  --post-header-gradient-from: rgb(255, 255, 255);
  --post-header-gradient-via: rgb(249, 250, 251);
  --post-header-gradient-to: rgb(243, 244, 246);
  --post-header-border: rgb(229, 231, 235);
  --post-header-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --post-header-hover-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.05);
  --post-header-image-overlay: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.8) 100%
  );

  // Back link specific colors
  --back-link-bg: rgba(255, 255, 255, 0.8);
  --back-link-hover-bg: rgba(255, 255, 255, 0.95);
  --back-link-border: rgba(229, 231, 235, 0.5);
  --back-link-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
  --back-link-hover-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.05);

  --subtitle-gradient-start: #3b82f6;
  --subtitle-gradient-end: #ec4899;

  // Selection colors
  --selection-bg: hsl(321, 100%, 78%, 0.2); // Soft pink
  --selection-text: hsl(321, 100%, 45%); // Deep pink
  --selection-heading-bg: hsl(262, 100%, 78%, 0.25); // Soft purple
  --selection-heading-text: hsl(262, 100%, 45%); // Deep purple

  // Add scrollbar colors
  --math-controls-text: 100, 116, 139; // RGB values for slate-500
  --math-controls-text-hover: 15, 23, 42; // RGB values for slate-900

  --background-rgb: 255, 255, 255; // Light mode
  --background: rgb(var(--background-rgb));
}

// Dark Theme Variables
@mixin dark {
  --primary-rgb: 59, 130, 246; // Add this if not present
  --primary: rgb(var(--primary-rgb));
  --background: hsl(198 50% 5%);
  --foreground: hsl(198 5% 90%);
  --primary: hsl(198 33.6% 56.3%);
  --primary-foreground: hsl(0, 0%, 100%);
  --secondary: hsl(#{$color-hue}, 30%, 10%);
  --secondary-foreground: hsl(0, 0%, 100%);
  --accent: hsl(217.2, 32.6%, 20%);
  --accent-foreground: hsl(210, 40%, 98%);
  --destructive: hsl(0, 100%, 30%);
  --destructive-foreground: hsl(#{$color-hue}, 5%, 90%);
  --border: hsl(198 30% 18%);
  --input: hsl(198 30% 18%);
  --ring: hsl(198 33.6% 56.3%);
  --radius: 0.5rem;

  --card: hsl(198 50% 0%);
  --card-foreground: hsl(198 5% 90%);
  --popover: hsl(#{$color-hue}, 50%, 5%);
  --popover-foreground: hsl(#{$color-hue}, 5%, 90%);
  --muted: hsl(160 30% 15%);
  --muted-foreground: hsl(198 5% 60%);

  --font-sans: #{$font-sans};
  --font-display: #{$font-display};
  --font-code: #{$font-code};

  --gradient-background: #{$gradient-background-dark};
  --gradient-text: #{$gradient-text-dark};
  --gradient-heading: linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #f472b6 100%);
  --gradient-separator: linear-gradient(90deg, #0fd850 0%, #f9f047 100%);
  --gradient-border: #{$gradient-border-dark};

  --shadow-glow: 0 0 15px rgba(59, 130, 246, 0.5);
  --shadow-soft: #{$shadow-soft-dark};

  --glitch-color1: rgba(255, 0, 255, 0.9); // Enhanced Brighter Magenta
  --glitch-color2: rgba(0, 255, 255, 0.9); // Enhanced Brighter Cyan
  --glitch-color3: rgba(255, 255, 0, 0.9); // Enhanced Brighter Yellow
  --glitch-color4: rgba(0, 255, 0, 0.9); // Enhanced Brighter Green
  --glitch-shadow: rgba(80, 200, 245, 0.8); // Bright blue glow
  --glitch-text-base: #fff;
  --glitch-blur: 1px;
  --glitch-noise-opacity: 0.2;
  --glitch-gap: 0.5;

  --separator-shadow-color1: #3b82f6;
  --separator-shadow-color2: #6366f1;
  --separator-pulse-color1: #3b82f6;
  --separator-pulse-color2: rgba(59, 130, 246, 0.5);
  --separator-pulse-color3: #6366f1;
  --separator-pulse-color4: rgba(99, 102, 241, 0.5);

  --gradient-header-overlay: linear-gradient(to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.2) 50%,
      rgba(0, 0, 0, 0.6) 100%);
  --shadow-header: 0 4px 30px rgba(0, 0, 0, 0.3);

  --border-muted: hsl(217.2, 32.6%, 25%);

  // Code block colors
  --code-bg: hsl(222.2, 84%, 6.9%);
  --code-fg: hsl(210, 40%, 98%);
  --code-border: hsl(217.2, 32.6%, 17.5%);
  --code-line-highlight: hsl(217.2, 32.6%, 12%);
  --code-line-number: hsl(215, 20.2%, 65.1%);

  // Math specific variables
  --math-bg: hsla(222.2, 84%, 4.9%, 0.8);
  --math-bg-transparent: hsla(222.2, 84%, 4.9%, 0.4);
  --math-border: hsla(217.2, 32.6%, 17.5%, 0.6);
  --math-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  --math-hover-shadow: 0 8px 30px rgba(59, 130, 246, 0.25);
  --math-equation-bg: hsla(222.2, 84%, 4.9%, 0.8);

  --glitch-shadow-1: 2px 2px #ff00ea, -2px -2px #00ffff;
  --glitch-shadow-2: 3px 3px #ff00ea, -3px -3px #00ffff;
  --glitch-shadow-3: 1px 1px #ff00ea, -1px -1px #00ffff;
  --glitch-color-1: #ff00ea;
  --glitch-color-2: #00ffff;

  --math-controls-bg: hsla(222.2, 84%, 4.9%, 0.9);
  --math-controls-hover: hsla(222.2, 84%, 4.9%, 1);
  --math-controls-text: hsl(215, 20.2%, 65.1%);
  --math-controls-text-hover: hsl(210, 40%, 98%);
  --math-display-number: hsl(215, 20%, 65%);
  --math-display-number-hover: hsl(215, 20%, 90%);

  // Enhanced 404 page variables
  --cyber-grid-color: rgba(59, 130, 246, 0.2);
  --cyber-grid-size: 30px;
  --glitch-blur-intensity: 3px;
  --noise-intensity: 0.15;
  --scan-line-color: rgba(255, 255, 255, 0.1);

  --link-color-hover: var(--primary-foreground);
  --code-bg: hsl(198 50% 10%);
  --code-color: hsl(198 5% 80%);
  --blockquote-bg: hsl(198 50% 7%);
  --blockquote-color: hsl(198 5% 65%);
  --blockquote-border: var(--primary);

  --card-gradient-from: rgba(30, 30, 30, 0.8);
  --card-gradient-to: rgba(20, 20, 20, 0.3);
  --card-border: rgba(255, 255, 255, 0.1);
  --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  --card-hover-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);

  @each $name, $value in $dark-math-colors {
    --#{$name}: #{$value};
  }

  // Header specific colors
  --post-header-gradient-from: rgb(17, 24, 39);
  --post-header-gradient-via: rgb(31, 41, 55);
  --post-header-gradient-to: rgb(55, 65, 81);
  --post-header-border: rgb(75, 85, 99);
  --post-header-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.5),
    0 2px 4px -2px rgba(0, 0, 0, 0.4);
  --post-header-hover-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.5),
    0 8px 10px -6px rgba(0, 0, 0, 0.4);
  --post-header-image-overlay: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.9) 100%
  );

  // Back link specific colors
  --back-link-bg: rgba(17, 24, 39, 0.8);
  --back-link-hover-bg: rgba(31, 41, 55, 0.95);
  --back-link-border: rgba(75, 85, 99, 0.5);
  --back-link-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.3);
  --back-link-hover-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2);

  --subtitle-gradient-start: #60a5fa;
  --subtitle-gradient-end: #f472b6;

  // Selection colors
  --selection-bg: hsl(321, 90%, 65%, 0.2); // Bright pink
  --selection-text: hsl(321, 90%, 75%); // Light pink
  --selection-heading-bg: hsl(262, 90%, 65%, 0.25); // Bright purple
  --selection-heading-text: hsl(262, 90%, 75%); // Light purple

  // Add scrollbar colors
  --math-controls-text: 148, 163, 184; // RGB values for slate-400
  --math-controls-text-hover: 241, 245, 249; // RGB values for slate-100
  --background-rgb: 17, 17, 17; // Dark mode
  --background: rgb(var(--background-rgb));
}
```

---

</SwmSnippet>

<SwmSnippet path="/tailwind.config.ts" line="1">

---

&nbsp;

```typescript
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';
import { ThemeConfig } from 'tailwindcss/types/config';
import { PluginAPI } from 'tailwindcss/types/config';

// Update the function definition to match Tailwind's expected types
function withOpacityValue(variable: string) {
  return ({ opacityValue }: { opacityValue: number | undefined }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
 
  addBase({
    ":root": newVars,
  });
}

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{html,js,jsx,ts,tsx,md,mdx,css,scss}',
    './components/**/*.{html,js,jsx,ts,tsx,md,mdx,css,scss}',
    './app/globals.scss',
    './app/variables.module.scss',
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: withOpacityValue('--background'),
        foreground: withOpacityValue('--foreground'),
        primary: {
          DEFAULT: withOpacityValue('--primary'),
          foreground: withOpacityValue('--primary-foreground'),
          20: 'rgb(var(--primary-rgb) / 0.2)',
          30: 'rgb(var(--primary-rgb) / 0.3)',
        },
        'primary-foreground': withOpacityValue('--primary-foreground'),
        secondary: withOpacityValue('--secondary'),
        'secondary-foreground': withOpacityValue('--secondary-foreground'),
        accent: {
          DEFAULT: withOpacityValue('--accent'),
          foreground: withOpacityValue('--accent-foreground'),
          '20': 'rgb(var(--accent-rgb) / 0.2)',
          '40': 'rgb(var(--accent-rgb) / 0.4)',
        },
        'accent-foreground': withOpacityValue('--accent-foreground'),
        destructive: withOpacityValue('--destructive'),
        'destructive-foreground': withOpacityValue('--destructive-foreground'),
        muted: withOpacityValue('--muted'),
        'muted-foreground': withOpacityValue('--muted-foreground'),
        card: withOpacityValue('--card'),
        'card-foreground': withOpacityValue('--card-foreground'),
        popover: withOpacityValue('--popover'),
        'popover-foreground': withOpacityValue('--popover-foreground'),
        border: withOpacityValue('--border'),
        input: withOpacityValue('--input'),
        ring: withOpacityValue('--ring'),
        'border-muted': 'var(--border-muted)',
        'math-bg': 'rgb(var(--math-bg) / <alpha-value>)',
        'math-bg-transparent': 'rgb(var(--math-bg-transparent) / <alpha-value>)',
        'math-border': 'rgb(var(--math-border) / <alpha-value>)',
        'math-controls-bg': 'var(--math-controls-bg)',
        'math-controls-hover': 'var(--math-controls-hover)',
        'math-controls-text': 'rgb(var(--math-controls-text) / <alpha-value>)',
        'math-controls-text-hover': 'rgb(var(--math-controls-text-hover) / <alpha-value>)',
        'math-inline': `rgb(var(--math-bg-transparent) / <alpha-value>)`,
        'math-text-color': 'var(--math-text-color)',
        'math-index-color': 'var(--math-index-color)',
        'math-inline-bg': 'var(--math-inline-bg)',
        'math-display-bg': 'var(--math-display-bg)',
        'math-display-number': 'var(--math-display-number)',
        'math-display-number-hover': 'var(--math-display-number-hover)',
        'post-header': {
          'gradient-from': 'var(--post-header-gradient-from)',
          'gradient-via': 'var(--post-header-gradient-via)',
          'gradient-to': 'var(--post-header-gradient-to)',
          'border': 'var(--post-header-border)',
        },
        'back-link': {
          'bg': 'var(--back-link-bg)',
          'hover-bg': 'var(--back-link-hover-bg)',
          'border': 'var(--back-link-border)',
        },
        // Add selection colors
        'selection-bg': 'var(--selection-bg)',
        'selection-text': 'var(--selection-text)',
        'selection-heading-bg': 'var(--selection-heading-bg)',
        'selection-heading-text': 'var(--selection-heading-text)',
        'math-scrollbar': {
          DEFAULT: 'rgb(var(--math-controls-text) / 0.2)',
          hover: 'rgb(var(--math-controls-text) / 0.3)',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
        soft: 'var(--shadow-soft)',
        'header': 'var(--shadow-header)',
        'math': 'var(--math-shadow)',
        'math-hover': 'var(--math-hover-shadow)',
        'post-header': 'var(--post-header-shadow)',
        'post-header-hover': 'var(--post-header-hover-shadow)',
        'back-link': 'var(--back-link-shadow)',
        'back-link-hover': 'var(--back-link-hover-shadow)',
        neon: "0 0 10px var(--neon-color)",
      },
      borderRadius: {
        xl: 'var(--radius)',
      },
      backgroundImage: {
        'gradient-background': 'var(--gradient-background)',
        'gradient-text': 'var(--gradient-text)',
        'gradient-heading': 'var(--gradient-heading)',
        'gradient-separator': 'var(--gradient-separator)',
        'header-overlay': 'var(--gradient-header-overlay)',
        'gradient-border': 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
        'pagination-gradient': 'linear-gradient(135deg, var(--card-gradient-from), var(--card-gradient-to))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        fadeIn: 'fadeIn 1s forwards',
        float: 'float 4s ease-in-out infinite',
        glitch: 'glitch 2s ease-in-out infinite',
        gradient: 'gradient 8s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        rotateCube: "rotateCube 2s infinite linear",
        'code-blink': 'code-blink 1s ease-in-out infinite',
        'glitch-text': 'glitch 2.5s infinite',
        'glitch-skew': 'glitch-skew 2s infinite',
        'glitch-clip': 'glitch-clip 3s infinite linear alternate-reverse',
        'card-hover': 'card-hover 0.3s ease-in-out forwards',
        'card-float': 'card-float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'title-glow': 'title-glow 2s ease-in-out infinite alternate',
        'float-smooth': 'float-smooth 6s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'subtitle-fade': 'subtitleFade 0.5s ease-out forwards',
        'subtitle-slide': 'subtitleSlide 0.5s ease-out forwards',
        'spin-slow': 'spin 10s linear infinite',
        'pulse-fast': 'pulse 1s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        floating: 'floating 6s ease-in-out infinite', // Add this line
        cursor: "cursorAnimation 0.5s infinite alternate",
      },
      keyframes: {
        fadeIn: {
          to: { opacity: '1' },
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        gradientText: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        glitchNoise: {
          '0%': {
            clipPath: 'inset(40% 0 61% 0)',
            transform: 'translate(-20px, -10px)',
          },
          '20%': {
            clipPath: 'inset(92% 0 1% 0)',
            transform: 'translate(20px, 10px)',
          },
          '40%': {
            clipPath: 'inset(43% 0 1% 0)',
            transform: 'translate(-20px, 10px) skewX(3deg)',
          },
          '60%': {
            clipPath: 'inset(25% 0 58% 0)',
            transform: 'translate(20px, -10px) skewX(-3deg)',
          },
          '80%': {
            clipPath: 'inset(54% 0 7% 0)',
            transform: 'translate(-20px, 10px)',
          },
          '100%': {
            clipPath: 'inset(58% 0 43% 0)',
            transform: 'translate(20px, -10px)',
          },
        },
        rotateCube: {
          "0%": {
            transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
          },
          "100%": {
            transform: "rotateX(360deg) rotateY(360deg) rotateZ(360deg)",
          },
        },
        'code-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'glitch': {
          '0%': { 
            textShadow: 'var(--glitch-shadow-1)'
          },
          '2%': { 
            textShadow: 'var(--glitch-shadow-2)'
          },
          '4%': {
            textShadow: 'var(--glitch-shadow-3)'
          },
          '6%': {
            textShadow: 'var(--glitch-shadow-1)'
          },
          '8%': {
            textShadow: 'var(--glitch-shadow-2)'
          },
          '10%, 100%': {
            textShadow: 'none'
          }
        },
        'glitch-skew': {
          '0%': { transform: 'skew(0deg)' },
          '2%': { transform: 'skew(3deg)' },
          '4%': { transform: 'skew(-3deg)' },
          '6%': { transform: 'skew(2deg)' },
          '8%': { transform: 'skew(-1deg)' },
          '10%, 100%': { transform: 'skew(0deg)' }
        },
        'card-hover': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
        'card-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'title-glow': {
          'from': { textShadow: '0 0 20px var(--primary)' },
          'to': { textShadow: '0 0 30px var(--primary), 0 0 10px var(--primary)' }
        },
        'float-smooth': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        subtitleFade: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        subtitleSlide: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: "0", transform: 'translateY(20px)' },
          '100%': { opacity: "1", transform: 'translateY(0)' },
        },
        floating: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        cursorAnimation: {
          "0%": { transform: "translate(-50%, -50%) scale(1)" },
          "100%": { transform: "translate(-50%, -50%) scale(1.5)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        '700': '700ms',
      },
      transitionTimingFunction: {
        'header': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      typography: (theme: (path: string) => string) => ({
        DEFAULT: {
          css: {
            color: 'var(--foreground)',
            maxWidth: '90ch',
            h1: {
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            },
            h2: {
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            },
            h3: {
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            },
            h4: {
              color: 'var(--foreground)', 
              fontFamily: 'var(--font-display)',
            },
            h5: {
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            },
            h6: {
              color: 'var(--foreground)', 
              fontFamily: 'var(--font-display)',
            },
            a: {
              color: 'var(--primary)',
              '&:hover': {
                color: 'var(--primary-foreground)',
              },
            },
            blockquote: {
              borderLeftColor: 'var(--border)',
              color: 'var(--muted-foreground)',
            },
            code: {
              color: 'var(--foreground)',
              backgroundColor: 'var(--muted)',
              borderRadius: '0.25rem',
              padding: '0.2em 0.4em',
              fontWeight: '500',
              fontFamily: 'var(--font-code)',
              fontSize: '0.9em',
              letterSpacing: '-0.025em',
              '&::before': {
                content: '""',
                display: 'none',
              },
              '&::after': {
                content: '""',
                display: 'none',
              }
            },
            hr: {
              borderColor: 'var(--border)',
            },
            strong: {
              color: 'var(--foreground)',
            },
            thead: {
              borderBottomColor: 'var(--border)',
              th: {
                color: 'var(--foreground)',
              }
            },
            tbody: {
              tr: {
                borderBottomColor: 'var(--border)',
              }
            },
            '@screen lg': {
              maxWidth: '100ch',
            },
            '@screen xl': {
              maxWidth: '110ch',
            },
            '@screen 2xl': {
              maxWidth: '120ch',
            },
            'h1,h2,h3,h4,h5,h6': {
              scrollMarginTop: theme('spacing.32'),
            },
            '.math-inline': {
              backgroundColor: 'var(--math-bg-transparent)',
              borderRadius: theme('borderRadius.md'),
              padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            '.katex-display': {
              overflow: 'auto hidden',
              width: '100%',
              textAlign: 'center',
              padding: `${theme('spacing.4')} 0`,
            },
          }
        },
        dark: {
          css: {
            color: theme('colors.foreground'),
            '[class~="lead"]': {
              color: theme('colors.foreground'),
            },
            a: {
              color: theme('colors.primary'),
            },
            strong: {
              color: theme('colors.foreground'),
            },
            'ol > li::before': {
              color: theme('colors.foreground'),
            },
            'ul > li::before': {
              backgroundColor: theme('colors.foreground'),
            },
            hr: {
              borderColor: theme('colors.border'),
            },
            blockquote: {
              color: theme('colors.foreground'),
              borderLeftColor: theme('colors.border'),
            },
            h1: {
              color: theme('colors.foreground'),
            },
            h2: {
              color: theme('colors.foreground'),
            },
            h3: {
              color: theme('colors.foreground'),
            },
            h4: {
              color: theme('colors.foreground'),
            },
            'figure figcaption': {
              color: theme('colors.foreground'),
            },
            code: {
              color: theme('colors.foreground'),
            },
            'a code': {
              color: theme('colors.foreground'),
            },
            pre: {
              color: theme('colors.foreground'),
              backgroundColor: theme('colors.background'),
            },
            thead: {
              color: theme('colors.foreground'),
              borderBottomColor: theme('colors.border'),
            },
            'tbody tr': {
              borderBottomColor: theme('colors.border'),
            },
          },
        },
        lg: {
          css: {
            maxWidth: '100ch',
          },
        },
        xl: {
          css: {
            maxWidth: '110ch',
          },
        },
        '2xl': {
          css: {
            maxWidth: '120ch',
          },
        },
      }),
      opacity: {
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
      backgroundOpacity: {
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
      borderOpacity: {
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
      backgroundColor: {
        'scrollbar-track': 'transparent',
      },
      textShadow: {
        'glow': '0 0 10px var(--primary), 0 0 20px var(--primary)',
        'glow-dark': '0 0 10px var(--primary-foreground), 0 0 20px var(--primary-foreground)',
      },
    },
  },
  future: {
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilitiesByDefault: false,
  },
  plugins: [
    typography,
    addVariablesForColors,
    function({ addUtilities }: PluginAPI) {
      const newUtilities = {
        '.bg-gradient-text': {
          background: 'var(--gradient-text)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-size': '200% 200%',
        },
        '.shadow-soft': {
          boxShadow: 'var(--shadow-soft)',
        },
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
        },
        '.scrollbar-track-transparent': {
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        },
        '.scrollbar-thumb-rounded': {
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
          },
        },
        '.text-shadow-glow': {
          textShadow: '0 0 10px var(--primary), 0 0 20px var(--primary)',
        },
        '.text-shadow-glow-dark': {
          textShadow: '0 0 10px var(--primary-foreground), 0 0 20px var(--primary-foreground)',
        },
        '.scrollbar-math': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--math-controls-text)',
            opacity: '0.2',
          },
          '&:hover::-webkit-scrollbar-thumb': {
            opacity: '0.3',
          },
        },
        // Add custom scrollbar utilities
        '.scrollbar-thumb-math': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgb(var(--math-controls-text) / 0.2)',
          },
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgb(var(--math-controls-text) / 0.3)',
          },
        },
      };
      addUtilities(newUtilities, {
        respectPrefix: true,
        respectImportant: true
      });
    },
    function({ addComponents, theme }: PluginAPI) {
      addComponents({
        '.bg-gradient-glow': {
          backgroundImage: `linear-gradient(to right, ${theme('colors.primary.DEFAULT')}, ${theme('colors.accent.DEFAULT')})`,
          opacity: '0.2',
        },
      });
    },
  ],
};

export default config;
```

---

</SwmSnippet>

<SwmSnippet path="/components/CustomCursor.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import { useEffect } from "react";

export default function CustomCursor() {
  useEffect(() => {
    const cursor = document.querySelector(".custom-cursor") as HTMLElement;

    const onMouseMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    };

    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return <div className="custom-cursor"></div>;
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/DarkModeToggle.tsx" line="1">

---

&nbsp;

```tsx
// components/DarkModeToggle.tsx

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DarkModeToggle() {
	const { theme, setTheme, systemTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const currentTheme = theme === "system" ? systemTheme : theme;

	const renderThemeIcon = () => {
		if (currentTheme === "dark") {
			return <Sun className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-transform duration-300 ease-out text-slate-100 dark:text-slate-900 group-hover:text-amber-300 dark:group-hover:text-amber-500 group-hover:rotate-45" />;
		} else {
			return <Moon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-transform duration-300 ease-out text-slate-100 dark:text-slate-900 group-hover:text-blue-300 dark:group-hover:text-blue-500 group-hover:-rotate-12" />;
		}
	};

	return (
		<div className={cn(
			"fixed z-50",
			// Responsive margins
			"top-2 right-2",        // Small screens
			"sm:top-3 sm:right-3",  // Medium screens
			"md:top-4 md:right-4",  // Large screens
			"lg:top-6 lg:right-6",  // Extra large screens
			// Add padding for touch targets
			"p-1 sm:p-1.5 md:p-2",
			// Optional: add a subtle backdrop on mobile
			"sm:bg-transparent",
			"rounded-full"
		)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							// Base styles
							"h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14",
							"group relative",
							"rounded-full",
							"border-2",
							// Transitions
							"transition-all duration-300 ease-in-out",
							"hover:scale-110 active:scale-95",
							// Light mode
							"bg-slate-800/95 hover:bg-slate-700/95",
							"border-slate-600 hover:border-slate-500",
							"shadow-lg shadow-slate-900/20",
							// Dark mode (mirrored)
							"dark:bg-slate-100/95 dark:hover:bg-slate-200/95",
							"dark:border-slate-300 dark:hover:border-slate-400",
							"dark:shadow-lg dark:shadow-slate-100/20",
							// Glow effect
							"after:absolute after:inset-0 after:rounded-full",
							"after:transition-opacity after:duration-300",
							"after:opacity-0 hover:after:opacity-100",
							"after:bg-slate-400/20 dark:after:bg-slate-600/20"
						)}
					>
						{renderThemeIcon()}
						<span className="sr-only">Toggle theme</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className={cn(
						// Base styles
						"min-w-[120px] sm:min-w-[140px] md:min-w-[160px]",
						"p-2 sm:p-3 md:p-4",
						"rounded-xl border-2",
						"backdrop-blur-md",
						// Animations
						"animate-in fade-in-0 zoom-in-95",
						"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
						// Light mode
						"bg-slate-800/95",
						"border-slate-600",
						"shadow-lg shadow-slate-900/20",
						// Dark mode (mirrored)
						"dark:bg-slate-100/95",
						"dark:border-slate-300",
						"dark:shadow-lg dark:shadow-slate-100/20",
						"mt-2", // Add spacing between trigger and content
						"origin-top-right" // Set transform origin for animations
					)}
				>
					{[
						{ icon: Sun, label: "Light", theme: "light", hoverColors: "group-hover:text-amber-300 dark:group-hover:text-amber-500" },
						{ icon: Moon, label: "Dark", theme: "dark", hoverColors: "group-hover:text-blue-300 dark:group-hover:text-blue-500" },
						{ icon: Laptop, label: "System", theme: "system", hoverColors: "group-hover:text-emerald-300 dark:group-hover:text-emerald-500" },
					].map(({ icon: Icon, label, theme, hoverColors }) => (
						<DropdownMenuItem
							key={theme}
							onClick={() => setTheme(theme)}
							className={cn(
								// Base styles
								"group flex items-center gap-2",
								"w-full rounded-lg",
								"select-none",
								"text-xs sm:text-sm md:text-base",
								"p-2 sm:p-3",
								// Transitions
								"transition-all duration-200 ease-in-out",
								// Light mode
								"text-slate-100 hover:text-white",
								"hover:bg-slate-700/70 active:bg-slate-600/70",
								// Dark mode (mirrored)
								"dark:text-slate-900 dark:hover:text-slate-800",
								"dark:hover:bg-slate-300/70 dark:active:bg-slate-400/70"
							)}
						>
							<Icon 
								className={cn(
									"h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6",
									"transition-colors duration-200",
									// Light mode
									"text-slate-300",
									"group-hover:text-white",
									// Dark mode (mirrored)
									"dark:text-slate-700",
									"dark:group-hover:text-slate-900",
									// Theme-specific colors
									hoverColors
								)}
							/>
							<span>{label}</span>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/LandingTitle.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
	motion,
	useScroll,
	useTransform,
	AnimatePresence,
	useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

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
	"code alchemist",
] as const;

const ANIMATION_INTERVAL = 3000;

const containerVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.7,
			ease: [0.6, -0.05, 0.01, 0.99],
		},
	},
};

const wordVariants = {
	enter: { y: 20, opacity: 0 },
	center: {
		y: 0,
		opacity: 1,
		transition: {
			type: "spring",
			stiffness: 300,
			damping: 30,
		},
	},
	exit: {
		y: -20,
		opacity: 0,
		transition: {
			duration: 0.2,
		},
	},
};

export default function LandingTitle() {
	const prefersReducedMotion = usePrefersReducedMotion();
	const ref = useRef<HTMLDivElement>(null);
	const [wordIndex, setWordIndex] = useState(0);
	const [isHovered, setIsHovered] = useState(false);

	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});

	const opacity = useSpring(
		useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]),
		{ stiffness: 100, damping: 20 }
	);

	const scale = useSpring(
		useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]),
		{ stiffness: 100, damping: 20 }
	);

	useEffect(() => {
		if (isHovered || prefersReducedMotion) return;

		const timer = setInterval(() => {
			setWordIndex((prev) => (prev + 1) % WORDS.length);
		}, ANIMATION_INTERVAL);

		return () => clearInterval(timer);
	}, [isHovered, prefersReducedMotion]);

	const handleMouseEnter = useCallback(() => setIsHovered(true), []);
	const handleMouseLeave = useCallback(() => setIsHovered(false), []);

	return (
		<motion.div
			ref={ref}
			style={{ opacity, scale }}
			className={cn(
				"relative z-10 isolate",
				"py-8 sm:py-12 md:py-16 lg:py-24",
				"px-4 sm:px-6 md:px-8 lg:px-10",
				"flex flex-col items-center",
				"bg-gradient-to-br",
				"from-background/50 via-background/30 to-background/20",
				"dark:from-background/30 dark:via-background/20 dark:to-background/10",
				"backdrop-blur-lg",
				"border-y border-primary/10",
				"dark:border-primary/20",
				"shadow-xl shadow-primary/5",
				"dark:shadow-primary/10",
				"transition-colors duration-300"
			)}
		>
			<motion.h1
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className={cn(
					"relative text-4xl sm:text-5xl md:text-7xl lg:text-8xl",
					"font-bold tracking-tight leading-none py-2",
					"bg-gradient-to-r",
					"from-blue-600 via-purple-600 to-pink-600",
					"dark:from-blue-400 dark:via-purple-400 dark:to-pink-400",
					"bg-clip-text text-transparent",
					"transition-all duration-700",
					"hover:scale-[1.02]",
					"cursor-default select-none",
					"animate-title-glow",
					"[text-shadow:0_0_30px_var(--primary-rgb,0,0,0,0.2)]",
					"dark:[text-shadow:0_0_30px_var(--primary-rgb,255,255,255,0.2)]"
				)}
			>
				Wyatt Walsh
			</motion.h1>

			<AnimatePresence mode="wait">
				<motion.div
					key={wordIndex}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					className={cn(
						"subtitle-container",
						"w-full max-w-[90vw] sm:max-w-2xl",
						"perspective-1000",
						"px-4 sm:px-0"
					)}
				>
					<motion.p
						variants={wordVariants}
						initial="enter"
						animate="center"
						exit="exit"
						className={cn(
							"mt-4 sm:mt-6",
							"text-xl sm:text-2xl md:text-3xl",
							"font-light text-center",
							"bg-gradient-to-r",
							"from-blue-500/90 via-purple-500/90 to-pink-500/90",
							"dark:from-blue-300/90 dark:via-purple-300/90 dark:to-pink-300/90",
							"bg-clip-text text-transparent",
							"glitch-text",
							"transition-colors duration-300"
						)}
						data-text={WORDS[wordIndex]}
					>
						{WORDS[wordIndex]}
					</motion.p>
				</motion.div>
			</AnimatePresence>

			<div
				className={cn(
					"cyber-grid absolute inset-0",
					"opacity-5 dark:opacity-10",
					"transition-opacity duration-300"
				)}
			/>

			<div
				className={cn(
					"glitch-scanlines absolute inset-0",
					"pointer-events-none",
					"opacity-[0.015] dark:opacity-[0.03]",
					"transition-opacity duration-300"
				)}
			/>
		</motion.div>
	);
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/Links.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import SocialLink from "./SocialLink";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  faCodepen,
  faGithub,
  faKaggle,
  faLinkedin,
  faReddit,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faBook, faEnvelope } from "@fortawesome/free-solid-svg-icons";

export const links = [
  {
    name: "GitHub",
    url: "https://www.github.com/wyattowalsh",
    icon: faGithub,
    color: "#181717",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/wyattowalsh",
    icon: faLinkedin,
    color: "#0A66C2",
  },
  {
    name: "X",
    url: "https://www.x.com/wyattowalsh",
    icon: faXTwitter,
    color: "#000000",
  },
  {
    name: "Reddit",
    url: "https://www.reddit.com/user/onelonedatum",
    icon: faReddit,
    color: "#FF4500",
  },
  {
    name: "Blog",
    url: "/blog",
    icon: faBook,
  },
  {
    name: "Kaggle",
    url: "https://www.kaggle.com/wyattowalsh",
    icon: faKaggle,
    color: "#20BEFF",
  },
  {
    name: "CodePen",
    url: "https://codepen.io/wyattowalsh",
    icon: faCodepen,
    color: "#000000",
  },
  {
    name: "Email",
    url: "mailto:mail@w4wdev.com",
    icon: faEnvelope,
  },
].map((link) => ({
  ...link,
  color: link.color || "#6a9fb5",
}));

export default function Links() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Faster stagger
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "links-container",
        "glassmorphism", // Apply glassmorphism style
        "neon-border",    // Add neon border
        // Grid layout
        "grid grid-cols-2 sm:grid-cols-4",
        "gap-2 sm:gap-3 md:gap-4", // Reduced gaps
        "w-full max-w-3xl mx-auto", // Smaller max-width
        "px-2 sm:px-3 md:px-4", // Reduced padding
        
        // Container styling
        "relative z-10",
        "rounded-xl",
        "bg-white/30 dark:bg-black/20",
        "backdrop-blur-xl",
        "border border-white/30 dark:border-white/10",
        "shadow-xl shadow-black/5 dark:shadow-white/5",
        
        // Padding and height
        "p-2 sm:p-3 md:p-4",
        "h-auto", // Let height be determined by content
        
        // Hover effects
        "hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/20",
        "transition-all duration-500",
        
        // Glass morphism enhancements
        "before:absolute before:inset-0 before:-z-10",
        "before:bg-gradient-to-br before:from-white/10 before:to-white/5",
        "dark:before:from-white/5 dark:before:to-transparent",
        "before:rounded-xl before:backdrop-blur-2xl"
      )}
    >
      {links.map((link) => (
        <motion.div
          key={link.name}
          variants={itemVariants}
          whileHover={{ scale: 1.05, rotate: 2 }}
          className="link-card"
        >
          <SocialLink link={link} />
        </motion.div>
      ))}
    </motion.div>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/ParticleControls.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Settings, Play, Pause, RefreshCw } from "lucide-react";
import { getAllConfigUrls } from "./particles/particlesConfig";

interface ParticleControlsProps {
	onThemeChange: (theme: string) => void;
	onPause: () => void;
	onResume: () => void;
	onRefresh: () => void;
	isPaused: boolean;
	currentTheme: string;
}

export default function ParticleControls({
	onThemeChange,
	onPause,
	onResume,
	onRefresh,
	isPaused,
	currentTheme,
}: ParticleControlsProps) {
	const [isOpen, setIsOpen] = useState(false);
	const themes = getAllConfigUrls(currentTheme as "light" | "dark");

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
					{themes.map((theme) => (
						<button
							key={theme}
							onClick={() => onThemeChange(theme)}
							className={cn(
								"px-4 py-2 rounded-md",
								"text-sm font-medium",
								"transition-colors duration-200",
								"hover:bg-primary/10 dark:hover:bg-primary/20",
								theme === currentTheme && "bg-primary/20 dark:bg-primary/30"
							)}
						>
							{theme.split("/").pop()?.split(".")[0]}
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

```

---

</SwmSnippet>

<SwmSnippet path="/components/SocialLink.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const radius = 500;
  
  // Enhanced lighting effect
  const background = useMotionTemplate`
    radial-gradient(
      ${radius}px circle at var(--mouse-x) var(--mouse-y),
      ${theme === 'dark' ? `${link.color}15` : `${link.color}20`} 0%,
      transparent 65%
    )
  `;

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        // Base card structure
        "group relative isolate",
        "flex flex-col items-center justify-center gap-2", // Reduced gap
        "w-full h-full p-3 sm:p-4", // Reduced padding
        "overflow-hidden",
        
        // Glass effect
        "bg-gradient-to-br",
        "from-white/40 to-white/10",
        "dark:from-white/10 dark:to-transparent",
        "backdrop-blur-md",
        
        // Border and shadow
        "rounded-lg",
        "border border-white/20 dark:border-white/10",
        "shadow-lg shadow-black/5 dark:shadow-white/5",
        
        // Hover effects
        "hover:border-primary/30 dark:hover:border-primary/20",
        "hover:shadow-xl hover:bg-white/50",
        "dark:hover:bg-white/5",
        
        // Transitions
        "transform-gpu",
        "transition-all duration-300",
        
        // Interactive states
        "hover:-translate-y-0.5",
        "active:translate-y-0",
        "hover:scale-[1.02]",
        "active:scale-[0.98]"
      )}
      onMouseMove={(e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - bounds.left);
        mouseY.set(e.clientY - bounds.top);
        e.currentTarget.style.setProperty("--mouse-x", `${mouseX.get()}px`);
        e.currentTarget.style.setProperty("--mouse-y", `${mouseY.get()}px`);
      }}
      whileHover={{ scale: 1.02, y: -5, boxShadow: "0px 0px 15px var(--neon-color)" }}
      whileTap={{ scale: 0.98, y: 0 }}
    >
      {/* Content container */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-2"
        initial={false}
      >
        {/* Icon */}
        <div
          className={cn(
            "relative",
            "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10", // Smaller icons
            "flex items-center justify-center",
            "rounded-lg",
            "bg-white/50 dark:bg-white/5",
            "shadow-sm",
            "group-hover:shadow-md",
            "transition-all duration-300",
            "group-hover:scale-110"
          )}
        >
          <FontAwesomeIcon
            icon={link.icon}
            className={cn(
              "w-5 h-5 sm:w-6 sm:h-6", // Smaller icon size
              "transform-gpu",
              "transition-all duration-300",
              "drop-shadow-sm"
            )}
            style={{ color: link.color }}
          />
          
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
            style={{ backgroundColor: `${link.color}10` }}
          />
        </div>

        {/* Text */}
        <span
          className={cn(
            "text-xs sm:text-sm", // Smaller text
            "font-medium",
            "text-gray-600 dark:text-gray-300",
            "transition-colors duration-300",
            "group-hover:text-primary dark:group-hover:text-primary",
            "text-center",
            "line-clamp-1"
          )}
        >
          {link.name}
        </span>
      </motion.div>

      {/* Enhanced hover effects */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-accent/5 to-transparent dark:from-accent/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
    </motion.a>
  );
}

```

---

</SwmSnippet>

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBcGVyc29uYWwtd2Vic2l0ZSUzQSUzQXd5YXR0b3dhbHNo" repo-name="personal-website"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
