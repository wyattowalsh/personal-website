import React from "react";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostLayout } from "@/components/PostLayout";
import { getPostBySlug } from "@/lib/posts";
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { slug: string }
  children: React.ReactNode
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: post.title,
    description: post.summary,
    authors: [{ name: "Wyatt Walsh" }],
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: ['Wyatt Walsh'],
      images: [
        {
          url: post.image || 'https://w4w.dev/opengraph.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
        ...previousImages,
      ],
    },
  };
}

export default function PostsLayout({ children }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </div>
  );
}
