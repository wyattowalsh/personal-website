// app/blog/layout.tsx

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export const metadata = {
	title: "w4w.dev Blog — Development, Technology, Startups, and More",
};

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="min-h-screen flex flex-col items-center p-4 sm:p-8 md:p-24">
			<div className="absolute top-4 left-4 sm:top-8 sm:left-8">
				<Link href="/">
					<Button>← Back to Home</Button>
				</Link>
			</div>
			{children}
		</main>
	);
}
