"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { PostMetadata } from "@/lib/posts";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Calendar, Clock, Tag, Edit } from "lucide-react";

// Remove the local PostMetadata interface since we're importing it

interface PostHeaderState {
  post: PostMetadata | null;
  isLoading: boolean;
  error: string | null;
  imageLoaded: boolean;
}

// Add a helper function at the top of the file
function isDifferentDate(date1: string | undefined, date2: string | undefined): boolean {
  if (!date1 || !date2) return false;
  // Remove any milliseconds and 'Z' suffix for comparison
  const clean1 = date1.split('.')[0].replace('Z', '');
  const clean2 = date2.split('.')[0].replace('Z', '');
  return clean1 !== clean2;
}

export default function PostHeader() {
  const [state, setState] = useState<PostHeaderState>({
    post: null,
    isLoading: true,
    error: null,
    imageLoaded: false,
  });

  const pathname = usePathname();

  // Move fetchPost outside of state initialization
  useEffect(() => {
    const controller = new AbortController();

    const fetchPost = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const slug = pathname.split("/blog/posts/")[1];
        if (!slug) {
          throw new Error('Invalid slug');
        }

        const response = await fetch(`/api/blog/posts/metadata/${slug}`, {
          signal: controller.signal,
          headers: {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { metadata } = await response.json();
        
        // Validate required fields
        if (!metadata?.title || !metadata?.created || !metadata?.tags) {
          throw new Error('Invalid post metadata');
        }

        setState((prev) => ({ ...prev, post: metadata, isLoading: false }));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        const errorMessage = error instanceof Error ? error.message : "Failed to load post";
        console.error("Error loading post:", errorMessage);
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    };

    fetchPost();
    return () => controller.abort();
  }, [pathname]);

  const handleImageLoad = () => {
    setState((prev) => ({ ...prev, imageLoaded: true }));
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (state.error || !state.post) {
    return (
      <div className="text-destructive text-center p-4">
        {state.error || "Post not found"}
      </div>
    );
  }

  return (
    <motion.header
      className={cn(
        // Base styles
        "relative overflow-hidden",
        "rounded-xl md:rounded-2xl lg:rounded-3xl",
        "max-w-5xl mx-auto",
        "border border-post-header-border",
        
        // Gradients and backgrounds
        "bg-gradient-to-br from-post-header-gradient-from via-post-header-gradient-via to-post-header-gradient-to",
        "backdrop-blur-sm backdrop-saturate-150",
        
        // Shadows and effects
        "shadow-post-header",
        "transition-all duration-500 ease-out",
        "hover:shadow-post-header-hover hover:scale-[1.01]",
        
        // Dark mode adjustments
        "dark:from-post-header-gradient-from/90",
        "dark:via-post-header-gradient-via/90",
        "dark:to-post-header-gradient-to/90",
        "dark:border-post-header-border/50"
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Hero Image Container */}
      <div className={cn(
        "relative w-full",
        "aspect-[21/9] sm:aspect-[2/1] md:aspect-[21/9]",
        "overflow-hidden"
      )}>
        <Image
          src={state.post.image || "/logo.webp"}
          alt={state.post.title}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
          className={cn(
            "object-cover object-center",
            "transform transition-all duration-700",
            !state.imageLoaded && "blur-sm scale-105",
            state.imageLoaded && "blur-0 scale-100",
            "hover:scale-105 transition-transform duration-700"
          )}
          onLoad={handleImageLoad}
        />
        
        {/* Image Overlay */}
        <div className={cn(
          "absolute inset-0",
          "bg-post-header-image-overlay",
          "transition-opacity duration-300",
          "opacity-80 hover:opacity-60"
        )} />

        {/* Caption */}
        {state.post.caption && (
          <p className={cn(
            "absolute bottom-4 left-4",
            "text-sm sm:text-base lg:text-lg",
            "italic text-white",
            "px-3 py-1.5",
            "rounded-md",
            "bg-black/50 backdrop-blur-sm",
            "border border-white/10",
            "shadow-lg",
            "transition-all duration-300",
            "hover:bg-black/60 hover:scale-105"
          )}>
            {state.post.caption}
          </p>
        )}
      </div>

      {/* Content Section */}
      <div className={cn(
        "relative z-10",
        "p-4 sm:p-6 lg:p-8",
        "space-y-4 sm:space-y-6 lg:space-y-8"
      )}>
        {/* Title */}
        <motion.h1
          className={cn(
            "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
            "font-extrabold tracking-tight",
            "bg-gradient-heading bg-clip-text text-transparent",
            "leading-tight",
            "transition-colors duration-300"
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {state.post.title}
        </motion.h1>

        {/* Summary */}
        {state.post.summary && (
          <p className={cn(
            "text-base sm:text-lg lg:text-xl",
            "text-muted-foreground",
            "leading-relaxed",
            "max-w-prose"
          )}>
            {state.post.summary}
          </p>
        )}

        {/* Metadata Section */}
        <div className={cn(
          "flex flex-wrap gap-3 sm:gap-4 lg:gap-6",
          "text-sm sm:text-base",
          "text-muted-foreground",
          "border-t border-b border-border-muted",
          "py-3 sm:py-4",
          "transition-colors duration-300"
        )}>
          {/* Created Date */}
          {state.post.created && (
            <div className={cn(
              "flex items-center gap-2 group",
              "hover:text-primary transition-all duration-300"
            )}>
              <Calendar className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                "transition-transform duration-300",
                "group-hover:scale-110"
              )} />
              <time 
                dateTime={state.post.created}
                className="font-medium"
              >
                {formatDate(state.post.created)}
              </time>
            </div>
          )}

          {/* Reading Time */}
          {state.post.readingTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{state.post.readingTime}</span>
            </div>
          )}

          {/* Last Updated - Only show if update date is different from create date */}
          {state.post.updated && isDifferentDate(state.post.updated, state.post.created) && (
            <div className={cn(
              "flex items-center gap-2 group",
              "text-muted-foreground/80",
              "hover:text-primary transition-all duration-300"
            )}>
              <Edit className={cn(
                "h-5 w-5",
                "transition-transform duration-300",
                "group-hover:scale-110"
              )} />
              <span className="flex items-center gap-1">
                <time 
                  dateTime={state.post.updated}
                  className="font-medium"
                >
                  {formatDate(state.post.updated)}
                </time>
                <span className="text-muted-foreground/60">(Updated)</span>
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {state.post.tags && state.post.tags.length > 0 && (
          <div className={cn(
            "flex flex-wrap items-center gap-2",
            "animate-fade-in"
          )}>
            <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {state.post.tags.map((tag) => (
                <Link key={tag} href={`/blog/tags/${tag}`}>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "transition-all duration-300",
                      "hover:bg-primary hover:text-primary-foreground",
                      "cursor-pointer",
                      "transform hover:scale-105"
                    )}
                  >
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}
