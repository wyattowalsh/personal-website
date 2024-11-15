// app/blog/layout.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="container mx-auto p-4 md:p-8">
			<div className="mb-4">
				<Link href="/">
					<Button variant="outline">← Back to Home</Button>
				</Link>
			</div>
			{children}
		</main>
	);
}
