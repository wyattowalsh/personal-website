"use client";

import React, { Suspense, useRef, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import PostHeader from "@/components/PostHeader";
import PostPagination from "@/components/PostPagination";
import Comments from "@/components/Comments";

export function PostLayout({ children }: { children: React.ReactNode }) {
  return (
      <article className="space-y-8 max-w-none w-full overflow-x-hidden">
        <PostHeader />
        <hr className="border-border-muted" />
         {children}
        <hr className="border-border-muted" />
        <PostPagination />
        <hr className="border-border-muted" />
        <Comments />
      </article>
  );
}
