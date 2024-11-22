"use client";

import React, { Suspense, createContext, useRef, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import PostHeader from "@/components/PostHeader";
import PostPagination from "@/components/PostPagination";
import Comments from "@/components/Comments";
import { usePathname } from "next/navigation";

export const EquationContext = React.createContext({
  increment: () => 0,
});

interface PostLayoutProps {
	children: React.ReactNode;
}

export function PostLayout({ children }: PostLayoutProps) {
  const equationCounter = useRef(0);
  const pathname = usePathname();
  const pageSlug = pathname.split('/').pop() || '';

  // Reset counter when pathname changes
  useEffect(() => {
    equationCounter.current = 0;
  }, [pathname]);

  const increment = () => ++equationCounter.current;

	return (
		<EquationContext.Provider value={{ 
      increment,
      pageSlug 
    }}>
			<article className="space-y-8 max-w-none w-full overflow-x-hidden dark:text-muted-foreground">
				<PostHeader />
				<hr className="border-border-muted" />
				<div className="prose prose-2xl max-w-none dark:text-muted-foreground">
					<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
				</div>
				<hr className="border-border-muted" />
				<PostPagination />
				<hr className="border-border-muted" />
				<Comments />
			</article>
		</EquationContext.Provider>
	);
}
