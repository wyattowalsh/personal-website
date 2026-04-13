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

export const PostCard = ({ post, className: _className }: PostCardProps) => {
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
				className={cn(
					"overflow-hidden bg-card cursor-pointer h-full flex flex-col",
					"rounded-2xl border-0",
					"shadow-md hover:shadow-xl",
					"dark:shadow-black/20 dark:hover:shadow-black/40",
					"motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
					"motion-safe:hover:-translate-y-1",
					"motion-reduce:transition-none motion-reduce:transform-none",
				)}
			>
				<div className="relative aspect-[16/10] w-full overflow-hidden">
					{image === "/riso-hero.svg" ? (
						<RisoHero
							className="absolute inset-0 w-full h-full motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
						/>
					) : heroConfig ? (
						<ThemeAwareHero
							config={heroConfig}
							className="absolute inset-0 w-full h-full motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
						/>
					) : isSvg ? (
						<>
							{/* eslint-disable-next-line @next/next/no-img-element -- post hero images use external URLs not compatible with next/image */}
							<img
								src={image}
								alt={title}
								className="absolute inset-0 w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
							/>
						</>
					) : (
						<Image
							src={image}
							alt={title}
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
							placeholder="blur"
							blurDataURL="/logo.webp"
						/>
					)}
					{/* Refined gradient overlay - less heavy */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

					{/* Title and summary section */}
					<div className="absolute bottom-0 left-0 right-0 p-4 z-[1]">
						<h2
							className={cn(
								"text-lg sm:text-xl font-semibold leading-snug mb-1.5",
								"text-white",
								"tracking-tight"
							)}
						>
							<Link
								href={`/blog/posts/${slug}` as Route}
								className="no-underline text-inherit after:absolute after:inset-0 after:z-[1]"
							>
								{title}
							</Link>
						</h2>
						<p
							className={cn(
								"text-sm line-clamp-2",
								"text-white/80",
								"leading-relaxed"
							)}
						>
							{summary}
						</p>
					</div>
				</div>

				{/* Metadata section - refined styling */}
				<div className="relative p-4 flex flex-col flex-grow bg-card z-[2] pointer-events-none">
					<div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
						{created && (
							<span className="flex items-center gap-1.5">
								<Calendar className="h-3.5 w-3.5" />
								<time dateTime={created} className="font-medium">
									{formatDate(created)}
								</time>
							</span>
						)}
						{readingTime && (
							<span className="flex items-center gap-1.5">
								<Clock className="h-3.5 w-3.5" />
								<span>{readingTime}</span>
							</span>
						)}
					</div>
					{tags.length > 0 && (
						<>
							<Separator className="mb-3" />
							<div className="flex flex-wrap gap-1.5">
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
						</>
					)}
				</div>
			</Card>
		</article>
	);
};
