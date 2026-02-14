'use client';

import { motion } from 'motion/react';
import Link from "next/link";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";
import type { PostMetadata } from "@/lib/types";

interface BlogContentProps {
  posts: PostMetadata[];
  tags: string[];
}

export default function BlogContent({ posts, tags }: BlogContentProps) {
  return (
    <div className={cn(
      "w-full",
      "flex flex-col items-center justify-start",
      // Further reduce main container gap
      "gap-4 md:gap-6", // Reduced from gap-6/8
      "py-8 md:py-12",
      "bg-gradient-to-b",
      "from-background via-background/95 to-background/90",
      "dark:from-background dark:via-background/98 dark:to-background/95"
    )}>
      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full"
      >
        <SearchBar posts={posts} tags={tags} />
      </motion.div>
    </div>
  );
}
