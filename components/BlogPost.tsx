// components/BlogPost.tsx

import { motion } from "framer-motion";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { components } from "@/components/MDXComponents";
import type { Post } from "@/lib/posts";

export default function BlogPost({ post }: { post: Post }) {
	return (
		<motion.article
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
			className="prose dark:prose-invert fade-in mx-auto"
		>
			<header className="mb-8">
				<h1 className="text-5xl font-bold mb-4">{post.title}</h1>
				<p className="text-gray-600 flex items-center mb-4">{post.date}</p>
				<div className="flex flex-wrap gap-2">
					{post.tags.map((tag) => (
						<Badge key={tag} variant="outline" className="cursor-pointer">
							{tag}
						</Badge>
					))}
				</div>
			</header>
			{post.image && (
				<Image
					src={post.image}
					alt={post.title}
					width={800}
					height={400}
					className="w-full h-auto object-cover rounded-lg mb-8"
				/>
			)}
			{/* Render the compiled MDX content */}
			<MDXRemote {...post.content} components={components} />
		</motion.article>
	);
}
