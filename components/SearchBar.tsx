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
import { ChevronDown, ChevronUp } from "lucide-react"; // Change import to use separate icons
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

interface Post {
	slug: string;
	title: string;
	summary: string;
	date: string;
	updated?: string;
	tags: string[];
	image?: string;
	readingTime?: string;
	content: string;
}

interface SearchBarProps {
	posts: Post[]; // Make sure Post type includes content field
	tags: string[];
}

const SearchBar = ({ posts, tags }: SearchBarProps) => {
	// Ensure stable initial states
	const [mounted, setMounted] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Post[]>([]); // Start empty
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [sortMethod, setSortMethod] = useState<string>("date");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	// Mount effect to initialize results with sorted posts
	useEffect(() => {
		const sortedPosts = [...posts].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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
				(new Date(b.date).getTime() - new Date(a.date).getTime()) * modifier
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
		<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			{/* Search Input Section */}
			<div className="mb-8">
				<div className="relative group">
					<Input
						type="text"
						className="w-full p-4 text-lg bg-background border-2 border-border 
                     hover:border-primary/50 focus:border-primary
                     dark:bg-gray-900 dark:text-gray-100
                     placeholder:text-muted-foreground/60
                     transition-all duration-300 ease-in-out
                     rounded-lg shadow-sm hover:shadow-md"
						placeholder="Search posts by title, content, or tags..."
						value={query}
						onChange={handleSearch}
					/>
					<div
						className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r 
                        from-primary/40 via-primary to-primary/40
                        transform scale-x-0 group-hover:scale-x-100
                        transition-transform duration-300"
					/>
				</div>
			</div>
			{/* Filters and Sort Section */}
			<div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
				<h3 className="text-lg font-semibold text-foreground/90 dark:text-gray-200 whitespace-nowrap">
					Filter & Sort
				</h3>

				{/* Tags moved here */}
				<div className="flex-1 flex flex-wrap gap-2">
					{tags.map((tag) => (
						<div
							key={tag}
							onClick={() => toggleTag(tag)}
							className={cn("cursor-pointer", {
								"opacity-50":
									selectedTags.length > 0 && !selectedTags.includes(tag),
							})}
						>
							<TagLink tag={tag} isNested />
						</div>
					))}
				</div>

				{/* Sort controls */}
				<div className="flex items-center gap-3 ml-auto">
					<Select value={sortMethod} onValueChange={setSortMethod}>
						<SelectTrigger
							className="w-[180px] bg-background dark:bg-gray-800 
                                    border-2 hover:border-primary/50"
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
									className="h-10 w-10 border-2 hover:border-primary/50
                           bg-background dark:bg-gray-800
                           hover:bg-accent/10 dark:hover:bg-gray-700
                           transition-colors duration-200"
								>
									{sortDirection === "asc" ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent className="bg-popover/95 backdrop-blur-sm">
								<p className="text-sm">
									{sortDirection === "asc" ? "Ascending" : "Descending"}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			<Separator className="my-8 opacity-50" />

			{/* Results Section */}
			<div
				suppressHydrationWarning
				className="grid gap-4 sm:gap-6 lg:gap-8 w-full
                  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                  [&>*]:h-full auto-rows-fr"
			>
				{results.length > 0 ? (
					results.length === 1 ? (
						// Single result - centered in grid
						<div className="sm:col-start-1 lg:col-start-2 w-full">
							<PostCard
								key={results[0].slug}
								post={results[0]}
								className="h-full" // Add h-full class
							/>
						</div>
					) : (
						// Multiple results
						results.map((post, idx) => (
							<motion.div
								key={post.slug}
								className="h-full" // Add h-full class
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.3,
									delay: Math.min(idx * 0.1, 0.8),
								}}
							>
								<PostCard
									post={post}
									className="h-full" // Add h-full class
								/>
							</motion.div>
						))
					)
				) : (
					// No results message - span full width
					<div className="col-span-full text-center py-12">
						<p className="text-lg text-muted-foreground">
							No matching posts found.
						</p>
						<Button
							variant="ghost"
							onClick={() => {
								setQuery("");
								setSelectedTags([]);
							}}
							className="mt-4 hover:text-primary"
						>
							Clear filters
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default SearchBar;
