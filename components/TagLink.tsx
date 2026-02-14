"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface TagLinkProps {
  tag: string;
  count?: number;
  showCount?: boolean;
  isNested?: boolean; // New prop to indicate if it's nested within another link
}

export default function TagLink({ tag, count, showCount = false, isNested = false }: TagLinkProps) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Badge
        variant="secondary"
        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground cursor-pointer"
      >
        #{tag}
        {showCount && count !== undefined && (
          <span className="ml-1 text-xs">({count})</span>
        )}
      </Badge>
    </motion.div>
  );

  return isNested ? content : (
    <Link
      href={`/blog/tags/${tag}`}
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
      )}
    >
      {content}
    </Link>
  );
}
