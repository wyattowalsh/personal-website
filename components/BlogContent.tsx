import { cn } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";
import type { PostMetadata } from "@/lib/core";

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
      <div
        className={cn(
          "w-full",
          "opacity-100 translate-y-0",
          "transition-[opacity,transform] duration-500 delay-200",
          "[&:not(.loaded)]:opacity-0 [&:not(.loaded)]:translate-y-5",
          "loaded"
        )}
      >
        <SearchBar posts={posts} tags={tags} />
      </div>
    </div>
  );
}
