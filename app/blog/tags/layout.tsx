import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getAllTags } from "@/lib/services/backend";
import { Badge } from "@/components/ui/badge";
import ParticlesBackground from "@/components/ParticlesBackground";
import { cn } from "@/lib/utils"; // Add this import

export default async function TagsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tags = await getAllTags();

  // Sort tags case-insensitively but preserve original case for display
  const sortedTags = [...tags].sort((a, b) => 
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  return (
    <section className="container mx-auto px-4">
      <ParticlesBackground />
      <div className="py-4">
        <nav className="flex flex-wrap gap-2 mb-4 items-center justify-center">
          {sortedTags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tags/${tag}`}
              className={cn(
                "inline-flex items-center",
                "px-2 py-0.5 sm:px-2.5 sm:py-0.5",
                "rounded-full",
                "text-xs sm:text-sm",
                "font-medium tracking-tight",
                "border border-muted-foreground",
                "bg-transparent text-muted-foreground",
                "hover:bg-accent hover:text-accent-foreground hover:border-transparent",
                "transition-colors duration-200 no-underline",
                "transform-gpu hover:scale-[1.02]"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              #{tag}
            </Link>
          ))}
        </nav>
        <Separator className="my-4" />
      </div>
      {children}
    </section>
  );
}
