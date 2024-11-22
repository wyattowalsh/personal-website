import React from "react";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostLayout } from "@/components/PostLayout";
import { getPostBySlug } from "@/lib/posts";
import ParticlesBackground from "@/components/ParticlesBackground";
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { slug: string }
  children: React.ReactNode
}

const defaultMeta = {
  title: "W4W Blog",
  summary: "Personal blog covering technology, software engineering, and more.",
  date: "2023-01-01",
  tags: ["blog", "technology", "software engineering"],
  image: "/logo.webp"
};

export default function PostsLayout({ children }: Props) {

  return (
    <div className="relative">
      <div className="max-w-7xl lg:max-w-[80rem] xl:max-w-[90rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Suspense fallback={<LoadingSpinner />}>
          <PostLayout>{children}</PostLayout>
        </Suspense>
      </div>
    </div>
  );
}