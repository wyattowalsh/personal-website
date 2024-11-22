"use client";

import React, { Suspense, createContext, useRef, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import PostHeader from "@/components/PostHeader";
import PostPagination from "@/components/PostPagination";
import Comments from "@/components/Comments";
import { usePathname } from "next/navigation";

interface EquationContextType {
  incrementEquationNumber: () => number;
}

export const EquationContext = createContext<EquationContextType>({
  incrementEquationNumber: () => 0,
});

export function PostLayout({ children }: { children: React.ReactNode }) {
  const equationCounter = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    equationCounter.current = 0; // Reset numbering on page navigation
  }, [pathname]);

  const incrementEquationNumber = () => ++equationCounter.current;

  return (
    <EquationContext.Provider value={{ incrementEquationNumber }}>
      <article className="space-y-8 max-w-none w-full overflow-x-hidden">
        <PostHeader />
        <hr className="border-border-muted" />
        <div className="prose prose-2xl max-w-none">
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </div>
        <hr className="border-border-muted" />
        <PostPagination />
        <Comments />
      </article>
    </EquationContext.Provider>
  );
}
