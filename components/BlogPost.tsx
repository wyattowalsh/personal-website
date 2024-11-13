import { motion } from "framer-motion";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { components } from "@/components/MDXComponents";
import type { Post } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BlogPostProps {
	post: Post;
	prevPost?: Post;
	nextPost?: Post;
}

const BlogPost = ({ post, prevPost, nextPost }: BlogPostProps) => {
	return (
		<motion.article
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
			className="prose dark:prose-invert fade-in mx-auto"
		>
			<header className="mb-8">
				<h1 className="text-5xl font-bold mb-4 no-underline">{post.title}</h1>
				<p className="text-gray-600 flex items-center mb-4">{post.date}</p>
				<div className="flex flex-wrap gap-2">
					{post.tags.map((tag) => (
						<Link key={tag} href={`/tags/${tag}`}>
							<Badge
								variant="outline"
								className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
							>
								{tag}
							</Badge>
						</Link>
					))}
				</div>
			</header>
			{post.image && (
				<Image
					src={post.image}
					alt={post.title}
					width={800}
					height={400}
					className="w-full h-auto object-cover rounded-lg mb-8 shadow-lg"
				/>
			)}
			<MDXRemote {...post.content} components={components} />
			<div className="flex justify-between mt-12">
				{prevPost && (
					<Link href={`/blog/${prevPost.slug}`}>
						<Button variant="outline">← {prevPost.title}</Button>
					</Link>
				)}
				{nextPost && (
					<Link href={`/blog/${nextPost.slug}`}>
						<Button variant="outline">{nextPost.title} →</Button>
					</Link>
				)}
			</div>
		</motion.article>
	);
};

export default BlogPost;
