"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("");

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
            timeLimit = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        } else if (selectedTimePeriod === "Past Month") {
            timeLimit = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        } else if (selectedTimePeriod === "Past Week") {
            timeLimit = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        }

        filteredPosts = filteredPosts.filter(
            (post) => new Date(post.date) >= timeLimit
        );
    }

    return (
        <div className="prose mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center mb-8 space-y-4">
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                            className="cursor-pointer"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <motion.div
                            key={post.slug}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link href={`/blog/${post.slug}`}>
                                <Card className="hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                                    {post.image && (
                                        <CardHeader className="p-0 relative">
                                            <Image
                                                src={post.image}
                                                alt={post.title}
                                                width={800}
                                                height={400}
                                                className="w-full h-48 object-cover"
                                            />
                                        </CardHeader>
                                    )}
                                    <CardContent className="p-4">
                                        <CardTitle className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                            {post.title}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {post.date}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {post.tags.map((tag) => (
                                                <Badge key={tag} variant="outline">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                                            {post.summary}
                                        </p>
                                        <Button className="w-full justify-center">
                                            Read more
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No posts found.</p>
                )}
            </div>
        </div>
    );
}
