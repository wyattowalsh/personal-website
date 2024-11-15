import { Metadata } from "next";
import { getPostData, getAllPostSlugs } from "@/lib/posts";
import MDXComponents from "@/components/MDXComponents";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import PostPage from "@/components/PostPage";

interface PostPageProps {
	params: { slug: string };
}

export async function generateStaticParams() {
	const slugs = getAllPostSlugs();

	return slugs.map((slug) => ({
		slug,
	}));
}

export async function generateMetadata({
	params,
}: PostPageProps): Promise<Metadata> {
	const post = await getPostData(params.slug);

	return {
		title: post.title,
		description: post.summary,
		openGraph: {
			images: post.image,
		},
	};
}

const BlogPostPage = async ({ params }: PostPageProps) => {
	const post = await getPostData(params.slug);
	const mdxSource = await serialize(post.content, {
		mdxOptions: {
			remarkPlugins: [],
			rehypePlugins: [],
		},
	});

	return (
		<PostPage post={post} mdxSource={mdxSource} components={MDXComponents} />
	);
};

export default BlogPostPage;
