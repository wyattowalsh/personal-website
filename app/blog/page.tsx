import { BackendService, backend } from "@/lib/server";
import BlogPageContent from "@/components/BlogPageContent";
import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev';

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
  const posts = await backend.getAllPosts();
  const tags = await backend.getAllTags();

  const validPosts = posts.filter(post =>
    post && post.title && post.slug && post.created && post.tags
  );

  return <BlogPageContent posts={validPosts} tags={tags} />;
}
