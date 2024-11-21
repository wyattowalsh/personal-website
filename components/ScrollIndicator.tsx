"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function ScrollIndicator() {
  const pathname = usePathname();
  const isHomePage = pathname === "";

  if (!isHomePage) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 1 }}
    >
      <motion.div
        className="w-6 h-10 border-2 border-primary rounded-full p-1 animate-bounce backdrop-blur-sm"
        style={{
          boxShadow: "0 0 8px rgba(var(--primary), 0.3)",
        }}
      >
        <motion.div className="w-2 h-2 bg-primary rounded-full" />
      </motion.div>
    </motion.div>
  );
}
