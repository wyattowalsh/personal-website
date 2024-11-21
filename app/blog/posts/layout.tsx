import React, { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostLayout } from "@/components/PostLayout";

export default function PostsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<Suspense fallback={<LoadingSpinner />}>
				<PostLayout>{children}</PostLayout>
			</Suspense>
		</div>
	);
}
