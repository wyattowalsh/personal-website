"use client";

import React, { Suspense, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostLayout } from "@/components/PostLayout";
import { MathProvider } from "@/components/MathContext";
import { cn } from "@/lib/utils";
import CustomScrollbars from "@/components/Scroll";


type Props = {
	children: React.ReactNode;
};

function PostContent({ children }: { children: React.ReactNode }) {
	// Add hydration marker
	useEffect(() => {
		document.documentElement.setAttribute("data-math-hydrated", "true");
	}, []);

	return <>{children}</>;
}

export default function PostsLayout({ children }: Props) {
	return (
		<div className="relative">
			<div className={cn(
				"max-w-5xl mx-auto", // Match PostHeader max-width
				"px-4 sm:px-6 lg:px-8", // Responsive padding for sides only
				"pb-8", // Only add padding to bottom, remove top padding
				"relative z-10"
			)}>
				<MathProvider>
					<Suspense fallback={<LoadingSpinner />}>
					<CustomScrollbars>
						<PostLayout>
							<PostContent>{children}</PostContent>
						</PostLayout>
						</CustomScrollbars>
					</Suspense>
				</MathProvider>
			</div>
		</div>
	);
}
