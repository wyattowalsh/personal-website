"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AdjacentPost } from "@/lib/posts";

export default function PostPagination() {
  const [state, setState] = useState<{
    data: { prevPost?: AdjacentPost; nextPost?: AdjacentPost };
    isLoading: boolean;
    error: string | null;
  }>({
    data: {},
    isLoading: true,
    error: null,
  });

  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();

    const fetchAdjacentPosts = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        // Extract the slug from the pathname
        const slug = pathname.split("/blog/posts/")[1];
        if (!slug) return;

        // Fetch adjacent posts data
        const response = await fetch(`/api/blog/posts/adjacent?slug=${encodeURIComponent(slug)}`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setState(prev => ({ ...prev, data, isLoading: false }));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching adjacent posts:", error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to load navigation",
        }));
      }
    };

    fetchAdjacentPosts();
    return () => controller.abort();
  }, [pathname]);

  if (state.isLoading) {
    return <div className="h-24 flex items-center justify-center">Loading...</div>;
  }

  if (state.error) {
    return (
      <div className="text-destructive text-center my-8 p-4 rounded-lg bg-destructive/10">
        {state.error}
      </div>
    );
  }

  const { prevPost, nextPost } = state.data;
  if (!prevPost && !nextPost) return null;

  return (
    <nav className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12" aria-label="Post navigation">
      {prevPost ? (
        <Link href={`/blog/posts/${prevPost.slug}`} className="group">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className={cn(
              "pagination-card",
              "p-6 h-full",
              "bg-pagination-gradient backdrop-blur-md",
              "border border-card-border/50",
              "shadow-lg transition-all duration-300",
              "hover:border-primary/50 hover:shadow-xl",
              "dark:hover:border-primary/30"
            )}>
              <div className="flex items-center gap-4 relative z-10">
                <div className="pagination-icon">
                  <ChevronLeft className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium mb-1",
                    "text-muted-foreground",
                    "group-hover:text-primary",
                    "transition-colors duration-300"
                  )}>
                    Previous Post
                  </p>
                  <h3 className={cn(
                    "font-display text-lg",
                    "text-foreground/90",
                    "line-clamp-1",
                    "group-hover:text-primary",
                    "transition-colors duration-300"
                  )}>
                    {prevPost.title}
                  </h3>
                </div>
              </div>
            </Card>
          </motion.div>
        </Link>
      ) : <div />}

      {nextPost ? (
        <Link href={`/blog/posts/${nextPost.slug}`} className="group md:ml-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className={cn(
              "pagination-card",
              "p-6 h-full",
              "bg-pagination-gradient backdrop-blur-md",
              "border border-card-border/50",
              "shadow-lg transition-all duration-300",
              "hover:border-primary/50 hover:shadow-xl",
              "dark:hover:border-primary/30"
            )}>
              <div className="flex items-center gap-4 relative z-10">
                <div className="flex-1 text-right">
                  <p className={cn(
                    "text-sm font-medium mb-1",
                    "text-muted-foreground",
                    "group-hover:text-primary",
                    "transition-colors duration-300"
                  )}>
                    Next Post
                  </p>
                  <h3 className={cn(
                    "font-display text-lg",
                    "text-foreground/90",
                    "line-clamp-1",
                    "group-hover:text-primary",
                    "transition-colors duration-300"
                  )}>
                    {nextPost.title}
                  </h3>
                </div>
                <div className="pagination-icon">
                  <ChevronRight className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          </motion.div>
        </Link>
      ) : <div />}
    </nav>
  );
}
