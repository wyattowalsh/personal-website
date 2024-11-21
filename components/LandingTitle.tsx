"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function LandingTitle() {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const title = "Wyatt Walsh";
  const letters = Array.from(title);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.h1
      ref={ref}
      className="text-5xl sm:text-6xl md:text-7xl font-bold font-display text-center
                 bg-clip-text text-transparent bg-gradient-to-r 
                 from-purple-500 via-pink-500 to-red-500
                 animate-gradient p-2"
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block cursor-default"
          whileHover={{
            scale: 1.2,
            rotate: Math.random() * 10 - 5,
            textShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
            transition: { duration: 0.2 },
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.h1>
  );
}
