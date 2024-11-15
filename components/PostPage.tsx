import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import MDXComponents from "@/components/MDXComponents";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface Post {
	slug: string;
	title: string;
	date: string;
	tags: string[];
	summary: string;
	content?: string;
	image: string;
	caption?: string;
	updated: string;
	readingTime: string;
}

interface PostPageProps {
	post: Post;
	mdxSource: MDXRemoteSerializeResult;
	components: any;
}

const PostPage = ({ post, mdxSource, components }: PostPageProps) => {
	return (
		<article className="prose dark:prose-invert mx-auto my-12">
			<header className="mb-8">
				<h1 className="text-5xl font-extrabold mb-4">{post.title}</h1>
				<div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400">
					<time dateTime={post.date}>
						{formatDate(post.date, "en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</time>
					{post.updated && (
						<span className="mx-2">| Updated: {formatDate(post.updated)}</span>
					)}
					<span className="mx-2">| Reading Time: {post.readingTime}</span>
					{post.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-2">
							{post.tags.map((tag, index) => (
								<Link key={index} href={`/tags/${tag}`}>
									<span className="text-blue-600 hover:underline">#{tag}</span>
								</Link>
							))}
						</div>
					)}
				</div>
			</header>
			{post.image && (
				<div className="mb-8">
					<Image src={post.image} alt={post.title} width={800} height={400} layout="responsive" objectFit="cover" />
					{post.caption && (
						<p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">{post.caption}</p>
					)}
				</div>
			)}
			<MDXRemote {...mdxSource} components={components} />
		</article>
	);
};

export default PostPage;
