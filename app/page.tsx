"use client";

import { useEffect } from "react";
import Image from "next/image";
import Links from "@/components/Links";
import { Separator } from "@/components/ui/separator";
import LandingTitle from "@/components/LandingTitle";
import ParticlesBackground from "@/components/ParticlesBackground";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useMediaQuery } from "usehooks-ts";
import styles from "./page.module.scss";

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const logoSize = isLargeScreen ? 256 : 192;

  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const imageVariants = {
    initial: { opacity: 0, scale: 0.8, rotate: -10 },
    animate: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 1, ease: "easeOut" } },
    hover: { scale: 1.1, rotate: 5, transition: { yoyo: Infinity, duration: 0.5 } },
  };

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "";
    };
  }, []);

  return (
    <main className="relative overflow-hidden min-h-screen">
      <ParticlesBackground />

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50"
        style={{ scaleX }}
      />

      <div className="relative z-10 flex flex-col min-h-screen px-4">
        <motion.div
          className="flex flex-col items-center justify-center space-y-8 py-20 md:min-h-screen md:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="relative"
            style={{ scale: imageScale, opacity: imageOpacity }}
            variants={imageVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            <Image
              className="rounded-full shadow-xl hover:shadow-2xl transition-shadow duration-300 border-4 border-white dark:border-gray-800"
              src="/logo.webp"
              alt="Logo — Wyatt Walsh"
              width={logoSize}
              height={logoSize}
              priority
              quality={100}
            />
          </motion.div>

          <LandingTitle />

          <Separator className="enhanced-separator w-3/4 max-w-md my-4" />

          <Links />
        </motion.div>
      </div>
    </main>
  );
}
