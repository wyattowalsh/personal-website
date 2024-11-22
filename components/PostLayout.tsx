"use client";

import React, { Suspense, createContext, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import PostHeader from "@/components/PostHeader";
import PostPagination from "@/components/PostPagination";
import Comments from "@/components/Comments";
import { usePathname } from "next/navigation";

// Create context for equation numbering
export const EquationContext = createContext({ count: 0, increment: () => {} });

interface PostLayoutProps {
	children: React.ReactNode;
}

export function PostLayout({ children }: PostLayoutProps) {
	const [equationCount, setEquationCount] = React.useState(0);
	const pathname = usePathname();

	// Reset equation counter when pathname changes
	useEffect(() => {
		setEquationCount(0);
	}, [pathname]);

	const incrementCount = React.useCallback(() => {
		setEquationCount(prev => prev + 1);
	}, []);

	return (
		<EquationContext.Provider value={{ count: equationCount, increment: incrementCount }}>
			<article className="space-y-8 max-w-none w-full overflow-x-hidden">
				<PostHeader />
				<hr />
				<div className="prose prose-lg max-w-none">
					<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
				</div>
				<hr />
				<PostPagination />
				<hr />
				<Comments />
			</article>
		</EquationContext.Provider>
	);
}
