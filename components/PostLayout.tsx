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
					"prose dark:prose-invert",
					"w-full max-w-none", // Remove default prose max-width
					"space-y-8",
					"relative",
					// Add responsive spacing
					"mx-auto",
					// Remove top padding/margin
					"pt-0 mt-0",
					"sm:px-0"
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

				<hr className={cn(
					"my-8",
					"border-border",
					"opacity-50",
					"max-w-5xl mx-auto" // Match PostHeader width
				)} />

				<ErrorBoundary>
					<div className={cn(
						"prose-content",
						"relative z-10",
						"max-w-5xl mx-auto", // Match PostHeader width
						// Add responsive text sizing
						"prose-p:text-base sm:prose-p:text-lg",
						"prose-headings:scroll-mt-20",
						// Add responsive spacing
						"prose-p:my-4 sm:prose-p:my-6",
						"prose-headings:my-6 sm:prose-headings:my-8",
						// Ensure inline code and math are responsive
						"prose-code:text-sm sm:prose-code:text-base",
						"[&_.math-inline]:text-sm [&_.math-inline]:sm:text-base"
					)}>
						{children}
					</div>
				</ErrorBoundary>

				<hr className={cn(
					"my-8",
					"border-border",
					"opacity-50",
					"max-w-5xl mx-auto" // Match PostHeader width
				)} />

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

				<hr className={cn(
					"my-8",
					"border-border",
					"opacity-50",
					"max-w-5xl mx-auto" // Match PostHeader width
				)} />

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
