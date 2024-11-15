"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectItem,
	SelectTrigger,
	SelectContent,
	SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/Pagination";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import { Checkbox } from "@/components/ui/checkbox";

interface Post {
	slug: string;
	title: string;
	date: string;
	tags: string[];
	summary: string;
	content?: string;
	image: string;
	updated: string;
}

interface BlogPageClientProps {
	allPosts: Post[];
	tags: string[];
}

export default function BlogPageClient({
	allPosts,
	tags,
}: BlogPageClientProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [sortBy, setSortBy] = useState<
		"date_desc" | "date_asc" | "title_asc" | "title_desc"
	>("date_desc");
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	const [posts, setPosts] = useState(allPosts);
	const [totalPosts, setTotalPosts] = useState(allPosts.length);

	useEffect(() => {
		const fuse = new Fuse(allPosts, {
			keys: ["title", "summary", "content"],
			threshold: 0.3,
		});

		const filterPosts = () => {
			let filteredPosts = allPosts;

			if (searchTerm) {
				const results = fuse.search(searchTerm);
				filteredPosts = results.map((result) => result.item);
			}

			if (selectedTags.length > 0) {
				filteredPosts = filteredPosts.filter((post) =>
					selectedTags.every((tag) => post.tags.includes(tag))
				);
			}

			const [sortField, sortOrder] = sortBy.split("_");
			const order = sortOrder === "asc" ? 1 : -1;
			filteredPosts.sort((a, b) => {
				if (sortField === "date") {
					return (new Date(a.date) < new Date(b.date) ? -1 : 1) * order;
				} else if (sortField === "title") {
					return a.title.localeCompare(b.title) * order;
				}
				return 0;
			});

			const total = filteredPosts.length;
			setTotalPosts(total);
			const start = (currentPage - 1) * pageSize;
			const end = currentPage * pageSize;
			setPosts(filteredPosts.slice(start, end));
		};

		filterPosts();
	}, [searchTerm, selectedTags, sortBy, currentPage, allPosts]);

	const totalPages = Math.ceil(totalPosts / pageSize);

	return (
		<motion.main
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="space-y-6"
		>
			<Input
				placeholder="Search posts..."
				value={searchTerm}
				onChange={(e) => {
					setSearchTerm(e.target.value);
					setCurrentPage(1);
				}}
			/>

			<div className="flex flex-wrap gap-4">
				{tags.map((tag) => (
					<div key={tag} className="flex items-center space-x-2">
						<Checkbox
							id={tag}
							checked={selectedTags.includes(tag)}
							onCheckedChange={(checked) => {
								if (checked) {
									setSelectedTags((prev) => [...prev, tag]);
								} else {
									setSelectedTags((prev) => prev.filter((t) => t !== tag));
								}
								setCurrentPage(1);
							}}
						/>
						<label htmlFor={tag} className="text-sm">
							{tag}
						</label>
					</div>
				))}
			</div>

			<div className="flex items-center space-x-2">
				<Select
					value={sortBy}
					onValueChange={(value) => setSortBy(value as any)}
				>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="date_desc">Date (Newest First)</SelectItem>
						<SelectItem value="date_asc">Date (Oldest First)</SelectItem>
						<SelectItem value="title_asc">Title (A-Z)</SelectItem>
						<SelectItem value="title_desc">Title (Z-A)</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{posts.map((post) => (
					<PostCard key={post.slug} post={post} />
				))}
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={(page) => setCurrentPage(page)}
			/>
		</motion.main>
	);
}
