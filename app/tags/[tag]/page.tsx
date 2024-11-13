// app/tags/[tag]/page.tsx

import { getPostsByTag, getAllTags } from "@/lib/posts";
import { notFound } from "next/navigation";
import BlogList from "@/components/BlogList";
import type { Metadata } from "next";

interface TagPageProps {
	params: { tag: string };
}

export async function generateStaticParams() {
	const tags = await getAllTags();
	return tags.map((tag) => ({
		tag,
	}));
}

export async function generateMetadata({
	params,
}: TagPageProps): Promise<Metadata> {
	const { tag } = params;
	return {
		title: `Posts tagged with "${tag}"`,
		description: `All posts tagged with "${tag}"`,
	};
}

export default async function TagPage({ params }: TagPageProps) {
	const { tag } = params;
	const posts = await getPostsByTag(tag);

	if (!posts || posts.length === 0) {
		notFound();
	}

	return (
		<div className="prose mx-auto">
			<h1 className="text-5xl font-bold text-center mb-8">
				Posts tagged with "{tag}"
			</h1>
			<BlogList posts={posts} />
		</div>
	);
}
