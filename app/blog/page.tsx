// app/blog/page.tsx

import { getSortedPostsData, Post } from "@/lib/posts";
import BlogList from "@/components/BlogList";

export default async function BlogPage() {
	const blogPosts: Post[] = await getSortedPostsData();

	return <BlogList posts={blogPosts} />;
}
