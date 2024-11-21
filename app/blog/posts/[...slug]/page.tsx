import { Metadata } from "next";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";

interface PageProps {
	params: {
		slug: string[];
	};
}

export async function generateStaticParams() {
	const posts = await getAllPosts();
	return posts.map((post) => ({
		slug: post.slug.split("/"),
	}));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const slug = params.slug.join("/");
	const post = await getPostBySlug(slug);

	if (!post) {
		return {
			title: "Post Not Found",
		};
	}

	return {
		title: post.title,
		description: post.summary,
	};
}

export default async function PostPage({ params }: PageProps) {
	const slug = params.slug.join("/");
	const post = await getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	return (
		<article className="container mx-auto px-4 py-8">
			<h1>{post.title}</h1>
			<div>{post.content}</div>
		</article>
	);
}
