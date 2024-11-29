"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import PostHeader from "@/components/PostHeader";
import PostPagination from "@/components/PostPagination";
import Comments from "@/components/Comments";
import { cn } from "@/lib/utils";

interface PostLayoutProps {
	children: React.ReactNode;
}

export function PostLayout({ children }: PostLayoutProps) {
	return (
		<ErrorBoundary>
			<article
				className={cn(
					"prose dark:prose-invert max-w-none",
					"space-y-8",
					"relative"
				)}
			>
				<ErrorBoundary>
					<Suspense
						fallback={
							<div className="w-full h-48 flex items-center justify-center">
								<LoadingSpinner size="lg" />
							</div>
						}
					>
						<PostHeader />
					</Suspense>
				</ErrorBoundary>

				<hr className={cn("my-8", "border-border", "opacity-50")} />

				<ErrorBoundary>
					<div className={cn("prose-content", "relative z-10")}>{children}</div>
				</ErrorBoundary>

				<hr className={cn("my-8", "border-border", "opacity-50")} />

				<ErrorBoundary>
					<Suspense
						fallback={
							<div className="w-full h-24 flex items-center justify-center">
								<LoadingSpinner />
							</div>
						}
					>
						<PostPagination />
					</Suspense>
				</ErrorBoundary>

				<hr className={cn("my-8", "border-border", "opacity-50")} />

				<ErrorBoundary>
					<Suspense
						fallback={
							<div className="w-full h-24 flex items-center justify-center">
								<LoadingSpinner />
							</div>
						}
					>
						<Comments />
					</Suspense>
				</ErrorBoundary>
			</article>
		</ErrorBoundary>
	);
}
