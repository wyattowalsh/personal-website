"use client";

import React, { Suspense, createContext, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import PostHeader from "@/components/PostHeader";
import PostPagination from "@/components/PostPagination";
import Comments from "@/components/Comments";
import { usePathname } from "next/navigation";

// Create context for equation numbering
export const EquationContext = createContext({ count: 0, increment: () => {} });

interface PostMetadata {
  title: string;
  summary: string;
  date: string;
  updated?: string;
  tags: string[];
  image?: string;
  caption?: string;
}

export function PostLayout({ children, frontmatter }: { children: React.ReactNode, frontmatter: PostMetadata }) {
	const [equationCount, setEquationCount] = React.useState(0);
	const pathname = usePathname();

	// Reset equation counter when pathname changes
	useEffect(() => {
		setEquationCount(0);
	}, [pathname]);

	const incrementCount = React.useCallback(() => {
		setEquationCount(prev => prev + 1);
	}, []);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: frontmatter.title,
		description: frontmatter.summary,
		image: frontmatter.image || 'https://w4w.dev/opengraph.png',
		datePublished: frontmatter.date,
		dateModified: frontmatter.updated || frontmatter.date,
		author: {
			'@type': 'Person',
			name: 'Wyatt Walsh',
			url: 'https://w4w.dev'
		}
	};

	return (
		<EquationContext.Provider value={{ count: equationCount, increment: incrementCount }}>
			<article className="space-y-8 max-w-none w-full overflow-x-hidden">
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
				<PostHeader 
					title={frontmatter.title}
					date={frontmatter.date}
					updated={frontmatter.updated}
					image={frontmatter.image}
					caption={frontmatter.caption}
				/>
				<hr />
				<div className="prose prose-lg max-w-none">
					<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
				</div>
				<hr />
				<PostPagination />
				<hr />
				<Comments />
			</article>
		</EquationContext.Provider>
	);
}
