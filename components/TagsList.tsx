"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function TagsList({ tags }: { tags: string[] }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8 max-w-4xl mx-auto p-4">
      {tags.map((tag) => {
        const isActive = pathname === `/blog/tags/${tag}`;
        
        return (
          <Link
            key={tag}
            href={`/blog/tags/${tag}`}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium",
              "transition-all duration-300",
              "border-2",
              isActive ? [
                "bg-primary text-white",
                "border-primary/50",
                "shadow-lg shadow-primary/20",
              ] : [
                "bg-card text-foreground",
                "border-border",
                "hover:border-primary/50",
                "hover:bg-primary/10",
                "hover:text-primary",
              ]
            )}
          >
            #{tag}
          </Link>
        );
      })}
    </div>
  );
}
