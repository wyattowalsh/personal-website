---
title: |
  components
---
<SwmSnippet path="/components/blog/index.ts" line="1">

---

&nbsp;

```typescript
import dynamic from 'next/dynamic'

export const PostCard = dynamic(() => import('./PostCard'))
export const PostHeader = dynamic(() => import('./PostHeader'))
export const PostLayout = dynamic(() => import('./PostLayout'))
export const PostPagination = dynamic(() => import('./PostPagination'))

// Re-export types
export type { PostCardProps } from './PostCard'
export type { PostHeaderProps } from './PostHeader'
export type { PostLayoutProps } from './PostLayout'

// Export shared utilities
export * from './utils'

```

---

</SwmSnippet>

<SwmSnippet path="/components/hooks/use-toast.ts" line="1">

---

&nbsp;

```typescript
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }

```

---

</SwmSnippet>

<SwmSnippet path="/components/hooks/useMousePosition.ts" line="1">

---

&nbsp;

```typescript
import { useState, useEffect } from 'react';

export const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
};

```

---

</SwmSnippet>

<SwmSnippet path="/components/hooks/useWindowSize.ts" line="1">

---

&nbsp;

```typescript
import { useState, useEffect } from 'react';

export const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};

```

---

</SwmSnippet>

<SwmSnippet path="/components/particles/particlesConfig.ts" line="1">

---

&nbsp;

```typescript
import { ISourceOptions } from "tsparticles-engine";
import { configUrls } from "./configUrls";

type Theme = 'light' | 'dark';

export const getRandomConfigUrl = (theme: Theme): string => {
  const configs = configUrls[theme];
  if (!configs.length) {
    // Return a default config from the opposite theme or a fallback
    const oppositeTheme = theme === 'dark' ? 'light' : 'dark';
    return configUrls[oppositeTheme][0]?.url ?? '';
  }
  const randomIndex = Math.floor(Math.random() * configs.length);
  return configs[randomIndex].url;
};

export const getConfigByName = (theme: Theme, name: string): string | undefined => {
  return configUrls[theme].find(config => config.url.includes(name))?.url;
};

export const getAllConfigUrls = (theme: Theme): readonly string[] => {
  return configUrls[theme].map(config => config.url);
};

export const getConfigByHash = (theme: Theme, hash: string): string | undefined => {
  return configUrls[theme].find(config => config.hash === hash)?.url;
};

export const getMostRecent = (theme: Theme): string => {
  const configs = configUrls[theme];
  return configs.reduce((latest, current) => {
    return new Date(latest.lastModified) > new Date(current.lastModified) 
      ? latest 
      : current;
  }).url;
};

```

---

</SwmSnippet>

<SwmSnippet path="/components/BlogBackLink.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BlogBackLink() {
  const pathname = usePathname();
  const isBlogHome = pathname === "/blog";
  const showBackLink = pathname !== "/";

  if (!showBackLink) return null;

  return (
    <motion.div
      className={cn(
        // Base positioning
        "fixed z-50",
        // Mobile styles (bottom center)
        "md:static",
        "left-4 bottom-8 md:left-8 md:top-8 md:bottom-auto",
        // Ensure touch target size
        "touch-manipulation"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link href={isBlogHome ? "/" : "/blog"}>
        <Button
          variant="ghost"
          className={cn(
            // Base styles
            "relative group",
            // Mobile optimization
            "h-12 md:h-10",
            "min-w-[48px] md:min-w-0",
            // Sizing and spacing
            "px-4 md:px-3",
            "rounded-full",
            // Visual styles
            "bg-back-link-bg/95 dark:bg-back-link-bg/90",
            "backdrop-blur-sm",
            "border border-back-link-border",
            "shadow-back-link",
            // Transitions
            "transition-all duration-300",
            // Hover states
            "hover:shadow-back-link-hover",
            "hover:bg-back-link-hover-bg",
            // Active/touch states
            "active:scale-95",
            // Text styles
            "text-primary dark:text-primary-foreground/90",
            "font-medium",
            // Mobile-specific styles
            "md:hover:translate-x-1",
            // Show full text only on larger screens
            "flex items-center gap-2"
          )}
        >
          {/* Mobile Icon */}
          <ChevronLeft className={cn(
            "w-6 h-6 md:hidden",
            "transition-transform duration-300",
            "group-hover:-translate-x-1"
          )} />
          
          {/* Desktop Icon */}
          <ArrowLeft className={cn(
            "hidden md:block",
            "w-4 h-4",
            "transition-transform duration-300",
            "group-hover:-translate-x-1"
          )} />
          
          {/* Text - Hidden on mobile */}
          <span className="hidden md:inline-block">
            Back to {isBlogHome ? "Home" : "Blog"}
          </span>

          {/* Touch Ripple Effect */}
          <span className={cn(
            "absolute inset-0 rounded-full",
            "pointer-events-none",
            "transition-transform duration-300",
            "group-active:bg-primary/10"
          )} />
        </Button>
      </Link>
    </motion.div>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/blogtitle.module.scss" line="1">

---

&nbsp;

```scss
/* components/blogtitle.module.scss */
@use 'sass:math';

.glitch-text {
  position: relative;
  display: inline-block;
  color: transparent;
  text-shadow: 
    0 0 1px rgba(255, 255, 255, 0.9),
    0 0 2px rgba(255, 255, 255, 0.7);
  animation: float 6s ease-in-out infinite;

  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background: var(--background);
    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
    animation: glitch-anim 5s infinite linear alternate-reverse;
  }

  &::before {
    left: -2px;
    text-shadow: 2px 0 var(--glitch-color-1);
  }

  &::after {
    left: 2px;
    text-shadow: -2px 0 var(--glitch-color-2);
  }
}

.glitch-layer {
  position: absolute;
  top: 0;
  left: 0;
  mix-blend-mode: screen;
  opacity: 0.5;
  filter: blur(0.5px);
  will-change: transform;
  inset: 0;
  mix-blend-mode: difference;
  animation: glitch-layer 4s infinite linear;
}

.glitch-layer--1 {
  animation: glitch-anim-1 3s infinite linear alternate-reverse;
  transform: translateX(-1px);
  color: var(--glitch-color1);
  text-shadow: 
    1px 0 1px rgba(255, 0, 255, 0.2),
    -1px 0 1px rgba(0, 255, 255, 0.2);
}

.glitch-layer--2 {
  animation: glitch-anim-2 2.5s infinite linear alternate;
  transform: translateX(1px);
  color: var(--glitch-color2);
  text-shadow: 
    1px 0 1px rgba(0, 255, 255, 0.2),
    -1px 0 1px rgba(255, 255, 0, 0.2);
}

.glitch-layer--3 {
  animation: glitch-anim-3 2.5s infinite linear alternate-reverse;
  color: var(--glitch-color3);
}

@keyframes glitch-anim-1 {
  0% {
    clip-path: polygon(0 2%, 100% 2%, 100% 3%, 0 3%);
    transform: translate(-2px) skew(0.5deg);
    filter: blur(0.5px);
  }
  20% {
    clip-path: polygon(0 12%, 100% 12%, 100% 14%, 0 14%);
    transform: translate(2px) skew(-0.5deg);
    filter: blur(0.25px);
  }
  40% {
    clip-path: polygon(0 8%, 100% 8%, 100% 9%, 0 9%);
    transform: translate(-1px, 1px) skew(0.25deg);
    filter: blur(0.75px);
  }
  60% {
    clip-path: polygon(0 1%, 100% 1%, 100% 2%, 0 2%);
    transform: translate(1px, -1px) skew(-0.25deg);
    filter: blur(0.5px);
  }
  80% {
    clip-path: polygon(0 15%, 100% 15%, 100% 16%, 0 16%);
    transform: translate(2px) skew(0.5deg);
    filter: blur(0.25px);
  }
  100% {
    clip-path: polygon(0 10%, 100% 10%, 100% 11%, 0 11%);
    transform: translate(0) skew(0);
    filter: blur(0.5px);
  }
}

@keyframes glitch-anim-2 {
  0% {
    clip-path: polygon(0 25%, 100% 25%, 100% 26%, 0 26%);
    transform: translate(2px) skew(-0.5deg);
    filter: blur(0.25px);
  }
  20% {
    clip-path: polygon(0 30%, 100% 30%, 100% 31%, 0 31%);
    transform: translate(-2px) skew(0.5deg);
    filter: blur(0.5px);
  }
  40% {
    clip-path: polygon(0 35%, 100% 35%, 100% 36%, 0 36%);
    transform: translate(1px, -1px) skew(-0.25deg);
    filter: blur(0.75px);
  }
  60% {
    clip-path: polygon(0 40%, 100% 40%, 100% 41%, 0 41%);
    transform: translate(-1px, 1px) skew(0.25deg);
    filter: blur(0.5px);
  }
  80% {
    clip-path: polygon(0 45%, 100% 45%, 100% 46%, 0 46%);
    transform: translate(2px) skew(-0.5deg);
    filter: blur(0.25px);
  }
  100% {
    clip-path: polygon(0 50%, 100% 50%, 100% 51%, 0 51%);
    transform: translate(0) skew(0);
    filter: blur(0.5px);
  }
}

@keyframes glitch-anim-3 {
  0% {
    clip-path: inset(10% 0 80% 0);
    transform: translate(0, 0);
  }
  20% {
    clip-path: inset(30% 0 60% 0);
    transform: translate(-5px, 5px) rotate(3deg);
  }
  40% {
    clip-path: inset(50% 0 40% 0);
    transform: translate(5px, -5px) rotate(-3deg);
  }
  60% {
    clip-path: inset(70% 0 20% 0);
    transform: translate(-5px, -5px) rotate(2deg);
  }
  80% {
    clip-path: inset(90% 0 0 0);
    transform: translate(5px, 5px) rotate(-2deg);
  }
  100% {
    clip-path: inset(100% 0 0 0);
    transform: translate(0, 0) rotate(0deg);
  }
}

@function random-percentage() {
  @return math.random(100) + 0%;
}

@function random-translate() {
  @return math.random(10) - 5 + px;
}

@keyframes glitch-anim {
  $steps: 20;
  @for $i from 0 through $steps {
    #{math.percentage(math.div($i, 2 * $steps))} {
      clip-path: inset(random-percentage() 0 random-percentage() 0);
      transform: translate(random-translate(), random-translate());
    }
  }
}

// Add noise texture
.glitch-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.02;
  mix-blend-mode: overlay;
  pointer-events: none;
}

// Add RGB split effect
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  text-shadow: 
    2px 0 1px rgba(255, 0, 0, 0.3),
    -2px 0 1px rgba(0, 0, 255, 0.3),
    0 0 3px rgba(255, 255, 255, 0.4);
  animation: rgb-split 3s infinite linear;
  opacity: 0.3;
}

@keyframes rgb-split {
  0% { transform: translate(0) skew(0deg); }
  25% { transform: translate(-1px, 1px) skew(0.5deg); }
  50% { transform: translate(1px, -1px) skew(-0.5deg); }
  75% { transform: translate(-1px, -1px) skew(0.5deg); }
  100% { transform: translate(0) skew(0deg); }
}

// Add plasma effect
.glitch-base {
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at center,
      rgba(255,255,255,0.1) 0%,
      rgba(255,255,255,0.05) 25%,
      transparent 70%
    );
    animation: plasma 8s ease infinite;
    mix-blend-mode: overlay;
  }
}

@keyframes plasma {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}

// Add chromatic aberration
.glitch-text {
  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
    animation: chrome-top 3s infinite linear alternate-reverse;
  }

  &::before {
    left: -2px;
    text-shadow: 2px 0 #ff0000;
  }

  &::after {
    left: 2px;
    text-shadow: -2px 0 #00ffff;
  }
}

@keyframes chrome-top {
  0% { transform: translate(0); }
  50% { transform: translate(-1px, 1px); }
  100% { transform: translate(1px, -1px); }
}

// Add scanline effect
.scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0.1) 0px,
    rgba(0,0,0,0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 10;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    background: rgba(0, 255, 255, 0.1);
    animation: scanline 6s linear infinite;
  }
}

@keyframes scanline {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.glitch-container {
  position: relative;
  font-family: var(--font-code);
  letter-spacing: -2px;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.glitch-copy-1,
.glitch-copy-2 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch-copy-1 {
  transform: translate(-2px, 2px);
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  animation: glitch-anim-1 2.5s infinite;
  background: linear-gradient(45deg, 
    rgba(255, 0, 255, 0.7),
    rgba(0, 255, 255, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glitch-copy-2 {
  transform: translate(2px, -2px);
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
  animation: glitch-anim-2 2s infinite;
  background: linear-gradient(-45deg,
    rgba(0, 255, 255, 0.7),
    rgba(255, 0, 255, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-container {
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      linear-gradient(90deg,
        transparent 0%,
        rgba(0, 255, 255, 0.1) 45%,
        rgba(0, 255, 255, 0.1) 55%,
        transparent 100%);
    animation: scanner 3s ease-in-out infinite;
  }
}

.cyber-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(transparent 95%, rgba(0, 255, 255, 0.2) 95%),
    linear-gradient(90deg, transparent 95%, rgba(0, 255, 255, 0.2) 95%);
  background-size: 20px 20px;
  animation: gridMove 20s linear infinite;
}

.cyber-brackets {
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid cyan;
    opacity: 0.5;
  }

  &::before {
    top: -10px;
    left: -10px;
    border-right: 0;
    border-bottom: 0;
  }

  &::after {
    bottom: -10px;
    right: -10px;
    border-left: 0;
    border-top: 0;
  }
}

@keyframes scanner {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

@keyframes gridMove {
  from { background-position: 0 0; }
  to { background-position: 20px 20px; }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotateX(0);
  }
  50% {
    transform: translateY(-10px) rotateX(5deg);
  }
}

@keyframes glitch-anim-1 {
  0% { clip-path: inset(40% 0 61% 0); }
  20% { clip-path: inset(92% 0 1% 0); }
  40% { clip-path: inset(43% 0 1% 0); }
  60% { clip-path: inset(25% 0 58% 0); }
  80% { clip-path: inset(54% 0 7% 0); }
  100% { clip-path: inset(58% 0 43% 0); }
}

@keyframes glitch-anim-2 {
  0% { clip-path: inset(10% 0 85% 0); }
  20% { clip-path: inset(75% 0 5% 0); }
  40% { clip-path: inset(28% 0 40% 0); }
  60% { clip-path: inset(82% 0 4% 0); }
  80% { clip-path: inset(15% 0 65% 0); }
  100% { clip-path: inset(70% 0 26% 0); }
}

.title {
  position: relative;
  &::after {
    content: attr(data-text);
    position: absolute;
    left: 2px;
    text-shadow: -1px 0 red;
    top: 0;
    color: transparent;
    background: rgba(255, 0, 0, 0.4);
    overflow: hidden;
    animation: noise-anim 2s infinite linear alternate-reverse;
  }
}

@keyframes noise-anim {
  0% {
    clip-path: inset(40% 0 61% 0);
  }
  100% {
    clip-path: inset(58% 0 43% 0);
  }
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/BlogTitle.tsx" line="1">

---

&nbsp;

```tsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import { useTheme } from "next-themes";
import {
	Code,
	Binary,
	Terminal,
	Brain,
	Sparkles,
	CircuitBoard,
	Cpu,
	Database,
	Cloud,
	Network,
	Github,
	Chrome,
	Command,
	Server,
	Share2,
	Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import styles from './blogtitle.module.scss';

const icons = [
	Code,
	Binary,
	Terminal,
	Brain,
	Sparkles,
	CircuitBoard,
	Cpu,
	Database,
	Cloud,
	Network,
	Github,
	Chrome,
	Command,
	Server,
	Share2,
	Workflow,
];

const FloatingIcon = ({
	icon: Icon,
	containerSize,
}: {
	icon: React.ComponentType<{ className?: string }>;
	containerSize: { width: number; height: number };
}) => {
	const iconSize = 16;

	const x = useMotionValue(
		Math.random() * containerSize.width - containerSize.width / 2
	);
	const y = useMotionValue(
		Math.random() * containerSize.height - containerSize.height / 2
	);

	const velocity = useRef({
		x: (Math.random() - 0.5) * 80,
		y: (Math.random() - 0.5) * 80,
	});

	const rotationZ = useMotionValue(Math.random() * 360);

	useAnimationFrame((_, delta) => {
		const deltaInSeconds = delta / 1000;

		let newX = x.get() + velocity.current.x * deltaInSeconds;
		let newY = y.get() + velocity.current.y * deltaInSeconds;

		const boundsX = containerSize.width / 2 - iconSize;
		const boundsY = containerSize.height / 2 - iconSize;

		if (Math.abs(newX) > boundsX) {
			velocity.current.x *= -1;
			newX = Math.sign(newX) * boundsX;
		}
		if (Math.abs(newY) > boundsY) {
			velocity.current.y *= -1;
			newY = Math.sign(newY) * boundsY;
		}

		x.set(newX);
		y.set(newY);

		rotationZ.set((rotationZ.get() + 60 * deltaInSeconds) % 360);
	});

	return (
		<motion.div
			style={{
				x,
				y,
				rotateZ: rotationZ,
				marginLeft: -iconSize / 2,
				marginTop: -iconSize / 2,
			}}
			className="absolute left-1/2 top-1/2"
		>
			<Icon className="w-4 h-4 text-cyan-600/70 dark:text-cyan-400/70 drop-shadow-md" />
		</motion.div>
	);
};

const GlitchText = ({ children }: { children: React.ReactNode }) => (
	<motion.div
		className={cn(
			"relative inline-block",
			styles['glitch-container'],
			"animate-glitch-text"
		)}
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ duration: 0.3 }}
	>
		 {/* Main text layer */}
		<span 
			className={cn(
				"relative z-10",
				styles['glitch-text'],
				"bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500",
				"bg-clip-text text-transparent",
				"animate-glitch-skew"
			)}
			data-text={children}
		>
			{children}
		</span>

		{/* Glitch effect layers */}
		<span className={styles['glitch-copy-1']} aria-hidden="true">{children}</span>
		<span className={styles['glitch-copy-2']} aria-hidden="true">{children}</span>
		
		{/* Scanlines */}
		<div className={styles['scanlines']}></div>
		
		{/* Cyber decorations */}
		<div className={styles['cyber-brackets']}></div>
	</motion.div>
);

const BackgroundParticles = () => {
	const particles = Array.from({ length: 100 });

	return (
		<>
			{particles.map((_, index) => (
				<motion.div
					key={index}
					className="absolute rounded-full bg-cyan-500/20 dark:bg-cyan-400/20 blur-md"
					style={{
						width: `${Math.random() * 4 + 2}px`,
						height: `${Math.random() * 4 + 2}px`,
						top: `${Math.random() * 100}%`,
						left: `${Math.random() * 100}%`,
					}}
					animate={{
						opacity: [0, 1, 0],
						y: [0, -50, 0],
						x: [0, 20 * (Math.random() - 0.5), 0],
					}}
					transition={{
						duration: 5 + Math.random() * 5,
						repeat: Infinity,
						delay: Math.random() * 5,
						ease: "easeInOut",
					}}
				/>
			))}
		</>
	);
};

const AnimatedBackground = () => (
	<div className="absolute inset-0 z-0 overflow-hidden">
		<motion.div
			className="absolute inset-0"
			animate={{
				backgroundPosition: ["0% 50%", "100% 50%"],
			}}
			transition={{
				duration: 30,
				repeat: Infinity,
				ease: "linear",
			}}
			style={{
				backgroundImage: "linear-gradient(270deg, #00FFFF, #FF00FF, #00FFFF)",
				backgroundSize: "600% 600%",
			}}
		/>
	</div>
);

const BlogTitle = () => {
	const { theme } = useTheme();
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const updateSize = () => {
			const container = document.getElementById("title-container");
			if (container) {
				const { width, height } = container.getBoundingClientRect();
				setContainerSize({ width, height });
			}
		};
		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	return (
		<motion.div className="relative w-full py-1 sm:py-2 md:py-3 overflow-hidden pt-0" suppressHydrationWarning>
			<div className="max-w-4xl mx-auto mt-0">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
				>
					<Card
						id="title-container"
						className={cn(
							"relative rounded-2xl overflow-hidden perspective-1000",
							"min-h-[120px] sm:min-h-[150px] md:min-h-[180px]", // Reduced heights
							"flex items-center justify-center",
							"backdrop-blur-[20px]",
							"bg-gradient-to-br from-black/40 via-black/60 to-black/40",
							"dark:from-white/10 dark:via-white/20 dark:to-white/10",
							"border border-cyan-500/20 dark:border-cyan-400/20",
							"shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(255,255,255,0.1)]",
							styles['card-container']
						)}
					>
						<div className={styles['cyber-grid']}></div>
						<BackgroundParticles />
						<div className={styles.scanlines} />

						{containerSize.width > 0 &&
							icons.map((Icon, index) => (
								<FloatingIcon
									key={index}
									icon={Icon}
									containerSize={containerSize}
								/>
							))}

						<div className="relative z-10 w-full">
							<motion.h1
								className={cn(
									"text-3xl sm:text-4xl md:text-5xl font-bold", // Slightly reduced text sizes
									"p-1 select-none text-center", // Reduced padding
									"filter drop-shadow-[0_0_8px_rgba(0,255,255,0.3)]",
									styles['title']
								)}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.8,
									delay: 0.2,
									ease: [0.6, -0.05, 0.01, 0.99]
								}}
							>
								<GlitchText>onelonedatum</GlitchText>
							</motion.h1>
						</div>
					</Card>
				</motion.div>
			</div>
		</motion.div>
	);
};

export default BlogTitle;
```

---

</SwmSnippet>

<SwmSnippet path="/components/ClientSideLink.tsx" line="1">

---

&nbsp;

```tsx
'use client'

import React from 'react'
import Link from 'next/link'

interface ClientSideLinkProps {
  href: string
  children: React.ReactNode
  isExternal?: boolean
  className?: string
  [key: string]: any
}

const ClientSideLink: React.FC<ClientSideLinkProps> = ({
  href,
  isExternal,
  children,
  className = "transition-colors duration-300",
  ...props
}) => {
  const linkStyle = { color: 'hsl(var(--primary))' }

  // Check if we're already inside an anchor tag
  const isNested = React.useCallback(() => {
    let parent = props.parentElement
    while (parent) {
      if (parent.tagName === 'A') return true
      parent = parent.parentElement
    }
    return false
  }, [props.parentElement])

  if (isNested()) {
    // If nested, just render content without link
    return <span className={className} style={linkStyle} {...props}>{children}</span>
  }

  return (
    <a
      href={href}
      className={className}
      style={linkStyle}
      {...props}
      {...(isExternal && {
        target: "_blank",
        rel: "noopener noreferrer"
      })}
    >
      {children}
    </a>
  )
}

export default ClientSideLink

```

---

</SwmSnippet>

<SwmSnippet path="/components/Comments.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Comments() {
	const { resolvedTheme } = useTheme();
	const [giscusTheme, setGiscusTheme] = useState("/giscus-light.css");

	useEffect(() => {
		if (resolvedTheme === "dark") {
			setGiscusTheme("/giscus-dark.css");
		} else {
			setGiscusTheme("/giscus-light.css");
		}
	}, [resolvedTheme]);

	return (
		<section key={giscusTheme}>
			<Giscus
				id="comments"
				repo="wyattowalsh/personal-website"
				repoId="MDEwOlJlcG9zaXRvcnkxNTgxOTI2MDk="
				category="General"
				categoryId="DIC_kwDOCW3T4c4CkPJr"
				mapping="pathname"
				strict="0"
				reactionsEnabled="1"
				emitMetadata="1"
				inputPosition="bottom"
				theme={resolvedTheme === "dark" ? "dark" : "light"}
				lang="en"
				loading="lazy"
			/>
		</section>
	);
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

<SwmSnippet path="/components/FontSizeScroller.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import React, { useState } from "react";

export default function FontSizeScroller({
	children,
}: {
	children: React.ReactNode;
}) {
	const [fontSize, setFontSize] = useState(16);

	const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFontSize(Number(event.target.value));
	};

	return (
		<div style={{ fontSize: `${fontSize}px` }}>
			<div className="flex justify-end mb-4">
				<label
					htmlFor="font-size-slider"
					className="mr-2 text-gray-700 dark:text-gray-300"
				>
					Font Size:
				</label>
				<input
					id="font-size-slider"
					type="range"
					min="12"
					max="24"
					value={fontSize}
					onChange={handleFontSizeChange}
					className="w-32 accent-blue-600 dark:accent-blue-400"
				/>
			</div>
			<div className="prose dark:prose-dark max-w-none">{children}</div>
		</div>
	);
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/FontSizeToggle.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

interface FontSizeToggleProps {
	children?: React.ReactNode; // Make children optional
}

const FontSizeToggle: React.FC<FontSizeToggleProps> = ({ children }) => {
	const [fontSize, setFontSize] = useState(16);

	const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFontSize(Number(event.target.value));
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95"
				>
					<Settings className="h-[1.2rem] w-[1.2rem]" />
					<span className="sr-only">Adjust font size</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem asChild>
					<div className="w-full">
						<div style={{ fontSize: `${fontSize}px` }}>
							<div className="flex justify-end mb-4">
								<label
									htmlFor="font-size-slider"
									className="mr-2 text-gray-700 dark:text-gray-300"
								>
									Font Size:
								</label>
								<input
									id="font-size-slider"
									type="range"
									min="12"
									max="24"
									value={fontSize}
									onChange={handleFontSizeChange}
									className="w-32 accent-blue-600 dark:accent-blue-400"
								/>
							</div>
							<div className="prose dark:prose-dark max-w-none">{children}</div>
						</div>
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default FontSizeToggle;

```

---

</SwmSnippet>

<SwmSnippet path="/components/GistWrapper.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import SuperReactGist to avoid SSR issues
const DynamicSuperReactGist = dynamic<SuperReactGistProps>(
	() => import("super-react-gist").then((mod) => mod.default),
	{
		ssr: false, // Disable SSR for this component
		loading: () => <div>Loading gist...</div>,
	}
);

interface GistWrapperProps {
	url?: string;
	id?: string;
}

interface SuperReactGistProps {
	url: string;
}

export default function GistWrapper({ url, id }: GistWrapperProps) {
	// Construct URL if only ID is provided
	const gistUrl = url || `https://gist.github.com/${id}`;

	if (!gistUrl) {
		console.error("GistWrapper requires either a url or id prop");
		return null;
	}

	return (
		<div className="my-4">
			<DynamicSuperReactGist url={gistUrl} />
		</div>
	);
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/Header.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BlogBackLink from "@/components/BlogBackLink";
import DarkModeToggle from "@/components/DarkModeToggle";
import FontSizeToggle from "@/components/FontSizeToggle";

export default function Header() {
	const pathname = usePathname();
	const isBlogPage = pathname.startsWith("/blog");

	return (
		<header className="fixed top-0 left-0 w-full flex justify-between items-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 z-50 bg-transparent">
			<BlogBackLink />
			<div className="flex items-center space-x-4">
				<DarkModeToggle />
				{/* {isBlogPage && <FontSizeToggle>Toggle Font Size</FontSizeToggle>} */}
			</div>
		</header>
	);
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/KaTeXLoader.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function KaTeXLoader() {
  useEffect(() => {
    // @ts-ignore
    if (typeof renderMathInElement !== "undefined") {
      // @ts-ignore
      renderMathInElement(document.body);
    }
  }, []);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/copy-tex.min.js"
        integrity="sha384-HORx6nWi8j5/mYA+y57/9/CZc5z8HnEw4WUZWy5yOn9ToKBv1l58vJaufFAn9Zzi"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
        integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" 
        strategy="lazyOnload"
      />
    </>
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
        // Responsive padding
        "py-8 sm:py-12 md:py-16 lg:py-24",
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
  color: link.color || "var(--primary-color)",
}));

export default function Links() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
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
        // Responsive grid
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        "gap-3 sm:gap-4 md:gap-6 lg:gap-8",
        // Responsive padding
        "p-3 sm:p-4 md:p-6 lg:p-8",
        // Container styling
        "w-full max-w-[95vw] md:max-w-5xl mx-auto",
        "rounded-xl",
        // Theme-aware background
        "bg-gradient-to-br",
        "from-background/30 to-background/10",
        "dark:from-background/20 dark:to-background/5",
        // Enhanced blur and border
        "backdrop-blur-sm",
        "border border-primary/5",
        "dark:border-primary/10",
        // Improved shadows
        "shadow-xl shadow-primary/5",
        "dark:shadow-primary/10",
        // Smooth transitions
        "transition-colors duration-300"
      )}
    >
      {links.map((link, index) => (
        <motion.div
          key={link.name}
          variants={itemVariants}
          custom={index}
          className={cn(
            "w-full",
            // Ensure minimum touch target size
            "min-h-[100px] sm:min-h-[120px]"
          )}
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

<SwmSnippet path="/components/loadingspinner.module.scss" line="1">

---

&nbsp;

```scss
/* LoadingSpinner.module.scss */
@use 'sass:math';
.cube-spinner {
    width: 64px;
    height: 64px;
    perspective: 800px;
  }
  
  .cube {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    animation: rotateCube 2s infinite linear;
  }
  
  .cube::before,
  .cube::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--primary);
    opacity: 0.6;
  }
  
  .cube::before {
    transform: rotateY(90deg);
  }
  
  .cube::after {
    transform: rotateX(90deg);
  }
  
  @keyframes rotateCube {
    0% {
      transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
    }
    100% {
      transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
    }
  }
  
  /* Glitch effect styles */
  .glitch-base {
    position: relative;
    text-shadow: 0.05em 0 0 var(--glitch-color1),
      -0.05em -0.025em 0 var(--glitch-color2),
      -0.025em 0.05em 0 var(--glitch-color3);
    animation: glitch 750ms infinite;
  }
  
  .glitch-layer-1,
  .glitch-layer-2 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
  }
  
  .glitch-layer-1 {
    animation: glitchAnim1 4s infinite linear alternate-reverse;
    clip-path: polygon(
      0 var(--glitch-gap),
      100% var(--glitch-gap),
      100% calc(1% + var(--glitch-gap)),
      0 calc(1% + var(--glitch-gap))
    );
  }
  
  .glitch-layer-2 {
    animation: glitchAnim2 2s infinite linear alternate;
    clip-path: polygon(
      0 calc(99% - var(--glitch-gap)),
      100% calc(99% - var(--glitch-gap)),
      100% calc(100% - var(--glitch-gap)),
      0 calc(100% - var(--glitch-gap))
    );
  }
  
  @keyframes glitch {
    0% {
      text-shadow: 0.05em 0 0 var(--glitch-color1),
        -0.05em -0.025em 0 var(--glitch-color2),
        -0.025em 0.05em 0 var(--glitch-color3);
      filter: blur(0);
    }
    14% {
      text-shadow: 0.05em 0 0 var(--glitch-color2),
        -0.05em -0.025em 0 var(--glitch-color3),
        -0.025em 0.05em 0 var(--glitch-color1);
      filter: blur(var(--glitch-blur));
    }
    28% {
      text-shadow: 0.05em 0 0 var(--glitch-color3),
        -0.05em -0.025em 0 var(--glitch-color1),
        -0.025em 0.05em 0 var(--glitch-color2);
      filter: blur(0);
    }
    42% {
      text-shadow: -0.05em 0 0 var(--glitch-color1),
        0.025em 0.025em 0 var(--glitch-color2),
        -0.05em -0.05em 0 var(--glitch-color3);
      filter: blur(var(--glitch-blur));
    }
    100% {
      text-shadow: 0.05em 0 0 var(--glitch-color1),
        -0.05em -0.025em 0 var(--glitch-color2),
        -0.025em 0.05em 0 var(--glitch-color3);
      filter: blur(0);
    }
  }
  
  @keyframes glitchAnim1 {
    0% {
      transform: translate(0);
    }
    20% {
      transform: translate(-2px, 2px);
    }
    40% {
      transform: translate(-2px, -2px);
    }
    60% {
      transform: translate(2px, 2px);
    }
    80% {
      transform: translate(2px, -2px);
    }
    100% {
      transform: translate(0);
    }
  }
  
  @keyframes glitchAnim2 {
    0% {
      transform: translate(0);
    }
    20% {
      transform: translate(2px, 2px);
    }
    40% {
      transform: translate(2px, -2px);
    }
    60% {
      transform: translate(-2px, 2px);
    }
    80% {
      transform: translate(-2px, -2px);
    }
    100% {
      transform: translate(0);
    }
  }

  @function random-percentage() {
    @return math.random(100) + 0%;
  }
  
  @function random-translate() {
    @return math.random(10) - 5 + px;
  }
  
  @keyframes glitch-anim {
    $steps: 20;
    @for $i from 0 through $steps {
      #{math.percentage(math.div($i, 2 * $steps))} {
        clip-path: inset(random-percentage() 0 random-percentage() 0);
        transform: translate(random-translate(), random-translate());
      }
    }
  }

```

---

</SwmSnippet>

<SwmSnippet path="/components/LoadingSpinner.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";
import styles from "./loadingspinner.module.scss";

// Omit color from HTMLAttributes to avoid conflict
type BaseSpinnerProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>;

interface LoadingSpinnerProps
  extends BaseSpinnerProps,
    VariantProps<typeof spinnerVariants> {
  message?: string;
}

const spinnerVariants = cva("relative flex justify-center items-center", {
  variants: {
    variant: {
      glitch: "glitch-base",
      ring: "ring-base",
      cube: "cube-base",
    },
    size: {
      sm: "h-12 w-12",
      md: "h-16 w-16",
      lg: "h-24 w-24",
    },
    color: {
      primary: "text-primary",
      accent: "text-accent",
      secondary: "text-secondary",
    },
  },
  defaultVariants: {
    variant: "glitch",
    size: "md",
    color: "primary",
  },
});

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant,
  size,
  color,
  message = "Loading",
  className,
  ...props
}) => {
  return (
    <div className={cn("flex flex-col items-center", className)} {...props}>
      <Spinner variant={variant} size={size} color={color} message={message} />
      {message && (
        <span className="mt-4 text-sm text-center animate-pulse">{message}</span>
      )}
    </div>
  );
};

const Spinner: React.FC<LoadingSpinnerProps> = ({
  variant,
  size,
  color,
  message,
}) => {
  switch (variant) {
    case "glitch":
      return (
        <motion.div
          className={spinnerVariants({ variant, size, color })}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, repeat: Infinity }}
          data-text={message}
        >
          <Loader2
            className={cn(
              "animate-spin text-primary-foreground",
              spinnerVariants({ size, color })
            )}
          />
          <div
            className="absolute inset-0 glitch-layer-1"
            data-text={message}
          ></div>
          <div
            className="absolute inset-0 glitch-layer-2"
            data-text={message}
          ></div>
        </motion.div>
      );
    case "ring":
      return (
        <div className={cn("relative", spinnerVariants({ size }))}>
          <motion.div
            className={cn(
              "absolute inset-0 border-4 border-t-transparent border-b-transparent rounded-full",
              color
            )}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "linear",
            }}
          />
          <Loader2
            className={cn(
              "absolute inset-0 m-auto text-primary-foreground",
              spinnerVariants({ size, color })
            )}
          />
        </div>
      );
    case "cube":
      return (
        <div className={styles["cube-spinner"]}>
          <div className={styles["cube"]}></div>
        </div>
      );
    default:
      return null;
  }
};

```

---

</SwmSnippet>

<SwmSnippet path="/components/Math.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import katex from 'katex';
import { cn } from "@/lib/utils";
import { Link, Copy } from "lucide-react";
import { useMathContext } from "./MathContext";

interface MathProps {
  children?: string;
  display?: boolean;
  options?: any;
  label?: string;
  number?: number;
}

export default function Math({ children = '', display = false, options = {}, label, number }: MathProps) {
  const [copied, setCopied] = useState(false);
  const mathRef = useRef<HTMLDivElement>(null);
  const { getNextNumber } = useMathContext();
  const numberRef = useRef<number | null>(null);
  
  // Get equation number only once and store it in ref
  const equationId = useMemo(() => {
    if (!display) return undefined;
    if (label) return label;
    if (typeof number === 'number') return number;
    if (numberRef.current === null) {
      numberRef.current = getNextNumber();
    }
    return numberRef.current;
  }, [display, label, number, getNextNumber]);

  // Handle clicking equation number
  const handleEquationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const id = `eq-${equationId}`;
    
    // Update URL hash
    window.history.pushState({}, '', `#${id}`);
    
    // Scroll to equation
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.href.split('#')[0]}#eq-${equationId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderedKatex = useMemo(() => {
    const cleanMath = children.trim().replace(/^\$\$(.*)\$\$$/s, '$1');
    try {
      return katex.renderToString(cleanMath, {
        displayMode: display,
        throwOnError: true,
        globalGroup: true,
        trust: true,
        strict: false,
        fleqn: false,
        ...options
      });
    } catch (error) {
      console.error('KaTeX error:', error);
      return katex.renderToString(cleanMath, {
        displayMode: display,
        throwOnError: false,
        strict: 'ignore',
        ...options
      });
    }
  }, [children, display, options]);

  useEffect(() => {
    if (mathRef.current && window.location.hash === `#eq-${equationId}`) {
      mathRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [equationId]);

  if (!display) {
    return (
      <span 
        className="math-inline"
        dangerouslySetInnerHTML={{ __html: renderedKatex }}
      />
    );
  }

  return (
    <div 
      ref={mathRef}
      id={`eq-${equationId}`}
      className="math-display group relative"
    >
      <div
        className="math-content"
        dangerouslySetInnerHTML={{ __html: renderedKatex }}
      />
      {equationId && (
        <>
          <button
            onClick={handleCopy}
            className="equation-link"
            title="Copy link to equation"
          >
            {copied ? <Copy className="h-4 w-4" /> : <Link className="h-4 w-4" />}
          </button>
          <button
            onClick={handleEquationClick}
            className="equation-number"
            title="Click to link to this equation"
          >
            ({equationId})
          </button>
        </>
      )}
    </div>
  );
}
```

---

</SwmSnippet>

<SwmSnippet path="/components/MathContext.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import React, { createContext, useContext, useRef } from 'react';

type MathContextType = {
  getNextNumber: () => number;
  resetCounter: () => void;
};

const MathContext = createContext<MathContextType | null>(null);

export function MathProvider({ children }: { children: React.ReactNode }) {
  // Use useRef instead of useState to avoid async state updates
  const counterRef = useRef(0);

  const getNextNumber = () => {
    counterRef.current += 1;
    return counterRef.current;
  };

  const resetCounter = () => {
    counterRef.current = 0;
  };

  return (
    <MathContext.Provider value={{ getNextNumber, resetCounter }}>
      {children}
    </MathContext.Provider>
  );
}

export const useMathContext = () => {
  const context = useContext(MathContext);
  if (!context) {
    throw new Error('useMathContext must be used within a MathProvider');
  }
  return context;
};

```

---

</SwmSnippet>

<SwmSnippet path="/components/NotFoundContent.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, BookOpen, ArrowLeft } from "lucide-react";

export default function NotFoundContent() {
  const pathname = usePathname();
  const isBlogPage = pathname.startsWith("/blog");
  const backLink = isBlogPage ? "/blog" : "/";

  return (
    <div className={cn(
      "text-center space-y-8 p-8",
      "backdrop-blur-sm bg-background/30",
      "rounded-xl border border-border/50",
      "shadow-lg hover:shadow-xl",
      "transition-all duration-500",
      "relative z-10",
      "group"
    )}>
      {/* Animated border gradient */}
      <div className={cn(
        "absolute inset-0 rounded-xl",
        "bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50",
        "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-500",
        "-z-10 blur-xl"
      )} />

      {/* 404 heading with glitch effect */}
      <h1 className={cn(
        "text-8xl font-bold",
        "bg-gradient-heading bg-clip-text text-transparent",
        "animate-glitch-text",
        "relative",
        "after:content-['404'] after:absolute after:inset-0",
        "after:bg-gradient-heading after:bg-clip-text after:text-transparent",
        "after:translate-x-[2px] after:translate-y-[2px]",
        "after:opacity-70"
      )}>
        404
      </h1>

      {/* Subheading with gradient */}
      <h2 className={cn(
        "text-3xl font-semibold",
        "bg-gradient-text bg-clip-text text-transparent",
        "animate-gradient"
      )}>
        {isBlogPage ? "Blog Post Not Found" : "Page Not Found"}
      </h2>

      {/* Description with animated fade-in */}
      <p className={cn(
        "text-lg text-muted-foreground",
        "max-w-md mx-auto",
        "animate-fadeIn opacity-0",
        "group-hover:text-foreground transition-colors"
      )}>
        {isBlogPage
          ? "The blog post you're looking for doesn't exist or has been moved."
          : "The page you're looking for doesn't exist or has been moved."}
      </p>

      {/* Enhanced button with icon */}
      <div className="pt-4">
        <Button
          asChild
          variant="default"
          className={cn(
            "group/button relative overflow-hidden",
            "bg-gradient-to-r from-primary to-secondary",
            "hover:from-secondary hover:to-primary",
            "transition-all duration-500",
            "shadow-lg hover:shadow-xl",
            "scale-100 hover:scale-105",
            "animate-float"
          )}
        >
          <Link href={backLink} className="no-underline">
            <span className="flex items-center gap-2">
              {isBlogPage ? <BookOpen className="w-4 h-4" /> : <Home className="w-4 h-4" />}
              <span>{isBlogPage ? "Back to blog" : "Go back home"}</span>
              <ArrowLeft className={cn(
                "w-4 h-4 transition-transform duration-300",
                "group-hover/button:-translate-x-1"
              )} />
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/ParticlesBackground.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getRandomConfigUrl } from "@/components/particles/particlesConfig";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { type Container, type Engine } from "@tsparticles/engine";
import dynamic from 'next/dynamic';

// Dynamically import Particles
const Particles = dynamic(() => import("@tsparticles/react"), {
  ssr: false,
  loading: () => <></>,
});

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);
  const { theme, systemTheme, resolvedTheme } = useTheme();
  const [currentConfigUrl, setCurrentConfigUrl] = useState<string>("");
  const engineRef = useRef<Engine | null>(null);
  const containerRef = useRef<Container | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialize particle engine once
  useEffect(() => {
    if (!mounted) return;

    const initEngine = async () => {
      try {
        const { initParticlesEngine } = await import("@tsparticles/react");
        const { loadAll } = await import("@tsparticles/all");
        
        await initParticlesEngine(async (engine) => {
          engineRef.current = engine;
          await loadAll(engine);
        });
        setInit(true);
      } catch (error) {
        console.error("Failed to initialize particles engine:", error);
      }
    };

    initEngine();

    return () => {
      if (engineRef.current) {
        engineRef.current = null;
      }
    };
  }, [mounted]);

  // Cleanup function for particles container
  const cleanup = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.destroy();
      containerRef.current = null;
    }
  }, []);

  // Update config when theme changes
  useEffect(() => {
    if (!mounted || !init) return;

    const currentTheme = resolvedTheme as 'light' | 'dark';
    if (!currentTheme) return;

    const updateParticles = async () => {
      // Clean up existing particles
      cleanup();

      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get new config and update
      const newConfigUrl = getRandomConfigUrl(currentTheme);
      setCurrentConfigUrl(newConfigUrl);
    };

    updateParticles();

    return () => cleanup();
  }, [resolvedTheme, init, mounted, cleanup]);

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) {
      containerRef.current = container;
      await container.refresh();
    }
  }, []);

  // Don't render anything until mounted and initialized
  if (!mounted || !init || !currentConfigUrl) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentConfigUrl}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 -z-10"
        transition={{ duration: 0.8 }}
      >
        <Particles
          id={`tsparticles-${currentConfigUrl}`}
          className="absolute inset-0"
          url={currentConfigUrl}
          particlesLoaded={particlesLoaded}
          options={{
            fullScreen: false,
            detectRetina: true,
            fpsLimit: 120,
            interactivity: {
              detectsOn: "window",
              events: {
                onHover: {
                  enable: true,
                  mode: "grab"
                },
                resize: {
                  enable: true,
                  delay: 0.5
                }
              },
              modes: {
                grab: {
                  distance: 140,
                  links: {
                    opacity: 0.5
                  }
                }
              }
            }
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
```

---

</SwmSnippet>

<SwmSnippet path="/components/PostCard.tsx" line="1">

---

&nbsp;

```tsx
// components/PostCard.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import TagLink from "@/components/TagLink";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

// Add the same helper function
function isDifferentDate(date1: string | undefined, date2: string | undefined): boolean {
  if (!date1 || !date2) return false;
  // Remove any milliseconds and 'Z' suffix for comparison
  const clean1 = date1.split('.')[0].replace('Z', '');
  const clean2 = date2.split('.')[0].replace('Z', '');
  return clean1 !== clean2;
}

interface PostCardProps {
  post: {
    slug: string;
    title?: string;
    summary?: string;
    created?: string;    // Changed from date
    updated?: string;    // Added
    tags?: string[];
    image?: string;
    readingTime?: string;
  };
  className?: string;
}

const PostCard = ({ post, className }: PostCardProps) => {
  const {
    slug,
    title = "Untitled Post",
    summary = "No summary available.",
    created,    // Changed from date
    updated,
    tags = [],
    image = "/logo.webp",
    readingTime = "A few minutes",
  } = post;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn("transition-transform duration-300 h-full", className)}
    >
      <Link href={`/blog/posts/${slug}`} className="block h-full no-underline">
        <Card className="overflow-hidden bg-card hover:shadow-glow transition-shadow duration-300 cursor-pointer rounded-xl h-full flex flex-col">
          <div className="relative aspect-video w-full">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
              placeholder="blur"
              blurDataURL="/logo.webp"
            />
            {/* Enhanced gradient overlay for better contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80"></div>
            
            {/* Card content with guaranteed contrast */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
              <h3 className={cn(
                "text-xl font-semibold leading-tight",
                "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]",
                "tracking-tight"
              )}>
                {title}
              </h3>
              <p className={cn(
                "text-sm mt-1 line-clamp-2",
                "text-gray-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]",
                "leading-relaxed"
              )}>
                {summary}
              </p>
            </div>
          </div>
          
          <div className="p-4 flex flex-col flex-grow bg-gradient-to-b from-card to-card/95">
            <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
              {created && (
                <span className={cn(
                  "flex items-center gap-2 group",
                  "text-muted-foreground/80",
                  "transition-colors duration-300",
                  "hover:text-primary"
                )}>
                  <Calendar className={cn(
                    "h-4 w-4",
                    "transition-transform duration-300",
                    "group-hover:scale-110"
                  )} />
                  <time 
                    dateTime={created} 
                    className={cn(
                      "no-underline font-medium",
                      "transition-colors duration-300"
                    )}
                  >
                    {formatDate(created)}
                  </time>
                </span>
              )}
              {readingTime && (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="no-underline">{readingTime}</span>
                </span>
              )}
            </div>
            <Separator className="my-2" />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto">
                {tags.map((tag) => (
                  <TagLink key={tag} tag={tag} isNested />
                ))}
              </div>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default PostCard;

```

---

</SwmSnippet>

<SwmSnippet path="/components/PostHeader.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { PostMetadata } from "@/lib/types"; // Update import path
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Calendar, Clock, Tag, Edit } from "lucide-react";
import { getPost } from "@/lib/services"; // Add this import

// Remove the local PostMetadata interface since we're importing it

interface PostHeaderState {
  post: PostMetadata | null;
  isLoading: boolean;
  error: string | null;
  imageLoaded: boolean;
}

// Add a helper function at the top of the file
function isDifferentDate(date1: string | undefined, date2: string | undefined): boolean {
  if (!date1 || !date2) return false;
  // Remove any milliseconds and 'Z' suffix for comparison
  const clean1 = date1.split('.')[0].replace('Z', '');
  const clean2 = date2.split('.')[0].replace('Z', '');
  return clean1 !== clean2;
}

export default function PostHeader() {
  const [state, setState] = useState<PostHeaderState>({
    post: null,
    isLoading: true,
    error: null,
    imageLoaded: false,
  });

  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    const fetchPost = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const slug = pathname.split("/blog/posts/")[1];
        
        if (!slug) {
          throw new Error('Invalid slug');
        }

        // Use backend service instead of fetch
        const metadata = await getPost(slug);
        
        if (!mounted) return;

        if (!metadata?.title || !metadata?.created || !metadata?.tags) {
          throw new Error('Invalid post metadata');
        }

        setState(prev => ({ ...prev, post: metadata, isLoading: false }));
      } catch (error) {
        if (!mounted) return;

        const errorMessage = error instanceof Error ? error.message : "Failed to load post";
        console.error("Error loading post:", errorMessage);
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    };

    fetchPost();
    
    return () => {
      mounted = false;
    };
  }, [pathname]);

  const handleImageLoad = () => {
    setState((prev) => ({ ...prev, imageLoaded: true }));
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (state.error || !state.post) {
    return (
      <div className="text-destructive text-center p-4">
        {state.error || "Post not found"}
      </div>
    );
  }

  return (
    <motion.header
      className={cn(
        // Base styles
        "relative overflow-hidden",
        "rounded-xl md:rounded-2xl lg:rounded-3xl",
        "max-w-5xl mx-auto",
        "border border-post-header-border",
        
        // Gradients and backgrounds
        "bg-gradient-to-br from-post-header-gradient-from via-post-header-gradient-via to-post-header-gradient-to",
        "backdrop-blur-sm backdrop-saturate-150",
        
        // Shadows and effects
        "shadow-post-header",
        "transition-all duration-500 ease-out",
        "hover:shadow-post-header-hover hover:scale-[1.01]",
        
        // Dark mode adjustments
        "dark:from-post-header-gradient-from/90",
        "dark:via-post-header-gradient-via/90",
        "dark:to-post-header-gradient-to/90",
        "dark:border-post-header-border/50"
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Hero Image Container */}
      <div className={cn(
        "relative w-full",
        "aspect-[21/9] sm:aspect-[2/1] md:aspect-[21/9]",
        "overflow-hidden"
      )}>
        <Image
          src={state.post.image || "/logo.webp"}
          alt={state.post.title}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
          className={cn(
            "object-cover object-center",
            "transform transition-all duration-700",
            !state.imageLoaded && "blur-sm scale-105",
            state.imageLoaded && "blur-0 scale-100",
            "hover:scale-105 transition-transform duration-700"
          )}
          onLoad={handleImageLoad}
        />
        
        {/* Image Overlay */}
        <div className={cn(
          "absolute inset-0",
          "bg-post-header-image-overlay",
          "transition-opacity duration-300",
          "opacity-80 hover:opacity-60"
        )} />

        {/* Caption */}
        {state.post.caption && (
          <p className={cn(
            "absolute bottom-4 left-4",
            "text-sm sm:text-base lg:text-lg",
            "italic text-white",
            "px-3 py-1.5",
            "rounded-md",
            "bg-black/50 backdrop-blur-sm",
            "border border-white/10",
            "shadow-lg",
            "transition-all duration-300",
            "hover:bg-black/60 hover:scale-105"
          )}>
            {state.post.caption}
          </p>
        )}
      </div>

      {/* Content Section */}
      <div className={cn(
        "relative z-10",
        "p-4 sm:p-6 lg:p-8",
        "space-y-4 sm:space-y-6 lg:space-y-8"
      )}>
        {/* Title */}
        <motion.h1
          className={cn(
            "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
            "font-extrabold tracking-tight",
            "bg-gradient-heading bg-clip-text text-transparent",
            "leading-tight",
            "transition-colors duration-300"
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {state.post.title}
        </motion.h1>

        {/* Summary */}
        {state.post.summary && (
          <p className={cn(
            "text-base sm:text-lg lg:text-xl",
            "text-muted-foreground",
            "leading-relaxed",
            "max-w-prose"
          )}>
            {state.post.summary}
          </p>
        )}

        {/* Metadata Section */}
        <div className={cn(
          "flex flex-wrap gap-3 sm:gap-4 lg:gap-6",
          "text-sm sm:text-base",
          "text-muted-foreground",
          "border-t border-b border-border-muted",
          "py-3 sm:py-4",
          "transition-colors duration-300"
        )}>
          {/* Created Date */}
          {state.post.created && (
            <div className={cn(
              "flex items-center gap-2 group",
              "hover:text-primary transition-all duration-300"
            )}>
              <Calendar className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                "transition-transform duration-300",
                "group-hover:scale-110"
              )} />
              <time 
                dateTime={state.post.created}
                className="font-medium"
              >
                {formatDate(state.post.created)}
              </time>
            </div>
          )}

          {/* Reading Time */}
          {state.post.readingTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{state.post.readingTime}</span>
            </div>
          )}

          {/* Last Updated - Only show if update date is different from create date */}
          {state.post.updated && isDifferentDate(state.post.updated, state.post.created) && (
            <div className={cn(
              "flex items-center gap-2 group",
              "text-muted-foreground/80",
              "hover:text-primary transition-all duration-300"
            )}>
              <Edit className={cn(
                "h-5 w-5",
                "transition-transform duration-300",
                "group-hover:scale-110"
              )} />
              <span className="flex items-center gap-1">
                <time 
                  dateTime={state.post.updated}
                  className="font-medium"
                >
                  {formatDate(state.post.updated)}
                </time>
                <span className="text-muted-foreground/60">(Updated)</span>
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {state.post.tags && state.post.tags.length > 0 && (
          <div className={cn(
            "flex flex-wrap items-center gap-2",
            "animate-fade-in"
          )}>
            <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {state.post.tags.map((tag) => (
                <Link key={tag} href={`/blog/tags/${tag}`}>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "transition-all duration-300",
                      "hover:bg-primary hover:text-primary-foreground",
                      "cursor-pointer",
                      "transform hover:scale-105"
                    )}
                  >
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/PostHeader.tsx" line="2">

---

&nbsp;

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { PostMetadata } from "@/lib/types"; // Update import path
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Calendar, Clock, Tag, Edit } from "lucide-react";
import { getPost } from "@/lib/services"; // Add this import

// Remove the local PostMetadata interface since we're importing it

interface PostHeaderState {
  post: PostMetadata | null;
  isLoading: boolean;
  error: string | null;
  imageLoaded: boolean;
}

// Add a helper function at the top of the file
function isDifferentDate(date1: string | undefined, date2: string | undefined): boolean {
  if (!date1 || !date2) return false;
  // Remove any milliseconds and 'Z' suffix for comparison
  const clean1 = date1.split('.')[0].replace('Z', '');
  const clean2 = date2.split('.')[0].replace('Z', '');
  return clean1 !== clean2;
}

export default function PostHeader() {
  const [state, setState] = useState<PostHeaderState>({
    post: null,
    isLoading: true,
    error: null,
    imageLoaded: false,
  });

  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    const fetchPost = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const slug = pathname.split("/blog/posts/")[1];
        
        if (!slug) {
          throw new Error('Invalid slug');
        }

        // Use backend service instead of fetch
        const metadata = await getPost(slug);
        
        if (!mounted) return;

        if (!metadata?.title || !metadata?.created || !metadata?.tags) {
          throw new Error('Invalid post metadata');
        }

        setState(prev => ({ ...prev, post: metadata, isLoading: false }));
      } catch (error) {
        if (!mounted) return;

        const errorMessage = error instanceof Error ? error.message : "Failed to load post";
        console.error("Error loading post:", errorMessage);
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    };

    fetchPost();
    
    return () => {
      mounted = false;
    };
  }, [pathname]);

  const handleImageLoad = () => {
    setState((prev) => ({ ...prev, imageLoaded: true }));
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (state.error || !state.post) {
    return (
      <div className="text-destructive text-center p-4">
        {state.error || "Post not found"}
      </div>
    );
  }

  return (
    <motion.header
      className={cn(
        // Base styles
        "relative overflow-hidden",
        "rounded-xl md:rounded-2xl lg:rounded-3xl",
        "max-w-5xl mx-auto",
        "border border-post-header-border",
        
        // Gradients and backgrounds
        "bg-gradient-to-br from-post-header-gradient-from via-post-header-gradient-via to-post-header-gradient-to",
        "backdrop-blur-sm backdrop-saturate-150",
        
        // Shadows and effects
        "shadow-post-header",
        "transition-all duration-500 ease-out",
        "hover:shadow-post-header-hover hover:scale-[1.01]",
        
        // Dark mode adjustments
        "dark:from-post-header-gradient-from/90",
        "dark:via-post-header-gradient-via/90",
        "dark:to-post-header-gradient-to/90",
        "dark:border-post-header-border/50"
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Hero Image Container */}
      <div className={cn(
        "relative w-full",
        "aspect-[21/9] sm:aspect-[2/1] md:aspect-[21/9]",
        "overflow-hidden"
      )}>
        <Image
          src={state.post.image || "/logo.webp"}
          alt={state.post.title}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
          className={cn(
            "object-cover object-center",
            "transform transition-all duration-700",
            !state.imageLoaded && "blur-sm scale-105",
            state.imageLoaded && "blur-0 scale-100",
            "hover:scale-105 transition-transform duration-700"
          )}
          onLoad={handleImageLoad}
        />
        
        {/* Image Overlay */}
        <div className={cn(
          "absolute inset-0",
          "bg-post-header-image-overlay",
          "transition-opacity duration-300",
          "opacity-80 hover:opacity-60"
        )} />

        {/* Caption */}
        {state.post.caption && (
          <p className={cn(
            "absolute bottom-4 left-4",
            "text-sm sm:text-base lg:text-lg",
            "italic text-white",
            "px-3 py-1.5",
            "rounded-md",
            "bg-black/50 backdrop-blur-sm",
            "border border-white/10",
            "shadow-lg",
            "transition-all duration-300",
            "hover:bg-black/60 hover:scale-105"
          )}>
            {state.post.caption}
          </p>
        )}
      </div>

      {/* Content Section */}
      <div className={cn(
        "relative z-10",
        "p-4 sm:p-6 lg:p-8",
        "space-y-4 sm:space-y-6 lg:space-y-8"
      )}>
        {/* Title */}
        <motion.h1
          className={cn(
            "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
            "font-extrabold tracking-tight",
            "bg-gradient-heading bg-clip-text text-transparent",
            "leading-tight",
            "transition-colors duration-300"
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {state.post.title}
        </motion.h1>

        {/* Summary */}
        {state.post.summary && (
          <p className={cn(
            "text-base sm:text-lg lg:text-xl",
            "text-muted-foreground",
            "leading-relaxed",
            "max-w-prose"
          )}>
            {state.post.summary}
          </p>
        )}

        {/* Metadata Section */}
        <div className={cn(
          "flex flex-wrap gap-3 sm:gap-4 lg:gap-6",
          "text-sm sm:text-base",
          "text-muted-foreground",
          "border-t border-b border-border-muted",
          "py-3 sm:py-4",
          "transition-colors duration-300"
        )}>
          {/* Created Date */}
          {state.post.created && (
            <div className={cn(
              "flex items-center gap-2 group",
              "hover:text-primary transition-all duration-300"
            )}>
              <Calendar className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                "transition-transform duration-300",
                "group-hover:scale-110"
              )} />
              <time 
                dateTime={state.post.created}
                className="font-medium"
              >
                {formatDate(state.post.created)}
              </time>
            </div>
          )}

          {/* Reading Time */}
          {state.post.readingTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{state.post.readingTime}</span>
            </div>
          )}

          {/* Last Updated - Only show if update date is different from create date */}
          {state.post.updated && isDifferentDate(state.post.updated, state.post.created) && (
            <div className={cn(
              "flex items-center gap-2 group",
              "text-muted-foreground/80",
              "hover:text-primary transition-all duration-300"
            )}>
              <Edit className={cn(
                "h-5 w-5",
                "transition-transform duration-300",
                "group-hover:scale-110"
              )} />
              <span className="flex items-center gap-1">
                <time 
                  dateTime={state.post.updated}
                  className="font-medium"
                >
                  {formatDate(state.post.updated)}
                </time>
                <span className="text-muted-foreground/60">(Updated)</span>
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {state.post.tags && state.post.tags.length > 0 && (
          <div className={cn(
            "flex flex-wrap items-center gap-2",
            "animate-fade-in"
          )}>
            <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {state.post.tags.map((tag) => (
                <Link key={tag} href={`/blog/tags/${tag}`}>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "transition-all duration-300",
                      "hover:bg-primary hover:text-primary-foreground",
                      "cursor-pointer",
                      "transform hover:scale-105"
                    )}
                  >
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/PostLayout.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import React, { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import PostHeader from "@/components/PostHeader";
import PostPagination from "@/components/PostPagination";
import Comments from "@/components/Comments";

export function PostLayout({ children }: { children: React.ReactNode }) {
  return (
      <article className="space-y-8 max-w-none w-full overflow-x-hidden">
        <PostHeader />
        <hr className="border-border-muted" />
        {children}
        <hr className="border-border-muted" />
        <PostPagination />
        <hr className="border-border-muted" />
        <Comments />
      </article>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/PostPagination.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AdjacentPost } from "@/lib/posts";
import { getAdjacentPosts } from "@/lib/metadata";

export default function PostPagination() {
  const [state, setState] = useState<{
    data: { prevPost: AdjacentPost | null; nextPost: AdjacentPost | null };
    isLoading: boolean;
    error: string | null;
  }>({
    data: { prevPost: null, nextPost: null }, // Initialize with null values
    isLoading: true,
    error: null,
  });

  const pathname = usePathname();

  useEffect(() => {
    const loadAdjacentPosts = async () => {
      try {
        console.log('Loading adjacent posts for:', pathname); // Debug log
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const slug = pathname.split("/blog/posts/")[1];
        if (!slug) {
          console.warn('No slug found in pathname:', pathname); // Debug log
          return;
        }
        
        const data = await getAdjacentPosts(slug);
        console.log('Adjacent posts data:', data); // Debug log
        // Ensure data has the expected shape
        setState(prev => ({
          ...prev,
          data: {
            prevPost: data?.prevPost || null,
            nextPost: data?.nextPost || null
          },
          isLoading: false
        }));
      } catch (error) {
        console.error("Error loading adjacent posts:", error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to load navigation",
          data: { prevPost: null, nextPost: null } // Reset data on error
        }));
      }
    };

    loadAdjacentPosts();
  }, [pathname]);

  if (state.isLoading) {
    return <div className="h-24 flex items-center justify-center">Loading...</div>;
  }

  if (state.error) {
    return (
      <div className="text-destructive text-center my-8 p-4 rounded-lg bg-destructive/10">
        {state.error}
      </div>
    );
  }

  // Safe destructuring after checks
  const { prevPost, nextPost } = state.data;
  
  // Return early if no navigation is possible
  if (!prevPost && !nextPost) return null;

  return (
    <nav className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12" aria-label="Post navigation">
      {prevPost ? (
        <Link href={`/blog/posts/${prevPost.slug}`} className="group">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className={cn(
              "pagination-card",
              "p-6 h-full",
              "bg-pagination-gradient backdrop-blur-md",
              "border border-card-border/50",
              "shadow-lg transition-all duration-300",
              "hover:border-primary/50 hover:shadow-xl",
              "dark:hover:border-primary/30"
            )}>
              <div className="flex items-center gap-4 relative z-10">
                <div className="pagination-icon">
                  <ChevronLeft className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium mb-1",
                    "text-muted-foreground",
                    "group-hover:text-primary",
                    "transition-colors duration-300"
                  )}>
                    Previous Post
                  </p>
                  <h3 className={cn(
                    "font-display text-lg",
                    "text-foreground/90",
                    "line-clamp-1",
                    "group-hover:text-primary",
                    "transition-colors duration-300"
                  )}>
                    {prevPost.title}
                  </h3>
                </div>
              </div>
            </Card>
          </motion.div>
        </Link>
      ) : <div />}

      {nextPost ? (
        <Link href={`/blog/posts/${nextPost.slug}`} className="group md:ml-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className={cn(
              "pagination-card",
              "p-6 h-full",
              "bg-pagination-gradient backdrop-blur-md",
              "border border-card-border/50",
              "shadow-lg transition-all duration-300",
              "hover:border-primary/50 hover:shadow-xl",
              "dark:hover:border-primary/30"
            )}>
              <div className="flex items-center gap-4 relative z-10">
                <div className="flex-1 text-right">
                  <p className={cn(
                    "text-sm font-medium mb-1",
                    "text-muted-foreground",
                    "group-hover:text-primary",
                    "transition-colors duration-300"
                  )}>
                    Next Post
                  </p>
                  <h3 className={cn(
                    "font-display text-lg",
                    "text-foreground/90",
                    "line-clamp-1",
                    "group-hover:text-primary",
                    "transition-colors duration-300"
                  )}>
                    {nextPost.title}
                  </h3>
                </div>
                <div className="pagination-icon">
                  <ChevronRight className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          </motion.div>
        </Link>
      ) : <div />}
    </nav>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/Scroll.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { animateScroll } from "react-scroll";
import { cn } from "@/lib/utils";

const CustomScrollbars = ({ children }: { children: React.ReactNode }) => {
  const [showButton, setShowButton] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const contentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      setHasOverflow(contentHeight > viewportHeight);
    };

    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    // Check overflow on mount and window resize
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", checkOverflow);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    animateScroll.scrollToTop({
      duration: 500,
      smooth: "easeInOutQuint",
    });
  };

  return (
    <div className={`relative min-h-full ${hasOverflow ? 'overflow-y-auto' : 'overflow-y-hidden'}`}>
      {children}
      {hasOverflow && showButton && (
        <button
          onClick={scrollToTop}
          className="fixed z-50 p-3 rounded-full shadow-lg backdrop-blur-sm bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/90 dark:hover:bg-gray-700/90 text-gray-700 dark:text-gray-300 transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-primary/50 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
          aria-label="Scroll to top"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default CustomScrollbars;

```

---

</SwmSnippet>

<SwmSnippet path="/components/ScrollIndicator.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

export default function ScrollIndicator() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 20,
    restDelta: 0.0001,
    mass: 0.5
  });
  
  const pathname = usePathname();
  
  if (!pathname.startsWith('/blog/posts/')) {
    return null;
  }

  return (
    <motion.div 
      className={`
        fixed top-0 left-0 right-0 z-50
        h-[3px] origin-[0%]
        bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600
        dark:from-blue-400 dark:via-violet-400 dark:to-pink-400
        backdrop-blur-sm
        shadow-[0_0_8px_rgba(59,130,246,0.5)]
        dark:shadow-[0_0_8px_rgba(96,165,250,0.5)]
        hover:shadow-[0_0_12px_rgba(59,130,246,0.7)]
        dark:hover:shadow-[0_0_12px_rgba(96,165,250,0.7)]
        transition-shadow duration-300
      `}
      style={{ 
        scaleX,
        backgroundSize: '200% 100%',
        animation: 'gradientMove 8s linear infinite'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    />
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/TagLink.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface TagLinkProps {
  tag: string;
  count?: number;
  showCount?: boolean;
  isNested?: boolean; // New prop to indicate if it's nested within another link
}

export default function TagLink({ tag, count, showCount = false, isNested = false }: TagLinkProps) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Badge
        variant="secondary"
        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground cursor-pointer"
      >
        #{tag}
        {showCount && count !== undefined && (
          <span className="ml-1 text-xs">({count})</span>
        )}
      </Badge>
    </motion.div>
  );

  return isNested ? content : <Link href={`/blog/tags/${tag}`}>{content}</Link>;
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/ThemeProvider.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
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
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SocialLinkProps {
  link: {
    name: string;
    url: string;
    icon: IconProp;
    color: string;
  };
}

export default function SocialLink({ link }: SocialLinkProps) {
  const isInternalLink = link.url.startsWith("/");

  const containerVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.05,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  const iconVariants = {
    initial: { y: 0 },
    hover: { 
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
        yoyo: Infinity
      }
    }
  };

  const content = (
    <motion.div
      className={cn(
        // Layout
        "flex flex-col items-center justify-center",
        "space-y-2 sm:space-y-3",
        "w-full h-full",
        "p-3 sm:p-4 md:p-6",
        // Theme-aware background
        "bg-gradient-to-br",
        "from-white/95 to-white/80",
        "dark:from-gray-800/95 dark:to-gray-800/80",
        // Enhanced blur and border
        "backdrop-blur-sm",
        "rounded-xl",
        "border border-primary/10",
        "dark:border-primary/20",
        // Improved shadows
        "shadow-lg shadow-primary/5",
        "dark:shadow-primary/10",
        // Group hover
        "group",
        // Smooth transitions
        "transition-all duration-300"
      )}
      variants={containerVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
    >
      <motion.div 
        variants={iconVariants}
        className="relative"
      >
        <FontAwesomeIcon 
          icon={link.icon} 
          className={cn(
            // Responsive sizing
            "text-2xl sm:text-3xl",
            // Theme-aware effects
            "transition-all duration-300",
            "group-hover:scale-110",
            "group-hover:[text-shadow:0_0_10px_currentColor]",
            "dark:group-hover:[text-shadow:0_0_15px_currentColor]"
          )}
          style={{ color: link.color }}
        />
      </motion.div>
      <span className={cn(
        // Responsive text
        "text-base sm:text-lg md:text-xl",
        "font-semibold",
        // Theme-aware colors
        "text-gray-900 dark:text-gray-100",
        // Transitions
        "transition-colors duration-300",
        "group-hover:text-primary dark:group-hover:text-primary-foreground"
      )}>
        {link.name}
      </span>
    </motion.div>
  );

  const sharedClassName = cn(
    "block w-full h-full",
    "transform transition-all duration-300",
    // Hover effects
    "hover:-translate-y-1",
    "hover:shadow-xl hover:shadow-primary/10",
    "dark:hover:shadow-primary/20",
    // Focus styles for accessibility
    "focus:outline-none focus:ring-2",
    "focus:ring-primary/50 dark:focus:ring-primary/30",
    "focus:ring-offset-2 focus:ring-offset-background"
  );

  return isInternalLink ? (
    <Link href={link.url} className={sharedClassName}>
      {content}
    </Link>
  ) : (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={sharedClassName}
    >
      {content}
    </a>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/components/searchbar.module.scss" line="1">

---

&nbsp;

```scss
// components/searchbar.module.scss

.searchInput {
  @apply rounded-xl shadow-md;
  @apply bg-white dark:bg-gray-800;
  @apply placeholder-gray-500 text-gray-900 dark:text-gray-100;
  @apply focus:outline-none focus:ring-4 focus:ring-blue-500/50;
  transition: box-shadow 0.3s ease-in-out;
}

.tagBadge {
  @apply cursor-pointer px-3 py-1 rounded-full text-sm;
  @apply bg-gray-200 dark:bg-gray-700;
  @apply hover:bg-blue-500 hover:text-white transition-colors;
}

.activeTagBadge {
  @apply bg-blue-500 text-white;
}
```

---

</SwmSnippet>

<SwmSnippet path="/components/SearchBar.tsx" line="1">

---

&nbsp;

```tsx
// components/SearchBar.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import PostCard from "./PostCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"; // Change import to use separate icons
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import TagLink from "@/components/TagLink"; // Ensure this is the correct import path
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { backend } from '@/lib/services/backend';
import { PostMetadata } from '@/lib/types';


// Update Post interface to match metadata
interface Post {
	slug: string;
	title: string;
	summary: string;
	created: string;    // Changed from date
	updated?: string;   // Added
	date?: string;      // Keep for backward compatibility
	tags: string[];
	content: string;
	image?: string;
	readingTime?: string;
	sortings?: {
		byDate: {
			asc: string[];
			desc: string[];
		};
		byTitle: {
			asc: string[];
			desc: string[];
		};
	};
}

interface SearchBarProps {
	posts: Post[];
	tags: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ posts, tags: unsortedTags }) => {
	// Filter out invalid posts
	const validPosts = useMemo(() => 
		posts.filter(post => post.title && post.created && post.tags)
	, [posts]);

	// Sort tags alphabetically
	const tags = useMemo(() => 
		[...unsortedTags].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
	, [unsortedTags]);

	// Ensure stable initial states
	const [mounted, setMounted] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Post[]>([]); // Start empty
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [sortMethod, setSortMethod] = useState<string>("date");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	// Update mount effect to handle empty posts
	useEffect(() => {
		if (!validPosts.length) {
			console.warn("No valid posts found");
			setResults([]);
			return;
		}

		const sortedPosts = [...validPosts].sort(
			(a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
		);
		setResults(sortedPosts);
		setMounted(true);
	}, [validPosts]);

	// Memoize the Fuse instance
	const fuse = useMemo(
		() =>
			new Fuse(posts, {
				keys: [
					{ name: "title", weight: 1.0 },
					{ name: "summary", weight: 0.8 },
					{ name: "content", weight: 0.6 },
					{ name: "tags", weight: 0.9 },
				],
				includeScore: true,
				threshold: 0.3,
				ignoreLocation: true, // Important for full-text search
				useExtendedSearch: true,
				findAllMatches: true, // Important for thorough search
			}),
		[posts]
	);

	// Update search effect to maintain sort order
	useEffect(() => {
		let searchResults = [...posts]; // Create new array to avoid mutating props

		if (query.trim()) {
			const fuseResults = fuse.search(query);
			// Sort by score and map to items
			searchResults = fuseResults
				.sort((a, b) => (a.score || 0) - (b.score || 0))
				.map(({ item }) => item);
		}

		if (selectedTags.length > 0) {
			searchResults = searchResults.filter((post) =>
				selectedTags.every((tag) => post.tags.includes(tag))
			);
		}

		// Always apply date sorting if no specific sort method is selected
		searchResults = searchResults.sort((a, b) => {
			const modifier = sortDirection === "asc" ? -1 : 1;
			if (sortMethod === "title") {
				return a.title.localeCompare(b.title) * modifier;
			}
			// Default to date sorting
			return (
				(new Date(b.created).getTime() - new Date(a.created).getTime()) * modifier
			);
		});

		setResults(searchResults);
	}, [query, selectedTags, sortMethod, sortDirection, posts, fuse]);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	};

	const toggleTag = (tag: string) => {
		setSelectedTags((prevTags) =>
			prevTags.includes(tag)
				? prevTags.filter((t) => t !== tag)
				: [...prevTags, tag]
		);
	};

	// Add this function to clean up URLs
	const cleanUrl = (slug: string) => {
		// Remove any trailing /page or just / from the slug
		return slug.replace(/\/(page)?$/, '');
	};

	if (!mounted) {
		return null; // Prevent hydration issues by not rendering until mounted
	}

	return (
		<div className="w-full max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
			{/* Search Input Section - Enhanced responsiveness */}
			<div className="relative">
				<div className="relative group">
					<Input
						type="text"
						className={cn(
							"w-full",
							"p-3 sm:p-4",
							"text-base sm:text-lg",
							"bg-background/95 backdrop-blur-sm",
							"border-2 border-border",
							"hover:border-primary/50 focus:border-primary",
							"dark:bg-gray-900/95 dark:text-gray-100",
							"placeholder:text-muted-foreground/60",
							"transition-all duration-300 ease-in-out",
							"rounded-lg shadow-sm hover:shadow-md",
							"focus:ring-2 focus:ring-primary/20",
							"dark:focus:ring-primary/40"
						)}
						placeholder="Search posts by title, content, or tags..."
						value={query}
						onChange={handleSearch}
					/>
					<div
						className={cn(
							"absolute inset-x-0 bottom-0 h-0.5",
							"bg-gradient-to-r from-primary/40 via-primary to-primary/40",
							"transform scale-x-0 group-hover:scale-x-100",
							"transition-transform duration-300"
						)}
					/>
				</div>
			</div>

			{/* Filters and Sort Section - Improved layout */}
			<div
				className={cn(
					"flex flex-col gap-4",
					"sm:flex-row sm:items-start",
					"lg:items-center"
				)}
			>
				{/* Tags Section - Better wrapping */}
				<div
					className={cn(
						"flex-1",
						"flex flex-wrap gap-2",
						"max-h-[120px] sm:max-h-none",
						"overflow-y-auto sm:overflow-visible",
						"scrollbar-thin scrollbar-thumb-primary/20",
						"scrollbar-track-transparent",
						"items-center" // Add this
					)}
				>
					{tags.map((tag) => (
						<motion.div
							key={tag}
							onClick={() => toggleTag(tag)}
							className={cn(
								"cursor-pointer transition-all duration-200",
								selectedTags.length > 0 && !selectedTags.includes(tag)
									? "opacity-40 scale-95"
									: "opacity-100 scale-100",
								"hover:scale-105"
							)}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<TagLink tag={tag} isNested />
						</motion.div>
					))}

						<Link href="/blog/tags">
							<Badge
								variant="secondary"
								className="bg-secondary hover:bg-secondary/80 text-secondary-foreground cursor-pointer"
							>
								all tags
							</Badge>
						</Link>
				</div>

				{/* Sort Controls - Responsive layout */}
				<div
					className={cn(
						"flex items-center gap-3",
						"sm:ml-auto",
						"w-full sm:w-auto",
						"justify-end"
					)}
				>
					<Select value={sortMethod} onValueChange={setSortMethod}>
						<SelectTrigger
							className={cn(
								"w-full sm:w-[180px]",
								"bg-background/95 dark:bg-gray-800/95",
								"backdrop-blur-sm",
								"border-2 hover:border-primary/50",
								"transition-all duration-200"
							)}
						>
							<SelectValue placeholder="Sort by..." />
						</SelectTrigger>
						<SelectContent className="border-2 dark:border-gray-700">
							<SelectItem value="date">Sort by Date</SelectItem>
							<SelectItem value="title">Sort by Title</SelectItem>
						</SelectContent>
					</Select>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									onClick={() =>
										setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
									}
									className={cn(
										"h-10 w-10",
										"border-2 hover:border-primary/50",
										"bg-background/95 dark:bg-gray-800/95",
										"backdrop-blur-sm",
										"hover:bg-accent/10 dark:hover:bg-gray-700",
										"transition-all duration-200"
									)}
								>
									{sortDirection === "asc" ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent
								className="bg-popover/95 backdrop-blur-sm"
								sideOffset={5}
							>
								<p className="text-sm">
									{sortDirection === "asc" ? "Ascending" : "Descending"}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			<Separator className="opacity-50" />

			{/* Results Grid - Responsive layout */}
			<div
				className={cn(
					"grid gap-4 sm:gap-6 lg:gap-8",
					"grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
					"[&>*]:h-full",
					"auto-rows-fr"
				)}
			>
				{results.length > 0 ? (
					results.length === 1 ? (
						// Single result - centered
						<div className="sm:col-span-2 lg:col-start-2 lg:col-span-1">
							<PostCard 
								post={{
									...results[0],
									slug: cleanUrl(results[0].slug)
								}} 
								className="h-full" 
							/>
						</div>
					) : (
						// Multiple results with staggered animation
						results.map((post, idx) => (
							<motion.div
								key={post.slug}
								className="h-full"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									type: "spring",
									stiffness: 100,
									damping: 15,
									delay: Math.min(idx * 0.1, 0.8),
								}}
							>
								<PostCard 
									post={{
										...post,
										slug: cleanUrl(post.slug)
									}} 
									className="h-full" 
								/>
							</motion.div>
						))
					)
				) : (
					// No results message
					<motion.div
						className="col-span-full text-center py-12"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
					>
						<p className="text-lg text-muted-foreground mb-4">
							No matching posts found.
						</p>
						<Button
							variant="ghost"
							onClick={() => {
								setQuery("");
								setSelectedTags([]);
							}}
							className={cn(
								"hover:text-primary",
								"transition-all duration-200",
								"hover:scale-105 active:scale-95"
							)}
						>
							Clear filters
						</Button>
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default SearchBar;
```

---

</SwmSnippet>

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBcGVyc29uYWwtd2Vic2l0ZSUzQSUzQXd5YXR0b3dhbHNo" repo-name="personal-website"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
