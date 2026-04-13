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
import { ArrowRight } from "lucide-react";

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

  const imageScale = useTransform(scrollYProgress, [0, 0.5], prefersReducedMotion ? [1, 1] : [1, 0.92]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.5], prefersReducedMotion ? [1, 1] : [1, 0.85]);

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
    },
    hover: prefersReducedMotion ? {} : {
      scale: 1.03,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  return (
    <motion.div
      initial={false}
      animate="visible"
      variants={pageVariants}
      className={cn(
        "relative min-h-screen overflow-hidden -mt-14 sm:-mt-16",
        styles.mainContainer
      )}
    >
      {/* Ambient gradient layer */}
      <div className={styles.ambientGradient} aria-hidden="true" />
      
      {showParticles && (
        <div aria-hidden="true">
          <ParticlesBackground />
        </div>
      )}

      <motion.div
        className={cn(
          "relative z-10 flex flex-col justify-center min-h-screen",
          "px-4 sm:px-6 lg:px-8",
          "pt-20 sm:pt-24 pb-16 sm:pb-20 lg:pb-24",
          "max-w-7xl mx-auto w-full",
          styles.heroViewportFrame
        )}
      >
        <motion.div
          className={cn("flex flex-col items-center justify-center", styles.heroStack)}
        >
          {/* Profile Image with premium treatment */}
          <motion.div
            className={cn(styles.imageContainer, "relative group")}
            variants={imageContainerVariants}
            whileHover="hover"
            style={{
              scale: imageScale,
              opacity: imageOpacity,
            }}
          >
            {/* Outer glow ring */}
            <div className={styles.imageOuterRing} aria-hidden="true" />
            {/* Inner glow */}
            <div className={styles.imageGlow} aria-hidden="true" />
            {/* Accent light streak */}
            <div className={styles.imageLightStreak} aria-hidden="true" />
            <Image
              className={cn(
                "rounded-full transition-all duration-500",
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
              quality={75}
            />
          </motion.div>

          {/* Landing Title with enhanced spacing */}
          <div className={styles.titleWrapper}>
            <LandingTitle hideSignalDeck framed={false} />
          </div>

          {/* Links section with visual connector */}
          <div className={styles.linksWrapper}>
            <Links />
          </div>

          {/* Latest Writing Section - Editorial treatment */}
          {recentPosts.length > 0 && (
            <section className={styles.writingSection}>
              {/* Section header with accent line */}
              <div className={styles.sectionHeader}>
                <div className={styles.sectionAccentLine} aria-hidden="true" />
                <h2 className={styles.sectionTitle}>
                  Latest Writing
                </h2>
                <div className={styles.sectionAccentLine} aria-hidden="true" />
              </div>
              
              {/* Post cards grid with staggered reveal potential */}
              <div className={styles.postsGrid}>
                {recentPosts.map((post, index) => (
                  <div 
                    key={post.slug} 
                    className={styles.postCardWrapper}
                    style={{ '--card-index': index } as React.CSSProperties}
                  >
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
              
              {/* View all link with premium styling */}
              <Link
                href="/blog"
                className={cn(
                  "group inline-flex items-center gap-2 mt-10",
                  "text-sm font-medium tracking-wide",
                  "text-foreground/70 hover:text-foreground",
                  "transition-all duration-300",
                  styles.viewAllLink
                )}
              >
                <span>View all posts</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </section>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
