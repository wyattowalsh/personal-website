'use client';

import { motion } from 'framer-motion';
import ParticlesBackground from "@/components/ParticlesBackground";
import BlogContent from "@/components/BlogContent";
import type { PostMetadata } from "@/lib/types";

interface BlogPageContentProps {
  posts: PostMetadata[];
  tags: string[];
}

export default function BlogPageContent({ posts, tags }: BlogPageContentProps) {
  return (
    <>
      <ParticlesBackground />
      <BlogContent posts={posts} tags={tags} />
    </>
  );
}
