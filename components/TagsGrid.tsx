"use client";

import { motion, useMotionValue } from "motion/react";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface TagsGridProps {
  tags: string[];
  tagCounts: Record<string, number>;
}

export function TagsGrid({ tags, tagCounts }: TagsGridProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []); // eslint-disable-line react-hooks/set-state-in-effect -- client mount guard for hydration

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        "gap-4 sm:gap-6 lg:gap-8",
        "p-4 sm:p-6 lg:p-8",
        "max-w-7xl mx-auto",
        "opacity-100",
        "transition-opacity duration-500",
        "[&:not(.loaded)]:opacity-0",
        "loaded"
      )}
    >
      {tags.map((tag, index) => (
        <TagCard
          key={tag}
          tag={tag}
          count={tagCounts[tag]}
          index={index}
          theme={mounted ? theme : 'light'}
        />
      ))}
    </div>
  );
}

interface TagCardProps {
  tag: string;
  count: number;
  index: number;
  theme?: string;
}

function TagCard({ tag, count, index }: TagCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative",
        "opacity-100 translate-y-0 scale-100",
        "transition-[opacity,transform] duration-500 ease-out",
        "[&:not(.loaded)]:opacity-0 [&:not(.loaded)]:translate-y-5 [&:not(.loaded)]:scale-90",
        "loaded"
      )}
      style={{
        transitionDelay: `${index * 120}ms`,
        animation: `slideUp 0.5s ease-out ${index * 0.12}s backwards`
      }}
    >
      <Link href={`/blog/tags/${tag}`} className="block">
        <Card className={cn(
          "group relative overflow-hidden",
          "p-6 sm:p-8",
          "border border-border",
          "bg-tag-bg hover:bg-tag-bg-hover",
          "hover:border-primary/50",
          "hover:shadow-xl",
          "transition-all duration-300"
        )}>
          {/* Content container */}
          <div className="relative z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Tag name */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className={cn(
                "text-lg sm:text-xl font-bold",
                "text-tag group-hover:text-tag-hover", // Updated color classes
                "transition-colors duration-300"
              )}>
                #{tag}
              </span>
              <span className={cn(
                "absolute -bottom-1 left-0 w-full h-0.5",
                "bg-primary",
                "transform origin-left scale-x-0 group-hover:scale-x-100",
                "transition-transform duration-500 ease-out"
              )} />
            </motion.div>

            {/* Post count badge */}
            <motion.span 
              className={cn(
                "px-3 py-1.5 rounded-full",
                "text-sm font-medium",
                "bg-primary/5 group-hover:bg-primary/10", // Lighter background
                "text-tag group-hover:text-tag-hover", // Updated color classes
                "ring-1 ring-primary/10 group-hover:ring-primary/20",
                "transition-all duration-300"
              )}
              whileHover={{ scale: 1.05 }}
              animate={{
                y: [0, -2, 0],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.1
                }
              }}
            >
              {count ?? 0} {count === 1 ? 'post' : 'posts'}
            </motion.span>
          </div>

          {/* Decorative corners */}
          <div className={cn(
            "absolute -top-1 -left-1",
            "w-16 h-16",
            "bg-primary/5 group-hover:bg-primary/10",
            "rounded-br-3xl",
            "transform -rotate-45 -translate-x-10 -translate-y-10",
            "transition-transform duration-500",
            "group-hover:-translate-x-6 group-hover:-translate-y-6"
          )} />

          <div className={cn(
            "absolute -bottom-1 -right-1",
            "w-20 h-20",
            "bg-primary/5 group-hover:bg-primary/10",
            "rounded-tl-3xl",
            "transform rotate-45 translate-x-10 translate-y-10",
            "transition-transform duration-500",
            "group-hover:translate-x-6 group-hover:translate-y-6"
          )} />
        </Card>
      </Link>
    </motion.div>
  );
}
