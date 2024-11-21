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

// Enhanced animation variants with spring physics
const fadeIn = {
	hidden: { opacity: 0, y: -20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 100,
			damping: 15,
			mass: 1,
		},
	},
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
			className={cn(
				"space-y-8",
				"relative",
				"bg-gradient-to-br from-background/95 via-background/50 to-background/95",
				"backdrop-blur-lg",
				"rounded-2xl",
				"p-6 sm:p-8 md:p-10",
				"border border-border/50",
				"shadow-glow",
				"hover:shadow-soft",
				"transition-all duration-500",
				className
			)}
		>
			{/* Title Section with Enhanced Glitch Effect */}
			<div className="space-y-6">
				<motion.h1
					className={cn(
						"glitch-base",
						"text-title-sm sm:text-title-md md:text-title-lg lg:text-title-xl",
						"font-black tracking-tight",
						"bg-gradient-heading",
						"leading-[1.1]",
						"p-2",
						"relative z-10",
						"after:absolute after:inset-0",
						"after:bg-gradient-to-r after:from-primary/10 after:to-secondary/10",
						"after:rounded-xl after:blur-xl after:-z-10",
						"selection:bg-primary/20"
					)}
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{
						type: "spring",
						stiffness: 200,
						damping: 20,
					}}
					data-text={state.post.title}
				>
					{state.post.title}
				</motion.h1>

				{/* Enhanced Summary */}
				{state.post.summary && (
					<motion.p
						className={cn(
							"text-lg sm:text-xl md:text-2xl",
							"font-medium",
							"text-muted-foreground/90",
							"leading-relaxed",
							"max-w-prose",
							"bg-gradient-to-br from-background/80 to-background/60",
							"backdrop-blur-md",
							"rounded-xl p-4",
							"border border-border/20",
							"shadow-soft"
						)}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
					>
						{state.post.summary}
					</motion.p>
				)}
			</div>

			{/* Enhanced Metadata Section */}
			<div className="flex flex-wrap items-center gap-4">
				<motion.div
					className={cn(
						"flex items-center gap-3",
						"text-sm",
						"bg-primary/5",
						"backdrop-blur-md",
						"px-4 py-2",
						"rounded-full",
						"border border-primary/20",
						"shadow-soft",
						"hover:shadow-glow",
						"transition-all duration-300"
					)}
					whileHover={{ scale: 1.05, y: -2 }}
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

			{/* Enhanced Tags Section */}
			<div className="flex flex-wrap items-center gap-3">
				{state.post.tags?.map((tag, index) => (
					<motion.div
						key={tag}
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: index * 0.1 }}
					>
						<Link href={`/blog/tags/${tag}`}>
							<Badge
								variant="secondary"
								className={cn(
									"bg-gradient-to-r from-secondary/20 to-primary/20",
									"hover:from-secondary/30 hover:to-primary/30",
									"text-foreground/80",
									"transition-all duration-500",
									"border border-border/30",
									"backdrop-blur-md",
									"shadow-soft hover:shadow-glow",
									"transform hover:scale-110",
									"hover:-translate-y-1"
								)}
							>
								#{tag}
							</Badge>
						</Link>
					</motion.div>
				))}
			</div>

			{/* Enhanced Image Section */}
			<AnimatePresence>
				{state.post.image && (
					<motion.div
						className="space-y-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.7 }}
					>
						<div
							className={cn(
								"relative w-full h-[400px]",
								"rounded-2xl overflow-hidden",
								"ring-1 ring-primary/20",
								"shadow-glow",
								"transform-gpu",
								"transition-all duration-700",
								state.isHovered && "scale-[1.02]"
							)}
						>
							<Image
								src={state.post.image}
								alt={state.post.title}
								fill
								priority
								className={cn(
									"object-cover",
									"transition-all duration-700",
									"filter saturate-[0.9] brightness-[1.02]",
									state.isHovered && [
										"scale-110",
										"saturate-[1.1]",
										"brightness-[1.05]",
									]
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
				className={cn(
					"border-none h-px",
					"bg-gradient-separator",
					"opacity-50",
					"shadow-glow"
				)}
				initial={{ scaleX: 0 }}
				animate={{ scaleX: 1 }}
				transition={{ duration: 0.8 }}
			/>
		</motion.div>
	);
};

export default PostHeader;
