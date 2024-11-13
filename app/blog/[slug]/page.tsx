import { getAllPostSlugs, getPostData } from "@/lib/posts";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { components } from "@/components/MDXComponents";
import dynamic from "next/dynamic";

interface BlogPostProps {
	params: { slug: string };
}

export async function generateStaticParams() {
	const slugs = await getAllPostSlugs();
	return slugs.map(({ params }) => params);
}

export async function generateMetadata({
	params,
}: BlogPostProps): Promise<Metadata> {
	const { slug } = params;
	const post = await getPostData(slug);
	if (!post) {
		return {};
	}
	return {
		title: post.title,
		description: post.summary,
	};
}

const MDXContent = dynamic(({ params }) => import(`@/posts/${params.slug}/index.mdx`));

export default async function BlogPostPage({ params }: BlogPostProps) {
	const { slug } = params;
	const post = await getPostData(slug);

	if (!post) {
		notFound();
	}

	return (
		<article className="prose dark:prose-invert fade-in mx-auto">
			<h1 className="text-5xl font-bold mb-4">{post.title}</h1>
			<p className="text-gray-600 flex items-center mb-4">
				Posted on {post.datePosted}
				{post.dateUpdated && post.dateUpdated !== post.datePosted && (
					<span className="ml-2">(Updated on {post.dateUpdated})</span>
				)}
			</p>
			{post.image && (
				<img
					src={post.image}
					alt={post.title}
					className="w-full h-auto object-cover rounded-lg mb-8"
				/>
			)}
			<MDXContent params={params} components={components} />
		</article>
	);
}
