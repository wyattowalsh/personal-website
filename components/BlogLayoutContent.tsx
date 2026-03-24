"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { BlogTitle } from "@/components/BlogTitle";

interface BlogLayoutContentProps {
  children: React.ReactNode;
}

export function BlogLayoutContent({ children }: BlogLayoutContentProps) {
  const pathname = usePathname();

  // Check if we're on an individual post page (matches /blog/posts/[slug])
  const isPostPage = pathname.startsWith('/blog/posts/') && pathname.split('/').length > 3;

  return (
    <>
      {!isPostPage && (
        <div className="-mt-14 sm:-mt-16 pt-16 sm:pt-20">
          <BlogTitle />
          <hr className="border-border my-4" />
        </div>
      )}
      {children}
    </>
  );
}
