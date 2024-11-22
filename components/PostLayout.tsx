"use client";

import React, { Suspense, createContext, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import PostHeader from "@/components/PostHeader";
import PostPagination from "@/components/PostPagination";
import Comments from "@/components/Comments";
import { usePathname } from "next/navigation";
import { ArticleJsonLd, NextSeo } from 'next-seo';

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

	return (
		<EquationContext.Provider value={{ count: equationCount, increment: incrementCount }}>
			<article className="space-y-8 max-w-none w-full overflow-x-hidden">
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
			<NextSeo
				title={frontmatter.title}
				description={frontmatter.summary}
				canonical={`https://w4w.dev${pathname}`}
				openGraph={{
					type: 'article',
					title: frontmatter.title,
					description: frontmatter.summary,
					url: `https://w4w.dev${pathname}`,
					article: {
						publishedTime: frontmatter.date,
						modifiedTime: frontmatter.updated || frontmatter.date,
						authors: ['Wyatt Walsh'],
						tags: frontmatter.tags,
					},
					images: [{
						url: frontmatter.image || 'https://w4w.dev/opengraph.png',
						width: 1200,
						height: 630,
						alt: frontmatter.title,
					}]
				}}
			/>
			<ArticleJsonLd
				useAppDir={true}
				url={`https://w4w.dev${pathname}`}
				title={frontmatter.title}
				images={[frontmatter.image || 'https://w4w.dev/opengraph.png']}
				datePublished={frontmatter.date}
				dateModified={frontmatter.updated || frontmatter.date}
				authorName="Wyatt Walsh"
				description={frontmatter.summary}
				isAccessibleForFree={true}
				publisherName="W4W"
				publisherLogo="https://w4w.dev/logo.webp"
			/>
		</EquationContext.Provider>
	);
}
