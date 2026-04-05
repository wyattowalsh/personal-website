"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const ParticlesBackground = dynamic(() => import("@/components/ParticlesBackground").then(mod => mod.ParticlesBackground), { ssr: false });
import { BlogContent } from "@/components/BlogContent";
import type { PostMetadata } from "@/lib/types";

interface BlogPageContentProps {
  posts: PostMetadata[];
  tags: string[];
  initialQuery: string;
}

export function BlogPageContent({ posts, tags, initialQuery }: BlogPageContentProps) {
  const [showParticles, setShowParticles] = useState(false);
  const PARTICLE_DEFER_MS = 5000;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(() => setShowParticles(true), { timeout: PARTICLE_DEFER_MS });
      return () => win.cancelIdleCallback?.(idleId);
    }

    const timeoutId = setTimeout(() => setShowParticles(true), PARTICLE_DEFER_MS);
    return () => clearTimeout(timeoutId);
  }, [PARTICLE_DEFER_MS]);

  return (
    <>
      {showParticles ? <ParticlesBackground /> : null}
      <BlogContent posts={posts} tags={tags} initialQuery={initialQuery} />
    </>
  );
}
