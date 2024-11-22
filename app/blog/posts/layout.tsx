import { BlogJsonLd } from 'next-seo';
import React from "react";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostLayout } from "@/components/PostLayout";

export default function PostsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<BlogJsonLd
				url="https://w4w.dev/blog"
				title="W4W Blog"
				images={[
					'https://w4w.dev/opengraph.png'
				]}
				datePublished="2023-01-01T00:00:00.000Z"
				dateModified="2024-01-01T00:00:00.000Z"  
				authorName="Wyatt Walsh"
				description="Personal blog covering technology, software engineering, and more."
			/>
			<Suspense fallback={<LoadingSpinner />}>
				<PostLayout>{children}</PostLayout>
			</Suspense>
		</div>
	);
}
