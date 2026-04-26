import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostHeader } from "@/components/PostHeader";
import { PostPagination } from "@/components/PostPagination";
import { Comments } from "@/components/Comments";
import { TableOfContents } from "@/components/TableOfContents";
import { PostLayoutShareButtons } from "@/components/PostLayoutShareButtons";
import { RelatedPosts } from "@/components/RelatedPosts";
import { SeriesNav } from "@/components/SeriesNav";
import { Webmentions } from "@/components/Webmentions";
import { cn } from "@/lib/utils";
import type { AdjacentPosts, PostMetadata } from "@/lib/types";

interface SeriesNavigationData {
	seriesName: string;
	currentSlug: string;
	posts: Array<{ slug: string; title: string; order: number }>;
}

interface PostLayoutProps {
	children: React.ReactNode;
	post: PostMetadata;
	adjacentPosts: AdjacentPosts | null;
	relatedPosts: PostMetadata[];
	seriesNavigation: SeriesNavigationData | null;
}

export function PostLayout({
	children,
	post,
	adjacentPosts,
	relatedPosts,
	seriesNavigation,
}: PostLayoutProps) {
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
				<ErrorBoundary fallback={
					<div className="text-destructive text-center p-4">
						Failed to load post header
					</div>
				}>
					<PostHeader post={post} />
				</ErrorBoundary>

				<hr className={cn(
					"my-8",
					"border-border",
					"opacity-50",
					"max-w-5xl mx-auto" // Match PostHeader width
				)} />

				{seriesNavigation && (
					<ErrorBoundary>
						<div className="max-w-5xl mx-auto not-prose">
							<SeriesNav
								seriesName={seriesNavigation.seriesName}
								currentSlug={seriesNavigation.currentSlug}
								posts={seriesNavigation.posts}
							/>
						</div>
					</ErrorBoundary>
				)}

				{/* Table of contents + content area (mobile: collapsible above content, desktop: sticky sidebar) */}
				<div className="xl:flex xl:flex-row-reverse xl:gap-8 max-w-5xl mx-auto">
					{/* ToC — on mobile (xl:hidden) it renders a collapsible above content via DOM order;
					     on desktop (xl:block) it renders as a sticky sidebar in the right column */}
					<ErrorBoundary>
						<Suspense fallback={null}>
							<div className="not-prose">
								<TableOfContents />
							</div>
						</Suspense>
					</ErrorBoundary>

					<div className="flex-1 min-w-0">
						<ErrorBoundary>
							<div className={cn(
								"prose-content",
								"relative z-10",
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
					</div>
				</div>

				{/* Share buttons */}
				<ErrorBoundary>
					<div className="not-prose max-w-5xl mx-auto">
						<PostLayoutShareButtons slug={post.slug} title={post.title} />
					</div>
				</ErrorBoundary>

				{seriesNavigation && (
					<ErrorBoundary>
						<div className="max-w-5xl mx-auto not-prose">
							<SeriesNav
								seriesName={seriesNavigation.seriesName}
								currentSlug={seriesNavigation.currentSlug}
								posts={seriesNavigation.posts}
							/>
						</div>
					</ErrorBoundary>
				)}

				<hr className={cn(
					"my-8",
					"border-border",
					"opacity-50",
					"max-w-5xl mx-auto" // Match PostHeader width
				)} />

				<ErrorBoundary fallback={
					<div className="text-destructive text-center p-4">
						Failed to load post navigation
					</div>
				}>
					<PostPagination adjacentPosts={adjacentPosts} />
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

				{/* Webmentions — after comments */}
				<ErrorBoundary>
					<div className="not-prose">
						<Webmentions />
					</div>
				</ErrorBoundary>

				{/* Related posts — after webmentions */}
				<ErrorBoundary>
					<div className="not-prose">
						<RelatedPosts posts={relatedPosts} />
					</div>
				</ErrorBoundary>
			</article>
		</ErrorBoundary>
	);
}
