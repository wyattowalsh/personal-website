import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export const metadata = {
	title: "dev, tech, startups, data",
};

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="min-h-screen flex flex-col items-center p-4 sm:p-8 md:p-24">
			<div className="absolute top-4 left-4 sm:top-8 sm:left-8">
				<Link href="/blog">
					<Button className="text-gray-900 dark:text-gray-100">
						← Back to Blog
					</Button>
				</Link>
			</div>
			{children}
		</main>
	);
}
