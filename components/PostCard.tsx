// components/PostCard.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Add this import
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import TagLink from "@/components/TagLink";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import type { Route } from "next";

// Add the same helper function
function isDifferentDate(
	date1: string | undefined,
	date2: string | undefined
): boolean {
	if (!date1 || !date2) return false;
	// Remove any milliseconds and 'Z' suffix for comparison
	const clean1 = date1.split(".")[0].replace("Z", "");
	const clean2 = date2.split(".")[0].replace("Z", "");
	return clean1 !== clean2;
}

interface PostCardProps {
	post: {
		slug: string;
		title?: string;
		summary?: string;
		created?: string; // Changed from date
		updated?: string; // Added
		tags?: string[];
		image?: string;
		readingTime?: string;
	};
	className?: string;
}

const PostCard = ({ post, className }: PostCardProps) => {
	const router = useRouter(); // Add this
	const {
		slug,
		title = "Untitled Post",
		summary = "No summary available.",
		created, // Changed from date
		updated,
		tags = [],
		image = "/logo.webp",
		readingTime = "A few minutes",
	} = post;

	// Option 1: Use template literal type assertion
	const handleCardClick = () => {
		router.push(`/blog/posts/${slug}` as Route);
	};

	// Alternative Option 2: Use pathname + params object
	// const handleCardClick = () => {
	//     router.push({
	//         pathname: '/blog/posts/[slug]',
	//         params: { slug }
	//     } as Route);
	// };

	return (
		<div className="block h-full">
			<Card
				onClick={handleCardClick}
				className="overflow-hidden bg-card hover:shadow-glow transition-shadow duration-300 cursor-pointer rounded-xl h-full flex flex-col"
			>
				<div className="relative aspect-video w-full">
					<Image
						src={image}
						alt={title}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						className="object-cover transition-transform duration-500 hover:scale-105"
						placeholder="blur"
						blurDataURL="/logo.webp"
						/>
					{/* Updated gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90"></div>

					{/* Title and summary section */}
					<div className="absolute bottom-0 left-0 right-0 p-4 z-[1]">
						<h3
							className={cn(
								"text-xl font-semibold leading-tight mb-2",
								"text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]",
								"tracking-tight"
							)}
						>
							{title}
						</h3>
						<p
							className={cn(
								"text-sm line-clamp-2",
								"text-gray-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]",
								"leading-relaxed"
							)}
						>
							{summary}
						</p>
					</div>
				</div>

				{/* Metadata section - Updated styles */}
				<div className="relative p-4 flex flex-col flex-grow bg-background/95 z-[2] pointer-events-none">
					<div className="flex items-center justify-between mb-2 text-sm !text-muted-foreground">
						{created && (
							<span className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								<time
									dateTime={created}
									className="font-medium !text-muted-foreground"
								>
									{formatDate(created)}
								</time>
							</span>
						)}
						{readingTime && (
							<span className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								<span className="!text-muted-foreground">{readingTime}</span>
							</span>
						)}
					</div>
					<Separator className="my-2" />
					{tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
							{/* Sort tags case-insensitively but preserve original case for display */}
							{[...tags]
								.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
								.map((tag) => (
									<Link
										key={tag}
										href={`/blog/tags/${tag}`}
										onClick={(e) => {
											e.stopPropagation();
											e.preventDefault();
											router.push(`/blog/tag/${tag}`);
										}}
										className={cn(
											// Base styles
											"inline-flex items-center pointer-events-auto",
											"text-xs sm:text-sm font-medium",
											"px-2 py-0.5 sm:px-2.5 sm:py-1",
											"rounded-full",
											"border transition-all duration-200",
											"no-underline",
											"transform-gpu hover:scale-[1.02] active:scale-[0.98]",
											
											// Light mode styles
											"bg-white/50 hover:bg-primary/10",
											"text-muted-foreground hover:text-primary",
											"border-muted-foreground/20 hover:border-primary/50",
											
											// Dark mode styles
											"dark:bg-white/5 dark:hover:bg-primary/20",
											"dark:text-muted-foreground dark:hover:text-primary-light",
											"dark:border-muted-foreground/10 dark:hover:border-primary/40",
											
											// Shadow effects
											"shadow-sm hover:shadow-md",
											"dark:shadow-none dark:hover:shadow-primary/20",
											
											// Focus styles
											"focus:outline-none focus:ring-2 focus:ring-primary/40",
											"dark:focus:ring-primary/40"
										)}
									>
										#{tag}
									</Link>
								))}
						</div>
					)}
				</div>
			</Card>
		</div>
	);
};

export default PostCard;
