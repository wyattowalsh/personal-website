// components/PostCard.tsx

"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TagPill } from "@/components/ui/tag-pill";
import { Calendar, Clock } from "lucide-react";
import type { Route } from "next";
import ThemeAwareHero, { getHeroConfig } from "@/components/heroes/ThemeAwareHero";
import RisoHero from "@/components/heroes/RisoHero";

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

const PostCard = ({ post, className: _className }: PostCardProps) => {
	const {
		slug,
		title = "Untitled Post",
		summary = "No summary available.",
		created, // Changed from date
		updated: _updated,
		tags = [],
		image = "/logo.webp",
		readingTime = "A few minutes",
	} = post;
	const isSvg = image.endsWith(".svg");
	const heroConfig = getHeroConfig(image);

	return (
		<article className="block h-full relative group">
			<Card
				className="overflow-hidden bg-card hover:shadow-glow transition-shadow duration-300 cursor-pointer rounded-xl h-full flex flex-col"
			>
				<div className="relative aspect-video w-full">
					{image === "/riso-hero.svg" ? (
						<RisoHero
							className="absolute inset-0 w-full h-full transition-transform duration-500 hover:scale-105"
						/>
					) : heroConfig ? (
						<ThemeAwareHero
							config={heroConfig}
							className="absolute inset-0 w-full h-full transition-transform duration-500 hover:scale-105"
						/>
					) : isSvg ? (
						<>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={image}
								alt={title}
								className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
							/>
						</>
					) : (
						<Image
							src={image}
							alt={title}
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							className="object-cover transition-transform duration-500 hover:scale-105"
							placeholder="blur"
							blurDataURL="/logo.webp"
						/>
					)}
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
							<Link
								href={`/blog/posts/${slug}` as Route}
								className="no-underline text-inherit after:absolute after:inset-0 after:z-[1]"
							>
								{title}
							</Link>
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
									<TagPill
										key={tag}
										tag={tag}
										href={`/blog/tags/${tag}`}
										onClick={(e) => {
											e.stopPropagation();
										}}
										className="pointer-events-auto"
									/>
								))}
						</div>
					)}
				</div>
			</Card>
		</article>
	);
};

export default PostCard;
