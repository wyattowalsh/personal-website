import { Metadata } from 'next';
import { getConfig } from './core';
import { generateArticleSchema, generateBreadcrumbSchema } from './schema';
import type { Post } from './core';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev';

export interface PostMetadataOptions {
  post: Post;
  slug: string;
}

/**
 * Generate complete metadata for a blog post including:
 * - Title and description
 * - Canonical URL
 * - OpenGraph metadata
 * - Twitter card metadata
 * - JSON-LD structured data
 */
export function generatePostMetadata({ post, slug }: PostMetadataOptions): Metadata {
  const config = getConfig();
  const postUrl = `${siteUrl}/blog/posts/${slug}`;
  const ogImage = post.image 
    ? (post.image.startsWith('http') ? post.image : `${siteUrl}${post.image}`)
    : `${siteUrl}/opengraph.png`;

  return {
    title: post.title,
    description: post.summary || config.site.description,
    authors: [{ name: config.site.author.name }],
    creator: config.site.author.name,
    publisher: config.site.author.name,
    
    // Canonical URL
    alternates: {
      canonical: postUrl,
    },

    // OpenGraph metadata
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary || config.site.description,
      url: postUrl,
      siteName: config.site.title,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.created,
      modifiedTime: post.updated || post.created,
      authors: [config.site.author.name],
      tags: post.tags,
    },

    // Twitter card metadata
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || config.site.description,
      images: [ogImage],
      creator: `@${config.site.author.twitter}`,
    },

    // Robots directives
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Keywords from tags
    keywords: post.tags,
  };
}

/**
 * Generate JSON-LD structured data for a blog post
 */
export function generatePostStructuredData(post: Post, slug: string): string {
  const postUrl = `${siteUrl}/blog/posts/${slug}`;
  
  const articleSchema = generateArticleSchema(post, { baseUrl: siteUrl });
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' },
    { name: post.title, item: `/blog/posts/${slug}` },
  ], siteUrl);

  return JSON.stringify([articleSchema, breadcrumbSchema]);
}
