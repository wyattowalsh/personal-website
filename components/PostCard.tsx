// components/PostCard.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import TagLink from "@/components/TagLink";
import { cn } from "@/lib/utils";

interface PostCardProps {
	post: {
		slug: string;
		title?: string;
		summary?: string;
		date?: string;
		updated?: string;
		tags?: string[];
		image?: string;
		readingTime?: string;
	};
	className?: string;
}

const PostCard = ({ post, className }: PostCardProps) => {
	const {
		slug,
		title = "Untitled Post",
		summary = "No summary available.",
		date,
		updated,
		tags = [],
		image = "/logo.webp",
		readingTime = "A few minutes",
	} = post;

	return (
		<motion.div
			whileHover={{ y: -5 }}
			className={cn("transition-transform duration-300 h-full", className)}
		>
			<Link href={`/blog/posts/${slug}`} className="block h-full">
				<Card className="overflow-hidden bg-card hover:shadow-glow transition-shadow duration-300 cursor-pointer rounded-xl h-full flex flex-col">
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
						<div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>
						<div className="absolute bottom-0 left-0 right-0 p-4">
							<h3 className="text-xl font-semibold text-white leading-tight drop-shadow-lg">
								{title}
							</h3>
							<p className="text-sm text-gray-200 mt-1 line-clamp-2 drop-shadow-lg">
								{summary}
							</p>
						</div>
					</div>
					<div className="p-4 flex flex-col flex-grow">
						<div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
							{date && (
								<p>
									Published:{" "}
									{formatDate(date, "en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							)}
							{readingTime && <p>⏱️ {readingTime}</p>}
						</div>
						<Separator className="my-2" />
						{tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-auto">
								{tags.map((tag) => (
									<TagLink key={tag} tag={tag} isNested />
								))}
							</div>
						)}
					</div>
				</Card>
			</Link>
		</motion.div>
	);
};

export default PostCard;
