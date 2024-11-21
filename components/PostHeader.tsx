"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { PostMetadata } from "@/lib/posts";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Clock, Calendar, RefreshCw } from "lucide-react";

// Define animation variants
const fadeIn = {
	hidden: { opacity: 0, y: -20 },
	visible: { opacity: 1, y: 0 },
};

const scaleIn = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: { opacity: 1, scale: 1 },
};

interface PostHeaderProps {
	className?: string;
}

const PostHeader: React.FC<PostHeaderProps> = ({ className }) => {
	const [state, setState] = useState<{
		post: PostMetadata | null;
		isLoading: boolean;
		error: string | null;
		isHovered: boolean;
		imageLoaded: boolean;
	}>({
		post: null,
		isLoading: true,
		error: null,
		isHovered: false,
		imageLoaded: false,
	});

	const pathname = usePathname();

	useEffect(() => {
		const controller = new AbortController();

		const fetchPost = async () => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
				const slug = pathname.split("/blog/posts/")[1];
				if (!slug) return;

				const response = await fetch(`/api/blog/posts/${slug}`, {
					signal: controller.signal,
					headers: {
						"Cache-Control":
							"public, max-age=3600, stale-while-revalidate=86400",
					},
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const post = await response.json();
				setState((prev) => ({ ...prev, post, isLoading: false }));
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") return;

				const errorMessage =
					error instanceof Error ? error.message : "Failed to load post";
				console.error("Error loading post:", errorMessage);
				setState((prev) => ({
					...prev,
					error: errorMessage,
					isLoading: false,
				}));
			}
		};

		fetchPost();
		return () => controller.abort();
	}, [pathname]);

	if (state.isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[200px] animate-pulse">
				<LoadingSpinner />
			</div>
		);
	}

	if (state.error || !state.post) {
		return (
			<div className="text-destructive text-center p-4 animate-fadeIn">
				{state.error || "Post not found"}
			</div>
		);
	}

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={fadeIn}
			transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
			className={cn(
				"space-y-6",
				"relative",
				"bg-background/50 backdrop-blur-sm",
				"rounded-lg",
				className
			)}
		>
			{/* Title and Summary Section */}
			<div className="space-y-4">
				{/* Title with better contrast */}
				<motion.h1
					className={cn(
						"text-title-sm sm:text-title-md md:text-title-lg lg:text-title-xl",
						"font-bold tracking-tight",
						"text-foreground", // Direct color instead of gradient for better legibility
						"relative", // For pseudo-element decoration
						"leading-tight",
						"after:content-[''] after:absolute after:bottom-0 after:left-0",
						"after:w-full after:h-1",
						"after:bg-gradient-to-r after:from-primary/50 after:via-primary after:to-primary/50",
						"after:rounded-full after:opacity-50"
					)}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6 }}
				>
					{state.post.title}
				</motion.h1>

				{/* Subtle separator */}
				<motion.div
					className={cn(
						"w-full h-px",
						"bg-gradient-to-r from-transparent via-border to-transparent",
						"opacity-30"
					)}
					initial={{ scaleX: 0 }}
					animate={{ scaleX: 1 }}
					transition={{ duration: 0.7, delay: 0.2 }}
				/>

				{/* Enhanced summary */}
				{state.post.summary && (
					<motion.p
						className={cn(
							"text-lg sm:text-xl",
							"font-medium",
							"text-muted-foreground",
							"leading-relaxed",
							"max-w-prose",
							"backdrop-blur-sm",
							"rounded-lg",
							"relative",
							"z-10"
						)}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						{state.post.summary}
					</motion.p>
				)}

				{/* Bottom separator with glow */}
				<motion.div
					className={cn(
						"w-full h-px",
						"bg-gradient-to-r from-transparent via-primary/30 to-transparent",
						"shadow-sm shadow-primary/20"
					)}
					initial={{ scaleX: 0 }}
					animate={{ scaleX: 1 }}
					transition={{ duration: 0.7, delay: 0.4 }}
				/>
			</div>

			{/* Enhanced metadata row with better contrast */}
			<div className="flex flex-wrap items-center gap-3">
				<motion.div
					className={cn(
						"flex items-center gap-2",
						"text-sm text-foreground/80",
						"bg-background/80 backdrop-blur-sm",
						"px-3 py-1.5 rounded-full",
						"border border-border",
						"shadow-sm hover:shadow-md",
						"transition-all duration-300"
					)}
					whileHover={{ scale: 1.02, y: -1 }}
				>
					<Calendar className="w-4 h-4 text-primary" />
					<time dateTime={state.post.date}>{formatDate(state.post.date)}</time>
				</motion.div>

				{state.post.updated && (
					<motion.div
						className="flex items-center gap-2 text-sm text-muted-foreground/90
                bg-primary/5 backdrop-blur-sm px-3 py-1.5 rounded-full
                border border-primary/10"
						whileHover={{ scale: 1.02, backgroundColor: "var(--primary-10)" }}
					>
						<RefreshCw className="w-4 h-4 text-primary/70" />
						<time dateTime={state.post.updated}>
							Updated: {formatDate(state.post.updated)}
						</time>
					</motion.div>
				)}

				{state.post.readingTime && (
					<motion.div
						className="flex items-center gap-2 text-sm text-muted-foreground/90
                bg-primary/5 backdrop-blur-sm px-3 py-1.5 rounded-full
                border border-primary/10"
						whileHover={{ scale: 1.02, backgroundColor: "var(--primary-10)" }}
					>
						<Clock className="w-4 h-4 text-primary/70" />
						<span>{state.post.readingTime}</span>
					</motion.div>
				)}
			</div>

			{/* Enhanced tags with better visibility */}
			<div className="flex flex-wrap items-center gap-3">
				{state.post.tags?.map((tag, index) => (
					<motion.div
						key={tag}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Link href={`/blog/tags/${tag}`}>
							<Badge
								variant="secondary"
								className={cn(
									"bg-secondary/20 hover:bg-secondary/30",
									"text-secondary-foreground",
									"transition-all duration-300",
									"border border-secondary/30",
									"backdrop-blur-sm",
									"shadow-sm hover:shadow-md",
									"transform hover:scale-105",
									"hover:-translate-y-0.5"
								)}
							>
								#{tag}
							</Badge>
						</Link>
					</motion.div>
				))}
			</div>

			{/* Enhanced image presentation */}
			<AnimatePresence>
				{state.post.image && (
					<motion.div
						className="space-y-3"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.5 }}
					>
						<div
							className="relative w-full h-[400px] rounded-xl overflow-hidden
                 ring-1 ring-primary/10 shadow-lg"
						>
							<Image
								src={state.post.image}
								alt={state.post.title}
								fill
								priority
								className={cn(
									"object-cover transition-all duration-700",
									state.isHovered && "scale-105"
								)}
								onLoadingComplete={() =>
									setState((prev) => ({ ...prev, imageLoaded: true }))
								}
								onMouseEnter={() =>
									setState((prev) => ({ ...prev, isHovered: true }))
								}
								onMouseLeave={() =>
									setState((prev) => ({ ...prev, isHovered: false }))
								}
							/>
						</div>
						{state.post.caption && (
							<motion.p
								className="text-sm text-center text-muted-foreground/80 italic"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3 }}
							>
								{state.post.caption}
							</motion.p>
						)}
					</motion.div>
				)}
			</AnimatePresence>

			<motion.hr
				className="border-border/30"
				initial={{ scaleX: 0 }}
				animate={{ scaleX: 1 }}
				transition={{ duration: 0.7 }}
			/>
		</motion.div>
	);
};

export default PostHeader;
