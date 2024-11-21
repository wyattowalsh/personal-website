"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { PostMetadata } from '@/lib/posts';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface PostHeaderProps {
  className?: string;
}

export default function PostHeader({ className }: PostHeaderProps) {
  const [state, setState] = useState<{
    post: PostMetadata | null;
    isLoading: boolean;
    error: string | null;
    isHovered: boolean;
    imageLoaded: boolean;
  }>({
    post: null,
    isLoading: true,
    error: null,
    isHovered: false,
    imageLoaded: false,
  });

  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();

    const fetchPost = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const slug = pathname.split('/blog/posts/')[1];
        if (!slug) return;

        const response = await fetch(`/api/blog/posts/${slug}`, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const post = await response.json();
        setState(prev => ({ ...prev, post, isLoading: false }));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to load post';
        console.error('Error loading post:', errorMessage);
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
      }
    };

    fetchPost();
    return () => controller.abort();
  }, [pathname]);

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
        {state.error || 'Post not found'}
      </div>
    );
  }

  return (
    <motion.header
      className={cn(
        "mb-12 rounded-xl overflow-hidden bg-card hover:shadow-2xl transition-all duration-300",
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onMouseEnter={() => setState(prev => ({ ...prev, isHovered: true }))}
      onMouseLeave={() => setState(prev => ({ ...prev, isHovered: false }))}
    >
      {/* Updated image container with flexible aspect ratio */}
      <div className="relative aspect-[21/9] w-full overflow-hidden">
        <Image
          src={state.post.image || '/logo.webp'}
          alt={state.post.title}
          fill
          priority
          sizes="100vw"
          className={cn(
            "object-cover transition-all duration-500",
            !state.imageLoaded && "blur-sm scale-105",
            state.imageLoaded && "blur-0 scale-100",
            // Add object-position classes for better image positioning
            "object-center",
            // Add gradient overlay for better text readability
            "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-black/60"
          )}
          style={{
            transform: state.isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
          onLoad={() => setState(prev => ({ ...prev, imageLoaded: true }))}
        />
        <AnimatePresence>
          {state.isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>
      </div>
      <div className="p-6">
        <motion.h1 
          className="text-4xl font-bold mb-4 text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {state.post.title}
        </motion.h1>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 text-muted-foreground">
            {state.post.date && (
              <time dateTime={state.post.date}>{formatDate(state.post.date)}</time>
            )}
            {state.post.readingTime && (
              <>
                <span>•</span>
                <span>{state.post.readingTime}</span>
              </>
            )}
          </div>
          {state.post.updated && (
            <p className="text-sm text-muted-foreground">
              Last updated: <time dateTime={state.post.updated}>{formatDate(state.post.updated)}</time>
            </p>
          )}
          {state.post.summary && (
            <p className="text-lg text-muted-foreground">{state.post.summary}</p>
          )}
          {state.post.tags && state.post.tags.length > 0 && (
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
          )}
        </div>
      </div>
    </motion.header>
  );
}
