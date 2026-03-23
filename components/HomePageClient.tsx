"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Links } from "@/components/Links";
import { LandingTitle } from "@/components/LandingTitle";
import { PostCard } from "@/components/PostCard";
import { motion, useScroll, useTransform, Variants } from "motion/react";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { cn } from "@/lib/utils";
import type { PostMetadata } from "@/lib/types";
import styles from "@/app/page.module.css";

const ParticlesBackground = dynamic(() => import('@/components/ParticlesBackground').then(mod => mod.ParticlesBackground), { ssr: false });

interface HomePageClientProps {
  recentPosts: PostMetadata[];
}

export function HomePageClient({ recentPosts }: HomePageClientProps) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const show = () => setShowParticles(true);

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(show, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(show, 400);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const imageScale = useTransform(scrollYProgress, [0, 0.5], prefersReducedMotion ? [1, 1] : [1, 0.85]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.5], prefersReducedMotion ? [1, 1] : [1, 0.8]);
  const imageRotate = useTransform(scrollYProgress, [0, 0.5], prefersReducedMotion ? [0, 0] : [0, -5]);

  // Enhanced animations
  // Content starts visible — no hidden state that delays FCP/LCP
  const pageVariants: Variants = {
    visible: {
      opacity: 1,
      y: 0,
    }
  };

  // Image starts visible (no hidden state) to avoid delaying LCP
  const imageContainerVariants: Variants = {
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
    },
    hover: prefersReducedMotion ? {} : {
      scale: 1.05,
      rotate: 5,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <motion.div
      initial={false}
      animate="visible"
      variants={pageVariants}
      className={cn(
        "relative min-h-screen overflow-hidden -mt-14 sm:-mt-16",
        "bg-gradient-to-b from-background/50 via-background/50 to-background/50",
        "dark:from-background/50 dark:via-background/50 dark:to-background/50",
        styles.mainContainer
      )}
    >
      {showParticles && (
        <div aria-hidden="true">
          <ParticlesBackground />
        </div>
      )}

        <motion.div
          className={cn(
            "relative z-10 flex flex-col justify-start min-h-screen",
            "px-4 sm:px-6 lg:px-8",
            "pb-12 sm:pb-16 lg:pb-20",
            "max-w-7xl mx-auto w-full"
          )}
        >
        <motion.div
          className="flex flex-col items-center justify-center space-y-8"
        >
            <motion.div
              className={cn(styles.imageContainer, "relative group")}
              variants={imageContainerVariants}
              whileHover="hover"
              style={{
                scale: imageScale,
                opacity: imageOpacity,
                rotate: imageRotate
              }}
            >
              <div className={styles.imageGlow} aria-hidden="true" />
              <Image
                className={cn(
                  "rounded-full shadow-2xl transition-all duration-300",
                  "border-4 border-white/90 dark:border-gray-800/90",
                  styles.profileImage
                )}
                src="/logo.webp"
                alt="Logo — Wyatt Walsh"
                width={240}
                height={240}
                sizes="(max-width: 640px) 160px,
                       (max-width: 768px) 180px,
                       (max-width: 1024px) 200px,
                       (max-width: 1280px) 220px,
                       240px"
                priority
                fetchPriority="high"
                quality={85}
              />
            </motion.div>

            <LandingTitle />

            <Links />

            {/* Latest Writing Section */}
            {recentPosts.length > 0 && (
              <section
                className="w-full max-w-6xl mx-auto mt-12 px-4"
              >
                <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  Latest Writing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentPosts.map((post) => (
                    <div key={post.slug}>
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
                <Link
                  href="/blog"
                  className={cn(
                    "block text-center mt-8 text-primary hover:text-primary/80",
                    "transition-colors duration-200",
                    "text-sm font-medium tracking-wide"
                  )}
                >
                  View all posts →
                </Link>
              </section>
            )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
