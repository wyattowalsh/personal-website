import { getAllPostSlugs, getPostData } from "@/lib/posts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { components } from "@/components/MDXComponents";

interface BlogPostProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map(({ params }) => params);
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
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

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = params;
  const post = await getPostData(slug);
  if (!post) {
    notFound();
  }
  return (
    <div className="prose mx-auto dark:prose-dark">
      <h1>{post.title}</h1>
      <MDXRemote source={post.content} components={components} />
    </div>
  );
}
