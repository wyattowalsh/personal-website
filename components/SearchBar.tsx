// components/SearchBar.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import PostCard from "./PostCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"; // Change import to use separate icons
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import TagLink from "@/components/TagLink"; // Ensure this is the correct import path
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { backend } from '@/lib/services/backend';
import type { PostMetadata } from '@/lib/types';

// Update interface to extend PostMetadata
interface Post extends PostMetadata {
  // Add any additional fields needed for the UI
  sortings?: {
    byDate: {
      asc: string[];
      desc: string[];
    };
    byTitle: {
      asc: string[];
      desc: string[];
    };
  };
}

interface SearchBarProps {
  posts: PostMetadata[];
  tags: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ posts, tags: unsortedTags }) => {
	// Filter out invalid posts
	const validPosts = useMemo(() => 
		posts.filter(post => post.title && post.created && post.tags)
	, [posts]);

	// Sort tags alphabetically
	const tags = useMemo(() => 
		[...unsortedTags].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
	, [unsortedTags]);

	// Ensure stable initial states
	const [mounted, setMounted] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Post[]>([]); // Start empty
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [sortMethod, setSortMethod] = useState<string>("date");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	// Update mount effect to handle empty posts
	useEffect(() => {
		if (!posts?.length) {
			console.warn("No posts provided to SearchBar");
			setResults([]);
			return;
		}

		const sortedPosts = [...posts].sort(
			(a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
		);
		setResults(sortedPosts);
		setMounted(true);
	}, [posts]);

	// Memoize the Fuse instance
	const fuse = useMemo(
		() =>
			new Fuse(posts, {
				keys: [
					{ name: "title", weight: 1.0 },
					{ name: "summary", weight: 0.8 },
					{ name: "content", weight: 0.6 },
					{ name: "tags", weight: 0.9 },
				],
				includeScore: true,
				threshold: 0.3,
				ignoreLocation: true, // Important for full-text search
				useExtendedSearch: true,
				findAllMatches: true, // Important for thorough search
			}),
		[posts]
	);

	// Update search effect to maintain sort order
	useEffect(() => {
		let searchResults = [...posts]; // Create new array to avoid mutating props

		if (query.trim()) {
			const fuseResults = fuse.search(query);
			// Sort by score and map to items
			searchResults = fuseResults
				.sort((a, b) => (a.score || 0) - (b.score || 0))
				.map(({ item }) => item);
		}

		if (selectedTags.length > 0) {
			searchResults = searchResults.filter((post) =>
				selectedTags.every((tag) => post.tags.includes(tag))
			);
		}

		// Always apply date sorting if no specific sort method is selected
		searchResults = searchResults.sort((a, b) => {
			const modifier = sortDirection === "asc" ? -1 : 1;
			if (sortMethod === "title") {
				return a.title.localeCompare(b.title) * modifier;
			}
			// Default to date sorting
			return (
				(new Date(b.created).getTime() - new Date(a.created).getTime()) * modifier
			);
		});

		setResults(searchResults);
	}, [query, selectedTags, sortMethod, sortDirection, posts, fuse]);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	};

	const toggleTag = (tag: string) => {
		setSelectedTags((prevTags) =>
			prevTags.includes(tag)
				? prevTags.filter((t) => t !== tag)
				: [...prevTags, tag]
		);
	};

	if (!mounted) {
		return null; // Prevent hydration issues by not rendering until mounted
	}

	return (
		<div className="w-full max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
			{/* Search Input Section - Enhanced responsiveness */}
			<div className="relative">
				<div className="relative group">
					<Input
						type="text"
						className={cn(
							"w-full",
							"p-3 sm:p-4",
							"text-base sm:text-lg",
							"bg-background/95 backdrop-blur-sm",
							"border-2 border-border",
							"hover:border-primary/50 focus:border-primary",
							"dark:bg-gray-900/95 dark:text-gray-100",
							"placeholder:text-muted-foreground/60",
							"transition-all duration-300 ease-in-out",
							"rounded-lg shadow-sm hover:shadow-md",
							"focus:ring-2 focus:ring-primary/20",
							"dark:focus:ring-primary/40"
						)}
						placeholder="Search posts by title, content, or tags..."
						value={query}
						onChange={handleSearch}
					/>
					<div
						className={cn(
							"absolute inset-x-0 bottom-0 h-0.5",
							"bg-gradient-to-r from-primary/40 via-primary to-primary/40",
							"transform scale-x-0 group-hover:scale-x-100",
							"transition-transform duration-300"
						)}
					/>
				</div>
			</div>

			{/* Filters and Sort Section - Improved layout */}
			<div
				className={cn(
					"flex flex-col gap-4",
					"sm:flex-row sm:items-start",
					"lg:items-center"
				)}
			>
				{/* Tags Section - Better wrapping */}
				<div
					className={cn(
						"flex-1",
						"flex flex-wrap gap-2",
						"max-h-[120px] sm:max-h-none",
						"overflow-y-auto sm:overflow-visible",
						"scrollbar-thin scrollbar-thumb-primary/20",
						"scrollbar-track-transparent",
						"items-center" // Add this
					)}
				>
					{tags.map((tag) => (
						<motion.div
							key={tag}
							onClick={() => toggleTag(tag)}
							className={cn(
								"cursor-pointer transition-all duration-200",
								selectedTags.length > 0 && !selectedTags.includes(tag)
									? "opacity-40 scale-95"
									: "opacity-100 scale-100",
								"hover:scale-105"
							)}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<TagLink tag={tag} isNested />
						</motion.div>
					))}

						<Link href="/blog/tags">
							<Badge
								variant="secondary"
								className="bg-secondary hover:bg-secondary/80 text-secondary-foreground cursor-pointer"
							>
								all tags
							</Badge>
						</Link>
				</div>

				{/* Sort Controls - Responsive layout */}
				<div
					className={cn(
						"flex items-center gap-3",
						"sm:ml-auto",
						"w-full sm:w-auto",
						"justify-end"
					)}
				>
					<Select value={sortMethod} onValueChange={setSortMethod}>
						<SelectTrigger
							className={cn(
								"w-full sm:w-[180px]",
								"bg-background/95 dark:bg-gray-800/95",
								"backdrop-blur-sm",
								"border-2 hover:border-primary/50",
								"transition-all duration-200"
							)}
						>
							<SelectValue placeholder="Sort by..." />
						</SelectTrigger>
						<SelectContent className="border-2 dark:border-gray-700">
							<SelectItem value="date">Sort by Date</SelectItem>
							<SelectItem value="title">Sort by Title</SelectItem>
						</SelectContent>
					</Select>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									onClick={() =>
										setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
									}
									className={cn(
										"h-10 w-10",
										"border-2 hover:border-primary/50",
										"bg-background/95 dark:bg-gray-800/95",
										"backdrop-blur-sm",
										"hover:bg-accent/10 dark:hover:bg-gray-700",
										"transition-all duration-200"
									)}
								>
									{sortDirection === "asc" ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent
								className="bg-popover/95 backdrop-blur-sm"
								sideOffset={5}
							>
								<p className="text-sm">
									{sortDirection === "asc" ? "Ascending" : "Descending"}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			<Separator className="opacity-50" />

			{/* Results Grid - Responsive layout */}
			<div
				className={cn(
					"grid gap-4 sm:gap-6 lg:gap-8",
					"grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
					"[&>*]:h-full",
					"auto-rows-fr"
				)}
			>
				{results.length > 0 ? (
					results.length === 1 ? (
						// Single result - centered
						<div className="sm:col-span-2 lg:col-start-2 lg:col-span-1">
								<Link 
									href={{
										pathname: '/blog/posts/[slug]',
										query: { slug: results[0].slug }
									}}
								>
									<PostCard 
										post={results[0]}
										className="h-full" 
									/>
								</Link>
						</div>
					) : (
						// Multiple results with staggered animation
						results.map((post, idx) => (
							<motion.div
								key={`${post.slug}-${idx}`}
								className="h-full"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									type: "spring",
									stiffness: 100,
									damping: 15,
									delay: Math.min(idx * 0.1, 0.8),
								}}
							>
									<Link 
										href={{
											pathname: '/blog/posts/[slug]',
											query: { slug: post.slug }
										}}
									>
										<PostCard 
											post={post}
											className="h-full" 
										/>
									</Link>
							</motion.div>
						))
					)
				) : (
					// No results message
					<motion.div
						className="col-span-full text-center py-12"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
					>
						<p className="text-lg text-muted-foreground mb-4">
							No matching posts found.
						</p>
						<Button
							variant="ghost"
							onClick={() => {
								setQuery("");
								setSelectedTags([]);
							}}
							className={cn(
								"hover:text-primary",
								"transition-all duration-200",
								"hover:scale-105 active:scale-95"
							)}
						>
							Clear filters
						</Button>
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default SearchBar;
