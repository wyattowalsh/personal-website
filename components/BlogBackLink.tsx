"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BlogBackLink() {
  const pathname = usePathname();
  const isBlogHome = pathname === "/blog";
  const showBackLink = pathname !== "/";

  if (!showBackLink) return null;

  return (
    <motion.div
      className={cn(
        // Base positioning
        "fixed z-50",
        // Mobile styles (bottom center)
        "md:static",
        "left-4 bottom-8 md:left-8 md:top-8 md:bottom-auto",
        // Ensure touch target size
        "touch-manipulation"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link href={isBlogHome ? "/" : "/blog"}>
        <Button
          variant="ghost"
          className={cn(
            // Base styles
            "relative group",
            // Mobile optimization
            "h-12 md:h-10",
            "min-w-[48px] md:min-w-0",
            // Sizing and spacing
            "px-4 md:px-3",
            "rounded-full",
            // Visual styles
            "bg-back-link-bg/95 dark:bg-back-link-bg/90",
            "backdrop-blur-sm",
            "border border-back-link-border",
            "shadow-back-link",
            // Transitions
            "transition-all duration-300",
            // Hover states
            "hover:shadow-back-link-hover",
            "hover:bg-back-link-hover-bg",
            // Active/touch states
            "active:scale-95",
            // Text styles
            "text-primary dark:text-primary-foreground/90",
            "font-medium",
            // Mobile-specific styles
            "md:hover:translate-x-1",
            // Show full text only on larger screens
            "flex items-center gap-2"
          )}
        >
          {/* Mobile Icon */}
          <ChevronLeft className={cn(
            "w-6 h-6 md:hidden",
            "transition-transform duration-300",
            "group-hover:-translate-x-1"
          )} />
          
          {/* Desktop Icon */}
          <ArrowLeft className={cn(
            "hidden md:block",
            "w-4 h-4",
            "transition-transform duration-300",
            "group-hover:-translate-x-1"
          )} />
          
          {/* Text - Hidden on mobile */}
          <span className="hidden md:inline-block">
            Back to {isBlogHome ? "Home" : "Blog"}
          </span>

          {/* Touch Ripple Effect */}
          <span className={cn(
            "absolute inset-0 rounded-full",
            "pointer-events-none",
            "transition-transform duration-300",
            "group-active:bg-primary/10"
          )} />
        </Button>
      </Link>
    </motion.div>
  );
}
