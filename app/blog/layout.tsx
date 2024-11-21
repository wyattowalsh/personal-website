// app/blog/layout.tsx

import React from "react";
import ScrollIndicator from "@/components/ScrollIndicator";
import BlogTitle from "@/components/BlogTitle";

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<main className="min-h-screen mx-auto p-4 md:p-8">
				<BlogTitle />
				<hr />
				{children}
			</main>
		</>
	);
}
