// app/blog/layout.tsx

import React from "react";
import BlogTitle from "@/components/BlogTitle";

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<main className="min-h-screen mx-auto p-4 sm:p-6 lg:p-8 max-w-[100ch] lg:max-w-[110ch] xl:max-w-[120ch] 2xl:max-w-[130ch]">
				<BlogTitle />
				<hr />
				{children}
			</main>
		</>
	);
}
