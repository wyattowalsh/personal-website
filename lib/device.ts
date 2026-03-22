"use client";

// ---------- Types ----------

interface NavigatorExtended extends Navigator {
  connection?: { effectiveType?: string; downlink?: number };
}

// ---------- Cache ----------

let cachedSlim: Record<string, string | number | boolean> | null = null;

// ---------- Device context (slim) ----------

/** Trimmed device context suitable for Vercel Analytics property limits. */
export function getDeviceContextSlim(): Record<string, string | number | boolean> {
  if (cachedSlim) return cachedSlim;

  const nav = navigator as NavigatorExtended;
  const conn = nav.connection;

  cachedSlim = {
    screen: `${screen.width}x${screen.height}`,
    dpr: window.devicePixelRatio,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    touchPoints: navigator.maxTouchPoints,
    cores: navigator.hardwareConcurrency,
    connection: conn?.effectiveType ?? 'unknown',
    platform: navigator.platform,
  };

  return cachedSlim;
}
