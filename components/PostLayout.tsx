import React, { Suspense } from "react";
import PostHeader from "@/components/PostHeader";
import PostPagination from "@/components/PostPagination";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { PostMetadata } from "@/lib/posts";
import { Comments } from "./Comments";

interface PostLayoutProps {
	children: React.ReactNode;
}

export function PostLayout({ children }: PostLayoutProps) {
	return (
		<article className="space-y-8">
			<PostHeader />
			<hr />
			<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
			<hr />
			<PostPagination />
			<hr />
			<Comments />
		</article>
	);
}
