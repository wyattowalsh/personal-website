'use client';

import { motion } from 'motion/react';
import dynamic from "next/dynamic";
const ParticlesBackground = dynamic(() => import("@/components/ParticlesBackground"), { ssr: false });
import BlogContent from "@/components/BlogContent";
import type { PostMetadata } from "@/lib/core";

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
