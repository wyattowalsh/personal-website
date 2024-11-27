"use client";

import React, { Suspense, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import PostHeader from "@/components/PostHeader";
import PostPagination from "@/components/PostPagination";
import Comments from "@/components/Comments";
import { usePathname } from "next/navigation";
import { MathProvider } from "@/components/MathContext";

export function PostLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Reset equation numbers when pathname changes
  useEffect(() => {
    const mathContext = document.querySelector('[data-math-context]');
    if (mathContext) {
      const event = new CustomEvent('reset-equations');
      mathContext.dispatchEvent(event);
    }
  }, [pathname]);

  return (
    <article className="space-y-8 max-w-none w-full overflow-x-hidden">
      <PostHeader />
      <hr className="border-border-muted" />
      <MathProvider>
        <div data-math-context>
          {children}
        </div>
      </MathProvider>
      <hr className="border-border-muted" />
      <PostPagination />
      <hr className="border-border-muted" />
      <Comments />
    </article>
  );
}
