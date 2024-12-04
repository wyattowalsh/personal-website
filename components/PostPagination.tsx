"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AdjacentPost } from "@/lib/types"; // Change this import
import { getAdjacentPosts } from "@/lib/services";
import type { Route } from "next";

export default function PostPagination() {
	const [state, setState] = useState<{
		data: { prevPost: AdjacentPost | null; nextPost: AdjacentPost | null };
		isLoading: boolean;
		error: string | null;
	}>({
		data: { prevPost: null, nextPost: null },
		isLoading: true,
		error: null,
	});

	const pathname = usePathname();

	useEffect(() => {
		const loadAdjacentPosts = async () => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
				
				// Extract slug from pathname
				const matches = pathname.match(/^\/blog(?:\/posts)?\/([^\/]+)/);
				const slug = matches?.[1];
				
				if (!slug) {
					console.warn('Could not extract slug from pathname:', pathname);
					return;
				}

				const response = await fetch(`/api/blog/posts/${slug}/adjacent`);
				
				if (!response.ok) {
					throw new Error(`Failed to fetch adjacent posts (${response.status})`);
				}

				const { data } = await response.json();
				setState((prev) => ({
					...prev,
					data: {
						prevPost: data?.prev || null,
						nextPost: data?.next || null,
					},
					isLoading: false,
				}));
			} catch (error) {
				console.error("Error loading adjacent posts:", error);
				setState((prev) => ({
					...prev,
					isLoading: false,
					error: "Failed to load navigation",
					data: { prevPost: null, nextPost: null },
				}));
			}
		};

		if (pathname) loadAdjacentPosts();
	}, [pathname]);

	if (state.isLoading) {
		return (
			<div className="h-24 flex items-center justify-center">
				<div className="animate-pulse space-x-4">
					{[...Array(2)].map((_, i) => (
						<div key={i} className="w-48 h-16 bg-muted rounded-lg" />
					))}
				</div>
			</div>
		);
	}

	if (state.error) {
		return (
			<div className="text-destructive text-center my-8 p-4 rounded-lg bg-destructive/10">
				{state.error}
			</div>
		);
	}

	const { prevPost, nextPost } = state.data;

	if (!prevPost && !nextPost) return null;

	return (
		<nav
			className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12"
			aria-label="Post navigation"
		>
			<div>
				{" "}
				{/* Left column wrapper */}
				{nextPost && ( // Show older post (back) on left
					<Link
						href={`/blog/posts/${nextPost.slug}` as Route} // Always use /blog/[slug] format
						className="group"
					>
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, ease: "easeOut" }}
						>
							<Card
								className={cn(
									"pagination-card group/card",
									"p-6 h-full",
									"bg-pagination-gradient backdrop-blur-md",
									"border border-card-border/50",
									"shadow-lg transition-all duration-300",
									"hover:border-primary/50 hover:shadow-xl",
									"dark:hover:border-primary/30",
									"transform-gpu hover:scale-[1.02]"
								)}
							>
								<div className="flex items-center gap-4 relative z-10">
									<div className="pagination-icon">
										<ChevronLeft
											className={cn(
												"w-6 h-6 text-primary/70",
												"transition-transform duration-300",
												"group-hover/card:-translate-x-1"
											)}
										/>
									</div>
									<div className="flex-1">
										<p
											className={cn(
												"text-sm font-medium mb-1",
												"text-muted-foreground",
												"group-hover/card:text-primary",
												"transition-colors duration-300"
											)}
										>
											Earlier Post
										</p>
										<h3
											className={cn(
												"font-display text-lg",
												"text-foreground/90",
												"line-clamp-1",
												"group-hover/card:text-primary",
												"transition-colors duration-300"
											)}
										>
											{nextPost.title}
										</h3>
									</div>
								</div>
							</Card>
						</motion.div>
					</Link>
				)}
			</div>

			<div>
				{" "}
				{/* Right column wrapper */}
				{prevPost && ( // Show newer post (forward) on right
					<Link
						href={`/blog/posts/${prevPost.slug}` as Route} // Always use /blog/[slug] format
						className="group"
					>
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, ease: "easeOut" }}
						>
							<Card
								className={cn(
									"pagination-card group/card",
									"p-6 h-full",
									"bg-pagination-gradient backdrop-blur-md",
									"border border-card-border/50",
									"shadow-lg transition-all duration-300",
									"hover:border-primary/50 hover:shadow-xl",
									"dark:hover:border-primary/30",
									"transform-gpu hover:scale-[1.02]"
								)}
							>
								<div className="flex items-center gap-4 relative z-10">
									<div className="flex-1 text-right">
										<p
											className={cn(
												"text-sm font-medium mb-1",
												"text-muted-foreground",
												"group-hover/card:text-primary",
												"transition-colors duration-300"
											)}
										>
											Next Post
										</p>
										<h3
											className={cn(
												"font-display text-lg",
												"text-foreground/90",
												"line-clamp-1",
												"group-hover/card:text-primary",
												"transition-colors duration-300"
											)}
										>
											{prevPost.title}
										</h3>
									</div>
									<div className="pagination-icon">
										<ChevronRight
											className={cn(
												"w-6 h-6 text-primary/70",
												"transition-transform duration-300",
												"group-hover/card:translate-x-1"
											)}
										/>
									</div>
								</div>
							</Card>
						</motion.div>
					</Link>
				)}
			</div>
		</nav>
	);
}
