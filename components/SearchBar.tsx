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
import { motion } from "motion/react";
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import TagLink from "@/components/TagLink"; // Ensure this is the correct import path
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { backend } from "@/lib/server"; // Update this line
import type { PostMetadata } from "@/lib/core";
import type { Route } from "next";

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

// Add this helper function at the top of the file
const getPostDate = (post: PostMetadata): number => {
  return post.created ? new Date(post.created).getTime() : 0;
};

// Add this helper function at the top
const getPostTags = (post: PostMetadata): string[] => {
  return post.tags || [];
};

const SearchBar: React.FC<SearchBarProps> = ({ posts, tags: unsortedTags }) => {
	const prefersReducedMotion = useReducedMotion();

	// Filter out invalid posts
	const validPosts = useMemo(
		() => posts.filter((post) => post.title && post.created && post.tags),
		[posts]
	);

	// Sort tags case-insensitively but preserve original case for display
	const tags = useMemo(
		() => [...unsortedTags].sort((a, b) =>
			a.toLowerCase().localeCompare(b.toLowerCase())
		),
		[unsortedTags]
	);

	// Ensure stable initial states
	const [mounted, setMounted] = useState(false);
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
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

		const sortedPosts = [...posts].sort((a, b) => getPostDate(b) - getPostDate(a));
		setResults(sortedPosts);
		setMounted(true);
	}, [posts]);

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(query), 300);
		return () => clearTimeout(timer);
	}, [query]);

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

	// Update search effect to maintain sort order - use debouncedQuery instead of query
	useEffect(() => {
		let searchResults = [...posts]; // Create new array to avoid mutating props

		if (debouncedQuery.trim()) {
			const fuseResults = fuse.search(debouncedQuery);
			// Sort by score and map to items
			searchResults = fuseResults
				.sort((a, b) => (a.score || 0) - (b.score || 0))
				.map(({ item }) => item);
		}

		if (selectedTags.length > 0) {
			searchResults = searchResults.filter((post) =>
				selectedTags.every((tag) => getPostTags(post).includes(tag))
			);
		}

		// Always apply date sorting if no specific sort method is selected
		searchResults = searchResults.sort((a, b) => {
			const modifier = sortDirection === "asc" ? -1 : 1;
			if (sortMethod === "title") {
				return a.title.localeCompare(b.title) * modifier;
			}
			// Default to date sorting
			return (getPostDate(b) - getPostDate(a)) * modifier;
		});

		setResults(searchResults);
	}, [debouncedQuery, selectedTags, sortMethod, sortDirection, posts, fuse]);

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
		<div className="w-full max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pt-0 mt-0">
			 {/* Enhanced Search Input Section */}
			 <div className="relative">
        <div className="relative group">
          <Input
            type="text"
            className={cn(
              "w-full",
              "p-3 sm:p-4",
              "text-base sm:text-lg",
              "bg-background/95 dark:bg-gray-900/95",
              "border-2",
              "border-border hover:border-primary/50 focus:border-primary",
              "dark:border-gray-700 dark:hover:border-primary/50 dark:focus:border-primary",
              "text-foreground dark:text-gray-100",
              "placeholder:text-muted-foreground/60 dark:placeholder:text-gray-400/60",
              "transition-all duration-300 ease-out",
              "rounded-lg",
              "shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-primary/10",
              "focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30",
              "backdrop-blur-sm"
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
              "transition-transform duration-300 ease-out"
            )}
          />
        </div>
      </div>

      {/* Enhanced Filters and Sort Section */}
      <div className={cn(
        "flex flex-col gap-4",
        "sm:flex-row sm:items-start",
        "lg:items-center"
      )}>
        {/* Enhanced Tags Section */}
        <div className={cn(
          "flex-1",
          "flex flex-wrap gap-1.5 sm:gap-2", // Reduced gap
          "max-h-[120px] sm:max-h-none",
          "overflow-y-auto sm:overflow-visible",
          "scrollbar-thin scrollbar-thumb-primary/20 dark:scrollbar-thumb-primary/40",
          "scrollbar-track-transparent",
          "items-center",
          "p-0.5 sm:p-1" // Smaller padding on mobile
        )}>
          {tags.map((tag) => (
            <motion.button
              key={tag}
              onClick={() => toggleTag(tag)}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              aria-pressed={selectedTags.includes(tag)}
              className={cn(
                "inline-flex items-center",
                "min-h-[44px] min-w-[44px]", // Touch target size
                "px-2 py-1 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5", // Responsive padding
                "rounded-full",
                "text-xs sm:text-sm", // Smaller base text size
                "font-medium",
                "border-2 transition-all duration-200 ease-out",
                "hover:shadow-md dark:hover:shadow-primary/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selectedTags.includes(tag)
                  ? [
                      "bg-primary/10 dark:bg-primary/20",
                      "text-primary dark:text-primary-light",
                      "border-primary/50 dark:border-primary/50",
                      "hover:bg-primary/20 dark:hover:bg-primary/30",
                      "hover:border-primary dark:hover:border-primary",
                    ]
                  : [
                      "bg-background dark:bg-gray-900",
                      "text-muted-foreground dark:text-gray-300",
                      "border-border dark:border-gray-700",
                      "hover:bg-accent/10 dark:hover:bg-accent/20",
                      "hover:text-accent-foreground dark:hover:text-gray-200",
                      "hover:border-accent/50 dark:hover:border-accent/50",
                    ]
              )}
            >
              #{tag}
            </motion.button>
          ))}

          {/* Enhanced All Tags Link */}
          <Link
            href="/blog/tags"
            className={cn(
              "inline-flex items-center",
              "px-2 py-1 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5", // Match tag padding
              "rounded-full",
              "text-xs sm:text-sm", // Match tag text size
              "font-medium",
              "border-2 transition-all duration-200 ease-out",
              "hover:shadow-md dark:hover:shadow-primary/20",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "bg-background dark:bg-gray-900",
              "text-muted-foreground dark:text-gray-300",
              "border-border dark:border-gray-700",
              "hover:bg-primary/10 dark:hover:bg-primary/20",
              "hover:text-primary dark:hover:text-primary-light",
              "hover:border-primary/50 dark:hover:border-primary/50",
              "no-underline"
            )}
          >
            all tags
          </Link>
        </div>

        {/* Enhanced Sort Controls */}
        <div className={cn(
          "flex items-center gap-3",
          "sm:ml-auto",
          "w-full sm:w-auto",
          "justify-end"
        )}>
          <Select value={sortMethod} onValueChange={setSortMethod}>
            <SelectTrigger
              className={cn(
                "w-full sm:w-[180px]",
                "bg-background/95 dark:bg-gray-800/95",
                "backdrop-blur-sm",
                "border-2",
                "border-border hover:border-primary/50",
                "dark:border-gray-700 dark:hover:border-primary/50",
                "transition-all duration-200 ease-out",
                "shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-primary/10"
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
                    "border-2",
                    "border-border hover:border-primary/50",
                    "dark:border-gray-700 dark:hover:border-primary/50",
                    "bg-background/95 dark:bg-gray-800/95",
                    "backdrop-blur-sm",
                    "hover:bg-accent/10 dark:hover:bg-accent/20",
                    "transition-all duration-200 ease-out",
                    "shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-primary/10"
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
                className={cn(
                  "bg-popover/95 dark:bg-gray-800/95",
                  "backdrop-blur-sm",
                  "border dark:border-gray-700",
                  "shadow-lg dark:shadow-primary/20"
                )}
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

      {/* Enhanced Separator */}
      <Separator className="opacity-50 dark:opacity-30" />

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
								<PostCard post={results[0]} className="h-full" />
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
								<PostCard post={post} className="h-full" />
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
								"hover:scale-105 active:scale-95",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
