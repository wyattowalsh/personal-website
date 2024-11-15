// app/blog/page.tsx

import { getAllPosts, getAllPostSlugs } from "@/lib/posts";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

export default async function BlogPage() {
	const posts = await getAllPosts();

	return (
		<div className="container mx-auto py-8 px-4">
			<h1 className="text-5xl font-extrabold mb-6 text-center">onelonedatum blog</h1>
			<SearchBar posts={posts} />
			<div>
				{posts.map((post) => (
					<Link key={post.slug} href={`/blog/${post.slug.join("/")}`}>
						<a>{post.title}</a>
					</Link>
				))}
			</div>
		</div>
	);
}
