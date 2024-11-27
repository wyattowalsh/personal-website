"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SocialLinkProps {
  link: {
    name: string;
    url: string;
    icon: IconProp;
    color: string;
  };
}

export default function SocialLink({ link }: SocialLinkProps) {
  const isInternalLink = link.url.startsWith("/");

  const containerVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.05,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  const iconVariants = {
    initial: { y: 0 },
    hover: { 
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
        yoyo: Infinity
      }
    }
  };

  const content = (
    <motion.div
      className={cn(
        // Layout
        "flex flex-col items-center justify-center",
        "space-y-2 sm:space-y-3",
        "w-full h-full",
        "p-3 sm:p-4 md:p-6",
        // Theme-aware background
        "bg-gradient-to-br",
        "from-white/95 to-white/80",
        "dark:from-gray-800/95 dark:to-gray-800/80",
        // Enhanced blur and border
        "backdrop-blur-sm",
        "rounded-xl",
        "border border-primary/10",
        "dark:border-primary/20",
        // Improved shadows
        "shadow-lg shadow-primary/5",
        "dark:shadow-primary/10",
        // Group hover
        "group",
        // Smooth transitions
        "transition-all duration-300"
      )}
      variants={containerVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
    >
      <motion.div 
        variants={iconVariants}
        className="relative"
      >
        <FontAwesomeIcon 
          icon={link.icon} 
          className={cn(
            // Responsive sizing
            "text-2xl sm:text-3xl",
            // Theme-aware effects
            "transition-all duration-300",
            "group-hover:scale-110",
            "group-hover:[text-shadow:0_0_10px_currentColor]",
            "dark:group-hover:[text-shadow:0_0_15px_currentColor]"
          )}
          style={{ color: link.color }}
        />
      </motion.div>
      <span className={cn(
        // Responsive text
        "text-base sm:text-lg md:text-xl",
        "font-semibold",
        // Theme-aware colors
        "text-gray-900 dark:text-gray-100",
        // Transitions
        "transition-colors duration-300",
        "group-hover:text-primary dark:group-hover:text-primary-foreground"
      )}>
        {link.name}
      </span>
    </motion.div>
  );

  const sharedClassName = cn(
    "block w-full h-full",
    "transform transition-all duration-300",
    // Hover effects
    "hover:-translate-y-1",
    "hover:shadow-xl hover:shadow-primary/10",
    "dark:hover:shadow-primary/20",
    // Focus styles for accessibility
    "focus:outline-none focus:ring-2",
    "focus:ring-primary/50 dark:focus:ring-primary/30",
    "focus:ring-offset-2 focus:ring-offset-background"
  );

  return isInternalLink ? (
    <Link 
      href={{
        pathname: link.url
      }} 
      className={sharedClassName}
    >
      {content}
    </Link>
  ) : (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={sharedClassName}
    >
      {content}
    </a>
  );
}
