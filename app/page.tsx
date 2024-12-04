"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Links from "@/components/Links";  // Remove .tsx extension
import { Separator } from "@/components/ui/separator";
import LandingTitle from "@/components/LandingTitle";
import ParticlesBackground from "@/components/ParticlesBackground";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import styles from "./page.module.scss";

export default function HomePage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
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
        staggerChildren: 0.2
      }
    }
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
        bounce: 0.4
      }
    },
    hover: { 
      scale: 1.05,
      rotate: 5,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className={cn(
        "relative min-h-screen overflow-hidden",
        "bg-gradient-to-b from-background/50 via-background/50 to-background/50", // Modified opacity
        "dark:from-background/50 dark:via-background/50 dark:to-background/50",
        styles.mainContainer
      )}
    >
      <ParticlesBackground />
      
      <motion.div
        className={styles.progressBar}
        style={{ scaleX }}
      />

      <motion.div
        ref={ref}
        className={cn(
          "relative z-10 flex flex-col justify-center min-h-screen", // Add 'justify-center'
          "px-4 sm:px-6 lg:px-8",
          "py-12 sm:py-16 lg:py-20",
          "max-w-7xl mx-auto w-full",
          "backdrop-blur-sm"
        )}
      >
        <AnimatePresence mode="wait">
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
              <div className={styles.imageGlow} />
              <Image
                className={cn(
                  "rounded-full shadow-2xl transition-all duration-300",
                  "border-4 border-white/90 dark:border-gray-800/90",
                  styles.profileImage
                )}
                src="/logo.webp"
                alt="Logo — Wyatt Walsh"
                width={240}  // Set to largest size
                height={240} // Set to largest size
                sizes="(max-width: 640px) 160px,
                       (max-width: 768px) 180px,
                       (max-width: 1024px) 200px,
                       (max-width: 1280px) 220px,
                       240px"
                priority
                quality={100}
              />
            </motion.div>

            <LandingTitle />
            
            <motion.div
              className="w-full max-w-2xl"
              variants={{
                hidden: { opacity: 0, scaleX: 0 },
                visible: { 
                  opacity: 1, 
                  scaleX: 1,
                  transition: { duration: 0.8, ease: "easeInOut" }
                }
              }}
            >
            </motion.div>

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
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.main>
  );
}
