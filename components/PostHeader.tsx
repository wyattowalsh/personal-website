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

interface PostHeaderState {
  post: PostMetadata | null;
  isLoading: boolean;
  error: string | null;
  imageLoaded: boolean;
}

export default function PostHeader() {
  const [state, setState] = useState<PostHeaderState>({
    post: null,
    isLoading: true,
    error: null,
    imageLoaded: false,
  });

  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();

    const fetchPost = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const slug = pathname.split("/blog/posts/")[1];
        if (!slug) return;

        const response = await fetch(`/api/blog/posts/${slug}`, {
          signal: controller.signal,
          headers: {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const post = await response.json();
        setState((prev) => ({ ...prev, post, isLoading: false }));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        const errorMessage =
          error instanceof Error ? error.message : "Failed to load post";
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
        "rounded-2xl overflow-hidden max-w-5xl mx-auto",
        "bg-gradient-to-br from-primary via-background to-secondary",
        "transition-transform duration-500 ease-out hover:scale-[1.02]",
        "shadow-header"
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Hero Image Section */}
      <div className="relative aspect-[21/9] w-full overflow-hidden">
        <Image
          src={state.post.image || "/logo.webp"}
          alt={state.post.title}
          fill
          priority
          sizes="100vw"
          className={cn(
            "object-cover object-center transition-transform duration-700",
            !state.imageLoaded && "blur-sm scale-105",
            state.imageLoaded && "blur-0 scale-100"
          )}
          onLoad={handleImageLoad}
        />
        <div className="absolute inset-0 bg-header-overlay" />
        {state.post.caption && (
          <p className="absolute bottom-4 left-4 text-lg italic text-white bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
            {state.post.caption}
          </p>
        )}
      </div>

      {/* Content Section */}
      <div className="p-8 relative z-10 space-y-6">
        {/* Title */}
        <motion.h1
          className="text-4xl font-extrabold bg-gradient-heading bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {state.post.title}
        </motion.h1>

        {/* Summary */}
        {state.post.summary && (
          <p className="text-xl text-muted-foreground leading-relaxed">
            {state.post.summary}
          </p>
        )}

        {/* Metadata Section */}
        <div className="flex flex-wrap gap-6 text-muted-foreground border-t border-b border-border-muted py-4">
          {/* Date */}
          {state.post.date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <time dateTime={state.post.date}>
                {formatDate(state.post.date, "en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
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

          {/* Last Updated */}
          {state.post.updated && (
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              <span>
              {" "}
                <time dateTime={state.post.updated}>
                  {formatDate(state.post.updated, "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                &nbsp; (Updated)
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {state.post.tags && state.post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {state.post.tags.map((tag) => (
                <Link key={tag} href={`/blog/tags/${tag}`}>
                  <Badge
                    variant="secondary"
                    className="hover:bg-secondary/80 transition-colors cursor-pointer"
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
