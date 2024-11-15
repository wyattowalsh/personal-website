// components/PostPage.tsx

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import Giscus from "@giscus/react";
import {
	FacebookShareButton,
	TwitterShareButton,
	LinkedinShareButton,
	FacebookIcon,
	TwitterIcon,
	LinkedinIcon,
} from "react-share";

interface Post {
	slug: string;
	title: string;
	date: string;
	tags: string[];
	summary: string;
	content?: string;
	image?: string;
	caption?: string;
	updated?: string;
	readingTime: string;
}

interface PostPageProps {
	post: Post;
	mdxSource: MDXRemoteSerializeResult;
	components: any;
}

const PostPage = ({ post, mdxSource, components }: PostPageProps) => {
	const url = `https://yourdomain.com/blog/${post.slug}`;
	return (
		<article className="prose dark:prose-invert mx-auto my-12 px-4">
			<header className="mb-8">
				<h1 className="text-5xl font-extrabold mb-4">{post.title}</h1>
				<div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400">
					{post.date && (
						<time dateTime={post.date}>
							{formatDate(post.date, "en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</time>
					)}
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
					<Image
						src={post.image}
						alt={post.title}
						width={800}
						height={400}
						style={{ width: "100%", height: "auto" }}
						priority
					/>
					{post.caption && (
						<p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
							{post.caption}
						</p>
					)}
				</div>
			)}
			<MDXRemote {...mdxSource} components={components} />
			<div className="my-8">
				<h3 className="text-xl font-semibold mb-4">Share this post:</h3>
				<div className="flex space-x-4">
					<TwitterShareButton url={url} title={post.title}>
						<TwitterIcon size={32} round />
					</TwitterShareButton>
					<FacebookShareButton url={url} quote={post.title}>
						<FacebookIcon size={32} round />
					</FacebookShareButton>
					<LinkedinShareButton url={url} title={post.title}>
						<LinkedinIcon size={32} round />
					</LinkedinShareButton>
				</div>
			</div>
			<div className="mt-12">
				<Giscus
					repo="yourusername/your-repo"
					repoId="your-repo-id"
					category="General"
					categoryId="your-category-id"
					mapping="pathname"
					reactionsEnabled="1"
					emitMetadata="1"
					inputPosition="bottom"
					theme="preferred_color_scheme"
					lang="en"
					loading="lazy"
				/>
			</div>
		</article>
	);
};

export default PostPage;
