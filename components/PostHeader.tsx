"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import type { PostMetadata } from '@/lib/posts';
import { cn } from '@/lib/utils';

interface PostHeaderProps {
  post: PostMetadata;
  className?: string;
}

const PostHeader = ({ post, className }: PostHeaderProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.header
      className={cn(
        "mb-12 rounded-xl overflow-hidden bg-card hover:shadow-2xl transition-all duration-300",
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 sm:h-72 md:h-80">
        <Image
          src={post.image || '/logo.webp'}
          alt={post.title}
          fill
          priority
          className="object-cover transition-transform duration-500"
          style={{ 
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        <AnimatePresence>
          {isHovered && (
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
          {post.title}
        </motion.h1>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 text-muted-foreground">
            {post.date && (
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            )}
            {post.readingTime && (
              <>
                <span>•</span>
                <span>{post.readingTime}</span>
              </>
            )}
          </div>
          {post.updated && (
            <p className="text-sm text-muted-foreground">
              Last updated: <time dateTime={post.updated}>{formatDate(post.updated)}</time>
            </p>
          )}
          {post.summary && (
            <p className="text-lg text-muted-foreground">{post.summary}</p>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
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
};

export default PostHeader;
