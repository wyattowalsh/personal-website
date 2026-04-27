import { Metadata } from 'next';
import { getAbsoluteUrl, getConfig, getSiteIdentity } from './config';
import { generateArticleSchema, generateBreadcrumbSchema } from './schema';
import type { Post } from './types';

const siteUrl = getConfig().site.url;

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
  const identity = getSiteIdentity();
  const postUrl = getAbsoluteUrl(`/blog/posts/${slug}`);
  const ogImage = post.image 
    ? getAbsoluteUrl(post.image)
    : identity.ogImageUrl;

  return {
    title: post.title,
    description: post.summary || identity.description,
    authors: [{ name: identity.author.name, url: identity.url }],
    creator: identity.author.name,
    publisher: identity.author.name,
    
    // Canonical URL and feed discovery
    alternates: {
      canonical: postUrl,
      types: identity.feedAlternates,
    },

    // OpenGraph metadata
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary || identity.description,
      url: postUrl,
      siteName: identity.brandName,
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
      authors: [identity.author.name],
      section: post.tags[0],
      tags: post.tags,
    },

    // Twitter card metadata
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || identity.description,
      images: [ogImage],
      ...(identity.twitterHandle ? { creator: identity.twitterHandle } : {}),
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
  const articleSchema = generateArticleSchema(post, { baseUrl: siteUrl });
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' },
    { name: post.title, item: `/blog/posts/${slug}` },
  ], siteUrl);

  return JSON.stringify([articleSchema, breadcrumbSchema]);
}
