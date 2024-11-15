// components/SearchBar.tsx

"use client";

import React, { useState } from "react";
import Fuse from "fuse.js";
import { Post } from "@/lib/posts";
import PostCard from "./PostCard";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
	posts: Post[];
}

const SearchBar = ({ posts }: SearchBarProps) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Post[]>(posts);

	const fuse = new Fuse(posts, {
		keys: ["title", "summary", "content", "tags"],
		threshold: 0.3,
	});

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const q = e.target.value;
		setQuery(q);
		if (q.trim()) {
			const searchResults = fuse.search(q).map(({ item }) => item);
			setResults(searchResults);
		} else {
			setResults(posts);
		}
	};

	return (
		<div>
			<div className="mb-6">
				<Input
					type="text"
					className="w-full p-4 text-lg"
					placeholder="Search posts..."
					value={query}
					onChange={handleSearch}
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{results.length > 0 ? (
					results.map((post) => <PostCard key={post.slug} post={post} />)
				) : (
					<p className="text-center text-gray-500">No results found.</p>
				)}
			</div>
		</div>
	);
};

export default SearchBar;
