"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
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
        "bg-gradient-to-b from-background/30 via-background/35 to-background/45",
        "dark:from-background/25 dark:via-background/30 dark:to-background/45",
        styles.mainContainer
      )}
    >
      <div aria-hidden="true">
        <ParticlesBackground />
      </div>

        <motion.div
          className={cn(
            "relative z-10 flex flex-col justify-center min-h-screen",
            "px-4 sm:px-6 lg:px-8",
            "pt-16 sm:pt-20 pb-10 sm:pb-14 lg:pb-18",
            "max-w-7xl mx-auto w-full",
            styles.heroViewportFrame
          )}
        >
        <motion.div
          className={cn("flex flex-col items-center justify-center", styles.heroStack)}
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

            <div className={styles.titleStage}>
              <LandingTitle hideSignalDeck framed={false} />
            </div>

            <div className={styles.linksStage}>
              <Links />
            </div>

            {/* Latest Writing Section */}
            {recentPosts.length > 0 && (
              <section
                className={styles.latestWritingSection}
              >
                <h2 className={styles.latestWritingHeading}>
                  Latest Writing
                </h2>
                <div className={styles.latestWritingGrid}>
                  {recentPosts.map((post) => (
                    <div key={post.slug}>
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
                <Link
                  href="/blog"
                  className={styles.latestWritingLink}
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
