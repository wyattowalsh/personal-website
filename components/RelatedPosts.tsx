import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { TagPill } from '@/components/ui/tag-pill';
import { Clock } from 'lucide-react';
import type { Route } from 'next';
import type { PostMetadata } from '@/lib/types';

interface RelatedPostsProps {
	posts: PostMetadata[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
	if (posts.length === 0) return null;

	return (
		<section
			className="max-w-5xl mx-auto my-12"
			aria-label="Related posts"
		>
			<h2
				className={cn(
					'text-2xl font-semibold mb-6',
					'text-foreground/90',
					'tracking-tight'
				)}
			>
				Related Posts
			</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{posts.map((post) => (
					<RelatedPostCard key={post.slug} post={post} />
				))}
			</div>
		</section>
	);
}

function RelatedPostCard({ post }: { post: PostMetadata }) {
	const { slug, title, image, tags, readingTime } = post;
	const displayTags = tags.slice(0, 2);
	const isSvg = image?.endsWith('.svg');

	return (
		<article className="group h-full">
			<Link
				href={`/blog/posts/${slug}` as Route}
				className="no-underline block h-full"
			>
				<Card
					className={cn(
						'overflow-hidden h-full flex flex-col',
						'bg-card rounded-xl',
						'border border-card-border/50',
						'shadow-sm hover:shadow-glow',
						'transition-all duration-300',
						'hover:border-primary/50',
						'transform-gpu hover:scale-[1.02]'
					)}
				>
					{/* Thumbnail */}
					<div className="relative aspect-[16/10] w-full overflow-hidden">
						{image ? (
							isSvg ? (
								/* eslint-disable-next-line @next/next/no-img-element -- post hero images use external URLs not compatible with next/image */
								<img
									src={image}
									alt={title}
									className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
							) : (
								<Image
									src={image}
									alt={title}
									fill
									sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
									className="object-cover transition-transform duration-500 group-hover:scale-105"
								/>
							)
						) : (
							<div className="absolute inset-0 bg-muted" />
						)}
						<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />

						{/* Title overlay */}
						<div className="absolute bottom-0 left-0 right-0 p-3 z-[1]">
							<h3
								className={cn(
									'text-sm sm:text-base font-semibold leading-snug',
									'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]',
									'line-clamp-2'
								)}
							>
								{title}
							</h3>
						</div>
					</div>

					{/* Metadata */}
					<div className="p-3 flex flex-col gap-2 bg-background/95 flex-grow">
						{readingTime && (
							<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
								<Clock className="h-3 w-3" />
								{readingTime}
							</span>
						)}
						{displayTags.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{displayTags.map((tag) => (
									<TagPill
										key={tag}
										tag={tag}
										className="text-[10px] sm:text-xs px-1.5 py-0.5"
									/>
								))}
							</div>
						)}
					</div>
				</Card>
			</Link>
		</article>
	);
}
