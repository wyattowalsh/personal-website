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
import { useRouter } from "next/navigation"; // Update import
import { Separator } from "@/components/ui/separator";

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

// Add a new ClientLink component for tag navigation
function TagButton({ tag }: { tag: string }) {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.push(`/blog/tags/${tag}`)}
      className={cn(
        // ... keep existing className ...
        "inline-flex items-center pointer-events-auto",
        "text-xs sm:text-sm font-medium",
        "px-2 py-0.5 sm:px-2.5 sm:py-1",
        "rounded-full",
        "border transition-all duration-200",
        "no-underline",
        "transform-gpu hover:scale-[1.02] active:scale-[0.98]",
        
        // Light mode styles
        "bg-white/50 hover:bg-primary/10",
        "text-muted-foreground hover:text-primary",
        "border-muted-foreground/20 hover:border-primary/50",
        
        // Dark mode styles
        "dark:bg-white/5 dark:hover:bg-primary/20",
        "dark:text-muted-foreground dark:hover:text-primary-light",
        "dark:border-muted-foreground/10 dark:hover:border-primary/40",
        
        // Shadow effects
        "shadow-sm hover:shadow-md",
        "dark:shadow-none dark:hover:shadow-primary/20",
        
        // Focus styles
        "focus:outline-none focus:ring-2 focus:ring-primary/40",
        "dark:focus:ring-primary/40"
      )}
    >
      #{tag}
    </button>
  );
}

// Update MetadataTags to use TagButton
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
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {tags.map((tag) => (
          <TagButton key={tag} tag={tag} />
        ))}
      </div>
    </div>
  );
}

// Add this at the top of PostHeader.tsx, updating imports as needed
const useSafePost = (pathname: string) => {
  const [state, setState] = useState<PostHeaderState>({
    post: null,
    isLoading: true,
    error: null,
    imageLoaded: false,
  });

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchPost = async () => {
      try {
        console.log('Fetching post for pathname:', pathname);
        if (mounted) {
          setState(prev => ({ ...prev, isLoading: true, error: null }));
        }
        
        // Fix the slug extraction - now handles both /blog/[slug] and /blog/posts/[slug]
        const slug = pathname.split('/').filter(segment => segment && segment !== 'blog' && segment !== 'posts').pop();
        
        if (!slug) {
          throw new Error('Invalid URL format');
        }

        // Update API endpoint path
        const response = await fetch(`/api/blog/posts/${slug}/metadata`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found');
          }
          throw new Error(`Failed to load post (${response.status})`);
        }

        const { data } = await response.json();
        if (!mounted) return;

        setState(prev => ({ 
          ...prev, 
          post: {
            ...data,
            title: data.title || "Untitled Post",
            summary: data.summary || "",
            created: data.created || data.date,
            updated: data.updated || data.created || data.date,
            tags: data.tags || [],
            image: data.image || "/logo.webp",
            caption: data.caption || null,
          },
          isLoading: false 
        }));
      } catch (error) {
        console.error('Error in useSafePost:', error);
        if (!mounted) return;
        console.error("Error loading post:", error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to load post',
          isLoading: false,
          post: null
        }));
      }
    };

    fetchPost();
    
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [pathname]);

  return state;
};

export default function PostHeader() {
  const pathname = usePathname();
  const [imageLoaded, setImageLoaded] = useState(false);
  const postData = useSafePost(pathname);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Use postData instead of state for rendering conditions
  if (postData.error || !postData.post) {
    return (
      <motion.div 
        role="alert"
        className={cn(
          "text-center p-8 rounded-xl",
          "bg-destructive/5 border border-destructive/20",
          "max-w-5xl mx-auto space-y-4",
          "backdrop-blur-sm",
          "shadow-lg",
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className={cn(
          "text-3xl font-bold",
          "bg-gradient-to-br from-destructive to-destructive/70",
          "bg-clip-text text-transparent"
        )}>
          Post Not Found
        </h1>
        <p className="text-muted-foreground text-lg">
          {postData.error || "The requested blog post could not be found."}
        </p>
        <div className="pt-4">
          <Link 
            href="/blog"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2",
              "bg-primary text-primary-foreground",
              "rounded-lg shadow-md",
              "hover:bg-primary/90 transition-colors",
              "font-medium"
            )}
          >
            Return to Blog
          </Link>
        </div>
      </motion.div>
    );
  }

  if (postData.isLoading) {
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

  console.log('Post data:', postData.post); // Add this debug line

  return (
    <motion.header
      className={cn(
        // Remove any margin/padding at the top
        "relative overflow-hidden",
        "rounded-xl md:rounded-2xl lg:rounded-3xl",
        "max-w-5xl mx-auto",
        "border border-post-header-border",
        "mt-0 pt-0",
        
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
        "dark:border-post-header-border/50",
        
        // Ensure no padding or margin at the top
        "pt-0 mt-0"
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      role="banner"
      aria-label="Post header"
    >
      {/* Image container - Ensure it's flush with the top */}
      <div className={cn(
        "relative w-full",
        "aspect-[21/9] sm:aspect-[2/1] md:aspect-[21/9]",
        "overflow-hidden",
        "rounded-t-xl md:rounded-t-2xl lg:rounded-t-3xl", // Match parent's top border radius
        "pt-0 mt-0" // Ensure no padding or margin at the top
      )}>
        <Image
          src={postData.post.image || "/logo.webp"}
          alt={postData.post.image ? `Header image for ${postData.post.title}` : "Default post header image"}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
          className={cn(
            "object-cover w-full h-full", // Change h-auto to h-full
            "transform transition-all duration-700",
            !imageLoaded && "blur-sm scale-105",
            imageLoaded && "blur-0 scale-100",
            "hover:scale-105 transition-transform duration-700",
            "mt-0 pt-0" // Remove any top margin/padding
          )}
          onLoad={handleImageLoad}
        />
        
        {/* Image Overlay */}
        <div className={cn(
          "absolute inset-0",
          "bg-gradient-to-b",
          "from-black/30 via-black/40 to-black/60",
          "z-10", // Lower z-index than caption
          "transition-opacity duration-300",
          "opacity-60 hover:opacity-40"
        )} />

        {/* Caption */}
        {postData.post.caption && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              // Positioning - adjusted for smaller size
              "absolute bottom-3 sm:bottom-4 md:bottom-6", // Reduced bottom spacing
              "left-3 sm:left-4 md:left-6", // Reduced left spacing
              "right-3 sm:right-4 md:right-6", // Reduced right spacing
              "md:right-auto", // Keep right auto on medium screens
              "max-w-[95%] sm:max-w-[85%] md:max-w-[75%]", // Adjusted max widths
              "z-20",

              // Typography - made more responsive
              "text-xs sm:text-sm md:text-base", // Smaller base size
              "italic font-medium",
              "leading-relaxed",
              "line-clamp-2 sm:line-clamp-3", // Fewer lines on smallest screens
              
              // Container styling
              "px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5", // Reduced padding
              "rounded-md sm:rounded-lg", // Smaller radius on mobile
              "bg-caption-bg",
              "text-caption-fg",
              "backdrop-blur-md",
              "border border-caption-border",
              
              // Shadow and effects
              "shadow-sm sm:shadow-md lg:shadow-lg", // Progressive shadow
              "transition-all duration-300",
              
              // Hover effects
              "hover:bg-caption-hover-bg",
              "hover:text-caption-hover-fg",
              "hover:scale-[1.02] active:scale-[0.98]", // Added active state
              "hover:border-caption-hover-border"
            )}
          >
            {postData.post.caption}
          </motion.p>
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
          {postData.post.title}
        </motion.h1>

        <Separator className="my-4" />

        {/* Summary */}
        {postData.post.summary && (
          <p className={cn(
            "text-base sm:text-lg lg:text-xl",
            "text-muted-foreground",
            "leading-relaxed",
            "max-w-prose"
          )}>
            {postData.post.summary}
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
          {postData.post.created && (
            <MetadataItem 
              icon={<Calendar className="h-5 w-5" />}
              dateTime={postData.post.created}
              label="Post creation date"
            >
              {formatDate(postData.post.created)}
            </MetadataItem>
          )}

          {/* Reading Time */}
          {postData.post.readingTime && (
            <MetadataItem 
              icon={<Clock className="h-5 w-5" />}
              label="Estimated reading time"
            >
              {postData.post.readingTime}
            </MetadataItem>
          )}

          {/* Last Updated - Only show if update date is different from create date */}
          {postData.post.updated && isDifferentDate(postData.post.updated, postData.post.created) && (
            <MetadataItem 
              icon={<Edit className="h-5 w-5" />}
              dateTime={postData.post.updated}
              label="Last updated date"
            >
              <span className="flex items-center gap-1">
                {formatDate(postData.post.updated)}
                <span className="text-muted-foreground/60">(Updated)</span>
              </span>
            </MetadataItem>
          )}

          {/* Tags - Now integrated into metadata section */}
          {postData.post.tags && postData.post.tags.length > 0 && (
            <MetadataTags tags={postData.post.tags} />
          )}
        </div>
      </div>
    </motion.header>
  );
}
