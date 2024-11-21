import React, { Suspense } from "react";
import PostHeader from "@/components/PostHeader";
import PostPagination from "@/components/PostPagination";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { PostMetadata } from "@/lib/posts";

interface PostLayoutProps {
  children: React.ReactNode;
}

export function PostLayout({ children }: PostLayoutProps) {
  return (
    <article className="space-y-8">
      <PostHeader/>
      <hr/>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {children}
      </div>
      <PostPagination />
    </article>
  );
}
