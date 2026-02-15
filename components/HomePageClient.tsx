"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import Links from "@/components/Links";
import LandingTitle from "@/components/LandingTitle";
import PostCard from "@/components/PostCard";
import { motion, useScroll, useTransform, Variants } from "motion/react";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { cn } from "@/lib/utils";
import styles from "@/app/page.module.scss";

const ParticlesBackground = dynamic(() => import('@/components/ParticlesBackground'), { ssr: false });

interface Post {
  slug: string;
  title?: string;
  summary?: string;
  created?: string;
  updated?: string;
  tags?: string[];
  image?: string;
  readingTime?: string;
}

interface HomePageClientProps {
  recentPosts: Post[];
}

export default function HomePageClient({ recentPosts }: HomePageClientProps) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const imageScale = useTransform(scrollYProgress, [0, 0.5], prefersReducedMotion ? [1, 1] : [1, 0.85]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.5], prefersReducedMotion ? [1, 1] : [1, 0.8]);
  const imageRotate = useTransform(scrollYProgress, [0, 0.5], prefersReducedMotion ? [0, 0] : [0, -5]);

  // Enhanced animations
  const pageVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
        staggerChildren: prefersReducedMotion ? 0 : 0.2
      }
    }
  };

  const imageContainerVariants: Variants = {
    hidden: { scale: prefersReducedMotion ? 1 : 0.8, opacity: 0, rotate: prefersReducedMotion ? 0 : -10 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        duration: 1,
        bounce: prefersReducedMotion ? 0 : 0.4
      }
    },
    hover: prefersReducedMotion ? {} : {
      scale: 1.05,
      rotate: 5,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className={cn(
        "relative min-h-screen overflow-hidden",
        "bg-gradient-to-b from-background/50 via-background/50 to-background/50",
        "dark:from-background/50 dark:via-background/50 dark:to-background/50",
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
          "py-12 sm:py-16 lg:py-20",
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
                quality={85}
              />
            </motion.div>

            <LandingTitle />

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: 0.4 }
                }
              }}
            >
              <Links />
            </motion.div>

            {/* Latest Writing Section */}
            {recentPosts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full max-w-6xl mx-auto mt-12 px-4"
              >
                <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  Latest Writing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentPosts.map((post) => (
                    <motion.div
                      key={post.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <PostCard post={post} />
                    </motion.div>
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
              </motion.section>
            )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
