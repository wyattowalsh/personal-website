// app/blog/page.tsx

import { getSortedPostsData, getAllTags } from "@/lib/posts";
import BlogPageClient from "./BlogPageClient";

export default async function BlogPage() {
	const { posts: allPosts } = getSortedPostsData({});
	const tags = await getAllTags();

	return <BlogPageClient allPosts={allPosts} tags={tags} />;
}
