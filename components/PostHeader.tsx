"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { PostMetadata } from "@/lib/types"; // Update import path
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
  try {
    if (!date1 || !date2) return false;
    // Parse dates and convert to UTC ISO strings for comparison
    const d1 = new Date(date1).toISOString();
    const d2 = new Date(date2).toISOString();
    // Compare only date portions (remove time)
    return d1.split('T')[0] !== d2.split('T')[0];
  } catch {
    return false;
  }
}

interface MetadataItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  dateTime?: string;
  label?: string;
}

function MetadataItem({ icon, children, dateTime, label }: MetadataItemProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 group",
        "hover:text-primary transition-all duration-300"
      )}
      aria-label={label}
    >
      <span className={cn(
        "transition-transform duration-300",
        "group-hover:scale-110"
      )}>
        {icon}
      </span>
      {dateTime ? (
        <time dateTime={dateTime} className="font-medium">
          {children}
        </time>
      ) : (
        <span className="font-medium">{children}</span>
      )}
    </div>
  );
}

// Add a new MetadataTagsProps interface
interface MetadataTagsProps {
  tags: string[];
}

// Add a new MetadataTags component
function MetadataTags({ tags }: MetadataTagsProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 group",
        "hover:text-primary transition-all duration-300"
      )}
      aria-label="Post tags"
    >
      <span className={cn(
        "transition-transform duration-300",
        "group-hover:scale-110"
      )}>
        <Tag className="h-5 w-5" />
      </span>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link 
            key={tag}
            href={`/blog/tags/${tag}`}
            aria-label={`View posts tagged with ${tag}`}
            className="transition-transform duration-300 hover:scale-105"
          >
            <Badge
              variant="secondary"
              className={cn(
                "transition-colors duration-300",
                "hover:bg-primary hover:text-primary-foreground"
              )}
            >
              #{tag}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
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
    let mounted = true;

    const fetchPost = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const slug = pathname.split("/blog/posts/")[1];
        
        if (!slug) {
          throw new Error('Invalid slug');
        }

        // Direct fetch from backend service instead of API route
        const response = await fetch(`/api/posts/${slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data) {
          throw new Error('Post not found');
        }

        setState(prev => ({ 
          ...prev, 
          post: data,
          isLoading: false 
        }));
      } catch (error) {
        console.error("Error loading post:", error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to load post",
          isLoading: false,
        }));
      }
    };

    fetchPost();
    
    return () => {
      mounted = false;
    };
  }, [pathname]);

  const handleImageLoad = () => {
    setState((prev) => ({ ...prev, imageLoaded: true }));
  };

  if (state.error || !state.post) {
    return (
      <div 
        role="alert"
        className="text-destructive text-center p-4 rounded-lg bg-destructive/10"
      >
        <h2 className="text-lg font-semibold mb-2">Error Loading Post</h2>
        <p>{state.error || "Post not found"}</p>
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div 
        role="status"
        aria-label="Loading post"
        className="animate-pulse space-y-8 max-w-5xl mx-auto"
      >
        <div className="aspect-[21/9] bg-muted rounded-xl" />
        <div className="space-y-4 px-4">
          <div className="h-12 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="flex gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-6 w-20 bg-muted rounded" />
            ))}
          </div>
        </div>
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
      role="banner"
      aria-label="Post header"
    >
      {/* Hero Image Container */}
      <div className={cn(
        "relative w-full",
        "aspect-[21/9] sm:aspect-[2/1] md:aspect-[21/9]",
        "overflow-hidden"
      )}>
        <Image
          src={state.post.image || "/logo.webp"}
          alt={state.post.image ? `Header image for ${state.post.title}` : "Default post header image"}
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
            <MetadataItem 
              icon={<Calendar className="h-5 w-5" />}
              dateTime={state.post.created}
              label="Post creation date"
            >
              {formatDate(state.post.created)}
            </MetadataItem>
          )}

          {/* Reading Time */}
          {state.post.readingTime && (
            <MetadataItem 
              icon={<Clock className="h-5 w-5" />}
              label="Estimated reading time"
            >
              {state.post.readingTime}
            </MetadataItem>
          )}

          {/* Last Updated - Only show if update date is different from create date */}
          {state.post.updated && isDifferentDate(state.post.updated, state.post.created) && (
            <MetadataItem 
              icon={<Edit className="h-5 w-5" />}
              dateTime={state.post.updated}
              label="Last updated date"
            >
              <span className="flex items-center gap-1">
                {formatDate(state.post.updated)}
                <span className="text-muted-foreground/60">(Updated)</span>
              </span>
            </MetadataItem>
          )}

          {/* Tags - Now integrated into metadata section */}
          {state.post.tags && state.post.tags.length > 0 && (
            <MetadataTags tags={state.post.tags} />
          )}
        </div>
      </div>
    </motion.header>
  );
}
