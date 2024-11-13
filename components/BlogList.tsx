"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { FaArrowRight, FaSearch, FaCalendarAlt, FaTags } from "react-icons/fa";
import Link from "next/link";
import type { Post } from "@/lib/posts";
import { useState, useEffect } from "react";
import Fuse from "fuse.js";

export default function BlogList({ posts }: { posts: Post[] }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("");

	// Create a list of all tags
	const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

	// Create options for time periods
	const timePeriods = ["All time", "Past Year", "Past Month", "Past Week"];

	// Implement Fuse.js for fuzzy search
	const fuse = new Fuse(posts, {
		keys: ["title", "summary", "content"],
		threshold: 0.3,
		includeScore: true,
	});

	let filteredPosts = posts;

	if (searchQuery) {
		const fuseResults = fuse.search(searchQuery);
		filteredPosts = fuseResults.map((result) => result.item);
	}

	if (selectedTags.length > 0) {
		filteredPosts = filteredPosts.filter((post) =>
			selectedTags.every((tag) => post.tags.includes(tag))
		);
	}

	if (selectedTimePeriod && selectedTimePeriod !== "All time") {
		const now = new Date();
		let timeLimit: Date;

		if (selectedTimePeriod === "Past Year") {
			timeLimit = new Date(
				now.getFullYear() - 1,
				now.getMonth(),
				now.getDate()
			);
		} else if (selectedTimePeriod === "Past Month") {
			timeLimit = new Date(
				now.getFullYear(),
				now.getMonth() - 1,
				now.getDate()
			);
		} else if (selectedTimePeriod === "Past Week") {
			timeLimit = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() - 7
			);
		}

		filteredPosts = filteredPosts.filter(
			(post) => new Date(post.date) >= timeLimit
		);
	}

	return (
		<div className="prose mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<motion.article
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				className="py-16"
			>
				<motion.h1
					className="text-center mb-12 relative flex items-center justify-center gap-3 text-5xl"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1 }}
				>
					<motion.div
						className="relative inline-flex items-center"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						<motion.span
							className="relative z-10 font-mono font-bold tracking-tight bg-clip-text text-transparent"
							style={{
								backgroundImage: "linear-gradient(135deg, #6a9fb5, #89c4d4)",
								filter: "drop-shadow(0 2px 4px rgba(106, 159, 181, 0.3))",
							}}
						>
							w4w.dev
						</motion.span>
						{/* Tech-style decorative elements */}
						<motion.div
							className="absolute -inset-2 rounded-lg"
							style={{
								background:
									"linear-gradient(45deg, rgba(106, 159, 181, 0.1), rgba(137, 196, 212, 0.2))",
								filter: "blur(8px)",
								zIndex: -1,
							}}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 1, delay: 0.4 }}
						/>
						<motion.div
							className="absolute -inset-0.5 rounded-md bg-[#6a9fb5]/10"
							style={{ backdropFilter: "blur(4px)", zIndex: -1 }}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.6 }}
						/>
						<motion.span
							className="absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-[#6a9fb5] to-[#89c4d4]"
							initial={{ width: 0 }}
							animate={{ width: "100%" }}
							transition={{ duration: 0.8, delay: 0.8 }}
						/>
						{/* Animated circuit-like dots */}
						{[...Array(5)].map((_, i) => (
							<motion.div
								key={i}
								className="absolute w-1.5 h-1.5 rounded-full bg-[#6a9fb5]"
								style={{
									top: `${20 * (i + 1)}%`,
									left: i % 2 === 0 ? "-8px" : "calc(100% + 8px)",
								}}
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8] }}
								transition={{
									duration: 0.5,
									delay: 1 + i * 0.1,
									repeat: Infinity,
									repeatType: "reverse",
									repeatDelay: 1,
								}}
							/>
						))}
					</motion.div>
					<motion.span
						className="relative font-serif italic text-muted-foreground"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 1 }}
						style={{
							textShadow: "0 2px 4px rgba(0,0,0,0.1)",
							filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.1))",
						}}
					>
						blog
					</motion.span>
					{/* Background animation */}
					<motion.div
						className="absolute inset-0 -z-10"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1 }}
					>
						{[...Array(3)].map((_, i) => (
							<motion.div
								key={i}
								className="absolute rounded-full"
								style={{
									background: `radial-gradient(circle, rgba(106, 159, 181, 0.2) 0%, rgba(106, 159, 181, 0) 70%)`,
									width: `${Math.random() * 200 + 100}px`,
									height: `${Math.random() * 200 + 100}px`,
									left: `${Math.random() * 100}%`,
									top: `${Math.random() * 100}%`,
								}}
								animate={{
									scale: [1, 1.2, 1],
									opacity: [0.3, 0.5, 0.3],
									x: [0, Math.random() * 50 - 25, 0],
									y: [0, Math.random() * 50 - 25, 0],
								}}
								transition={{
									duration: Math.random() * 5 + 5,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>
						))}
					</motion.div>
				</motion.h1>
				{/* Search and Filters */}
				<div className="mb-8">
					<div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
						<Input
							placeholder="Search posts..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full md:w-1/2"
						/>
						<Select
							value={selectedTimePeriod}
							onValueChange={setSelectedTimePeriod}
						>
							<SelectTrigger className="w-full md:w-1/4">
								<SelectValue placeholder="Select time period" />
							</SelectTrigger>
							<SelectContent>
								{timePeriods.map((period) => (
									<SelectItem key={period} value={period}>
										{period}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{/* Tags filter */}
						<div className="flex flex-wrap gap-2">
							{allTags.map((tag) => (
								<Badge
									key={tag}
									variant={selectedTags.includes(tag) ? "default" : "outline"}
									onClick={() => {
										if (selectedTags.includes(tag)) {
											setSelectedTags(selectedTags.filter((t) => t !== tag));
										} else {
											setSelectedTags([...selectedTags, tag]);
										}
									}}
									className="cursor-pointer text-black dark:text-white"
								>
									{tag}
								</Badge>
							))}
						</div>
					</div>
				</div>
				<div className="mt-8 grid gap-6 md:grid-cols-2">
					{filteredPosts.length > 0 ? (
						filteredPosts.map((post) => (
							<motion.div
								key={post.slug}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="card-container"
							>
								<Link href={`/blog/${post.slug}`}>
									<Card className="card hover:shadow-2xl transition-shadow duration-500 bg-white dark:bg-gray-800 text-black dark:text-white">
										<CardHeader className="p-0">
											<Image
												src={post.image}
												alt={post.title}
												width={800}
												height={400}
												className="w-full h-48 object-cover rounded-t-lg"
											/>
										</CardHeader>
										<CardContent className="p-6">
											<CardTitle className="text-2xl font-bold mb-2 text-black dark:text-white">
												{post.title}
											</CardTitle>
											<p className="text-gray-600 dark:text-gray-400 mb-4">
												{post.date}
											</p>
											<div className="flex flex-wrap gap-2 mb-4">
												{post.tags.map((tag) => (
													<Link key={tag} href={`/tags/${tag}`}>
														<Badge variant="outline" className="cursor-pointer">
															{tag}
														</Badge>
													</Link>
												))}
											</div>
											<p className="text-gray-700 dark:text-gray-300 mb-4">
												{post.summary}
											</p>
											<Button className="flex items-center">
												Read more <FaArrowRight className="ml-2" />
											</Button>
										</CardContent>
									</Card>
								</Link>
							</motion.div>
						))
					) : (
						<p>No posts found.</p>
					)}
				</div>
			</motion.article>
		</div>
	);
}
