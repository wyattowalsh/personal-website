import { notFound } from "next/navigation";
import PostLayout from "@/components/PostLayout";

interface BlogPostPageProps {
	params: { slug: string };
}

export async function generateStaticParams() {
	// Replace with actual logic to get all slugs
	const slugs = []; // Replace with actual slugs fetching logic
	return slugs.map((slug) => ({ slug }));
}

export default function PostPage({ params }: BlogPostPageProps) {
	const { slug } = params;
	// Fetch post data from your own data source
	const post = {}; // Replace with actual post fetching logic
	if (!post) {
		notFound();
	}
	const MDXContent = {}; // Replace with actual MDX content fetching logic

	const posts = []; // Replace with actual posts fetching logic
	const currentIndex = posts.findIndex((p) => p.slug === slug);
	const prevPost = posts[currentIndex - 1] || null;
	const nextPost = posts[currentIndex + 1] || null;

	return (
		<PostLayout post={post} prevPost={prevPost} nextPost={nextPost}>
			<MDXContent />
		</PostLayout>
	);
}
