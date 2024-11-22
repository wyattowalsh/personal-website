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

interface PostLayoutProps {
	children: React.ReactNode;
  meta: {
    title: string;
    description: string;
    date: string;
    lastModified: string;
    tags: string[];
    image: string;
  };
}

export function PostLayout({ children, meta }: PostLayoutProps) {
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
				<PostHeader />
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
        title={meta?.title}
        description={meta?.description}
        canonical={`https://w4w.dev${pathname}`}
        openGraph={{
          type: 'article',
          title: meta?.title,
          description: meta?.description,
          url: `https://w4w.dev${pathname}`,
          article: {
            publishedTime: meta?.date,
            modifiedTime: meta?.lastModified,
            authors: ['Wyatt Walsh'],
            tags: meta?.tags,
          },
          images: [
            {
              url: meta?.image || 'https://w4w.dev/opengraph.png',
              width: 1200,
              height: 630,
              alt: meta?.title,
            }
          ]
        }}
      />
      <ArticleJsonLd
        useAppDir={true}
        url={`https://w4w.dev${pathname}`}
        title={meta?.title || ''}
        images={[meta?.image || 'https://w4w.dev/opengraph.png']}
        datePublished={meta?.date || ''}
        dateModified={meta?.lastModified || meta?.date || ''}
        authorName="Wyatt Walsh"
        description={meta?.description || ''}
        isAccessibleForFree={true}
        publisherName="W4W"
        publisherLogo="https://w4w.dev/logo.webp"
      />
		</EquationContext.Provider>
	);
}
