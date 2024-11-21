"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

export default function ScrollIndicator() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const pathname = usePathname();
  // Check if it's a blog post AND not the homepage
  const shouldShow = pathname.startsWith('/blog/posts/') && pathname !== '/';

  // Don't show on homepage or non-blog pages
  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {/* Progress bar at top of page */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 z-50"
        style={{ scaleX, transformOrigin: "0%" }}
      />

      {/* Scroll indicator at bottom */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 hidden md:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div
          className={`
            w-6 h-10 border-2 rounded-full p-1
            backdrop-blur-sm
            border-gray-400 dark:border-gray-500
            hover:border-blue-500 dark:hover:border-blue-400
            transition-colors duration-200
          `}
          animate={{
            y: [0, -6, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <motion.div 
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
            animate={{
              y: [0, 14, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>
    </>
  );
}
