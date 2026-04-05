import { BackendService } from "@/lib/server";
import { BlogPageContent } from "@/components/BlogPageContent";
import { Metadata } from 'next';
import { getConfig } from '@/lib/config';

const siteUrl = getConfig().site.url;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles about software engineering, data science, and technology',
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    type: 'website',
    title: 'Blog - Wyatt Walsh',
    description: 'Articles about software engineering, data science, and technology',
    url: `${siteUrl}/blog`,
    siteName: 'Wyatt Walsh',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Wyatt Walsh',
    description: 'Articles about software engineering, data science, and technology',
  },
};

type BlogPostsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

function normalizeQueryParam(query?: string | string[]): string {
  if (Array.isArray(query)) {
    return query[0] ?? '';
  }

  return query ?? '';
}

export default async function BlogPostsPage({ searchParams }: BlogPostsPageProps) {
  await BackendService.ensurePreprocessed();
  const instance = BackendService.getInstance();
  const [{ q }, posts, tags] = await Promise.all([
    searchParams,
    instance.getPostSummaries(),
    instance.getAllTags(),
  ]);

  return (
    <BlogPageContent
      posts={posts}
      tags={tags}
      initialQuery={normalizeQueryParam(q)}
    />
  );
}
