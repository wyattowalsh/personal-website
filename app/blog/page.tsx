import { BackendService } from "@/lib/server";
import BlogPageContent from "@/components/BlogPageContent";
import { Metadata } from 'next';
import { getConfig } from '@/lib/core';

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

export default async function BlogPostsPage() {
  await BackendService.ensurePreprocessed();
  const instance = BackendService.getInstance();
  const posts = await instance.getAllPosts();
  const tags = await instance.getAllTags();

  return <BlogPageContent posts={posts.map(({ content: _content, ...meta }) => meta)} tags={tags} />;
}
