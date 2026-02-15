"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { usePathname } from "next/navigation";

export default function ScrollIndicator() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 20,
    restDelta: 0.0001,
    mass: 0.5
  });

  const pathname = usePathname();

  if (!pathname.startsWith('/blog/posts/') || prefersReducedMotion) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
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
    </>
  );
}
