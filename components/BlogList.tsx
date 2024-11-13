"use client";

import { motion } from "framer-motion";
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
import Link from "next/link";
import type { Post } from "@/lib/posts";
import { useState } from "react";
import Fuse from "fuse.js";
import { FaArrowRight } from "react-icons/fa";

export default function BlogList({ posts }: { posts: Post[] }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [selectedTimePeriod, setSelectedTimePeriod] = useState("All time");

	const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

	const timePeriods = ["All time", "Past Year", "Past Month", "Past Week"];

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
					className="text-center mb-12 text-6xl font-extrabold underline"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1 }}
				>
					<span
						className="
      font-extrabold text-transparent bg-clip-text 
      bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 
      drop-shadow-2xl
      font-tech animate-glitch
    "
					>
						w4w.dev
					</span>
					<span
						className="
      text-red-500 drop-shadow-md 
      font-handwritten animate-pulse text-6xl
    "
					>
					 blog
					</span>
				</motion.h1>

				{/* Background Animation */}
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
					<motion.div
						className="absolute rounded-full"
						style={{
							background: `radial-gradient(circle, rgba(106, 159, 181, 0.2) 0%, rgba(106, 159, 181, 0) 70%)`,
							width: "200px",
							height: "200px",
							left: "50%",
							top: "50%",
							transform: "translate(-50%, -50%)",
						}}
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.3, 0.5, 0.3],
							x: [0, 25, 0],
							y: [0, 25, 0],
						}}
						transition={{
							duration: 10,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				</motion.div>
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
						{/* Tags */}
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
				{/* Blog Posts */}
				<div className="mt-8 grid gap-6 md:grid-cols-2">
					{filteredPosts.length > 0 ? (
						filteredPosts.map((post) => (
							<motion.div
								key={post.slug}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="card-container"
							>
								<Link href={`/blog/${post.slug}`} className="no-underline">
									<Card className="card hover:shadow-2xl transition-shadow duration-500 bg-white dark:bg-gray-800 text-black dark:text-white">
										<CardHeader className="p-0">
											{post.image && (
												<Image
													src={post.image}
													alt={post.title}
													width={800}
													height={400}
													className="w-full h-48 object-cover rounded-t-lg"
													priority
												/>
											)}
										</CardHeader>
										<CardContent className="p-6">
											<CardTitle className="text-2xl font-bold mb-2 text-black dark:text-white no-underline">
												{post.title}
											</CardTitle>
											<p className="text-gray-600 dark:text-gray-400 mb-4">
												{post.date}
											</p>
											<p className="text-gray-600 dark:text-gray-400 mb-4">
												{post.author}
											</p>
											<div className="flex flex-wrap gap-2 mb-4">
												{post.tags?.map((tag) => (
													<Link key={tag} href={`/tags/${tag}`}>
														<Badge variant="outline" className="cursor-pointer">
															{tag}
														</Badge>
													</Link>
												)) ?? <p>No tags available</p>}
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
