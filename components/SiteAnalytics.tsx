"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const GoogleTagManager = dynamic(
  () => import("@next/third-parties/google").then((mod) => mod.GoogleTagManager),
  { ssr: false },
);
const GoogleAnalytics = dynamic(
  () => import("@next/third-parties/google").then((mod) => mod.GoogleAnalytics),
  { ssr: false },
);
const VercelAnalytics = dynamic(
  () => import("@vercel/analytics/react").then((mod) => mod.Analytics),
  { ssr: false },
);
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false },
);
const PostHogPageviewTracker = dynamic(
  () => import("@/components/PostHogPageviewTracker").then((mod) => mod.PostHogPageviewTracker),
  { ssr: false },
);

interface SiteAnalyticsProps {
  gaId?: string;
  gtmId?: string;
  enabled: boolean;
}

const IDLE_TIMEOUT_MS = 3000;

export function SiteAnalytics({ gaId, gtmId, enabled }: SiteAnalyticsProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof win.requestIdleCallback === "function") {
      const idleId = win.requestIdleCallback(() => setActive(true), { timeout: IDLE_TIMEOUT_MS });
      return () => win.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(() => setActive(true), IDLE_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [enabled]);

  if (!enabled || !active) return null;

  return (
    <>
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      <PostHogPageviewTracker />
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
}
