'use client';

import { LRUCache } from 'lru-cache';
import { Metadata } from 'next';
import { getPostBySlug, PostMetadata } from './posts';
import { links } from '@/components/Links';

// Removed import of package.json
// import pkg from '../package.json'

const metadataCache = new LRUCache<string, Metadata>({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
  updateAgeOnGet: true,
  updateAgeOnHas: true
});

// Add utility function for sorting tags
function sortTags(tags: string[]): string[] {
  return [...tags].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

// Add new metadata validation
const validateMetadata = (metadata: Partial<Metadata>): boolean => {
  if (!metadata.title || !metadata.description) {
    return false
  }
  return true
}

// Add type guard function
function isPostMetadata(metadata: Metadata | PostMetadata): metadata is PostMetadata {
  return 'summary' in metadata && 'slug' in metadata;
}

// Update getPostMetadata to ensure it returns PostMetadata
export async function getPostMetadata(slug: string): Promise<PostMetadata> {
  const cacheKey = `metadata:${slug}`
  
  try {
    // Check cache first
    const cached = metadataCache.get(cacheKey)
    if (cached && isPostMetadata(cached)) {
      return cached as PostMetadata
    }

    // Fetch fresh metadata
    const metadata = await getPostBySlug(slug)
    if (!metadata) {
      throw new Error(`No metadata found for slug: ${slug}`)
    }

    // Validate and cache
    if (validateMetadata(metadata)) {
      metadataCache.set(cacheKey, metadata)
      return metadata
    }

    throw new Error(`Invalid metadata for slug: ${slug}`)
  } catch (error) {
    console.error(`Error fetching metadata for ${slug}:`, error)
    throw error
  }
}

export async function getAdjacentPosts(slug: string) {
  try {
    const response = await fetch(`/api/blog/posts/metadata/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch metadata');
    
    const { metadata } = await response.json();
    if (!metadata?.adjacent) return { prevPost: null, nextPost: null };

    return {
      prevPost: metadata.adjacent.prev,
      nextPost: metadata.adjacent.next
    };
  } catch (error) {
    console.error('Error in getAdjacentPosts:', error);
    return { prevPost: null, nextPost: null };
  }
}

export interface PageSEO {
  title: string
  description: string
  openGraph?: {
    title: string
    description: string
    type?: string
    url?: string
    images?: {
      url: string
      width?: number
      height?: number
      alt?: string
    }[]
  }
  twitter?: {
    card: "summary" | "summary_large_image"
    title: string
    description: string
    images?: string[]
    creator?: string
  }
}

// Update getBlogPostMetadata to handle possible undefined values
export async function getBlogPostMetadata(slug: string): Promise<Metadata> {
  const post = await getPostMetadata(slug)
  if (!post) return {}

  return {
    title: `${post.title} | Wyatt Walsh`,
    description: post.summary || `${post.title} - Read more on Wyatt Walsh's blog`,
    keywords: [...(post.tags || []), 'blog', 'article', 'Wyatt Walsh'],
    authors: [{ 
      name: 'Wyatt Walsh',
      url: 'https://w4w.dev'
    }],
    openGraph: {
      title: post.title,
      description: post.summary || '',
      type: 'article',
      publishedTime: post.created,
      modifiedTime: post.updated || post.created,
      authors: ['Wyatt Walsh'],
      tags: post.tags,
      images: post.image ? [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.caption || post.title
        }
      ] : [],
    },
    twitter: {
      card: post.image ? 'summary_large_image' : 'summary',
      title: post.title,
      description: post.summary || '',
      images: post.image ? [post.image] : [],
      creator: '@wyattowalsh',
      site: '@wyattowalsh'
    }
  }
}

export function getDefaultMetadata(): Metadata {
  const socialLinks = links.filter(link => !link.url.startsWith('/'))
  const currentYear = new Date().getFullYear()
  
  return {
    metadataBase: new URL('https://w4w.dev'),
    title: {
      default: 'Wyatt Walsh',
      template: '%s | Wyatt Walsh',
      absolute: 'Wyatt Walsh - Software Engineer & Data Scientist'
    },
    description: 'Personal website and blog by Wyatt Walsh, featuring articles about software engineering, data science, and technology.',
    applicationName: 'personal-website',
    authors: [{ 
      name: 'Wyatt Walsh',
      url: 'https://w4w.dev'
    }],
    generator: 'Next.js',
    keywords: [
      'Wyatt Walsh',
      'Software Engineering',
      'Web Development',
      'Data Science',
      'Machine Learning',
      'Artificial Intelligence',
      'Blog',
      'Next.js',
      'React',
      'TypeScript',
      'JavaScript',
      'Python'
    ],
    referrer: 'origin-when-cross-origin',
    creator: 'Wyatt Walsh',
    publisher: 'Wyatt Walsh',
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', type: 'image/png' },
      ],
    },
    manifest: '/manifest.json',
    openGraph: {
      type: 'website',
      siteName: 'Wyatt Walsh',
      title: 'Wyatt Walsh',
      description: 'Personal website and blog by Wyatt Walsh',
      url: 'https://w4w.dev',
      determiner: 'auto',
      locale: 'en_US',
      alternateLocale: ['en_GB'],
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Wyatt Walsh',
          type: 'image/png',
          secureUrl: 'https://w4w.dev/og-image.png',
        },
        {
          url: '/og-image-alt.png',
          width: 1200,
          height: 630,
          alt: 'Wyatt Walsh - Alternative',
        }
      ],
      countryName: 'USA',
      emails: ['mail@w4w.dev'],
      phoneNumbers: [],
      faxNumbers: [],
      audio: [],
      videos: [],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@wyattowalsh',
      creator: '@wyattowalsh',
      title: 'Wyatt Walsh',
      description: 'Software Engineer & Data Scientist',
      images: {
        url: '/twitter-image.png',
        alt: 'Wyatt Walsh Twitter Card',
        width: 1200,
        height: 630,
      }
    },
    verification: {
      me: ['mail@w4w.dev'],
    },
    alternates: {
      canonical: 'https://w4w.dev',
      languages: {
        'en-US': 'https://w4w.dev',
      },
      media: {
        'only screen and (max-width: 640px)': 'https://m.w4w.dev'
      },
      types: {
        'application/rss+xml': 'https://w4w.dev/feed.xml',
      },
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
      userScalable: true,
      viewportFit: 'cover',
    },
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: true,
      url: true
    },
    appleWebApp: {
      capable: true,
      title: 'Wyatt Walsh',
      statusBarStyle: 'black-translucent',
      startupImage: [
        '/logo.webp',
        '/logo.webp'
      ]
    },
    appLinks: {
      ios: {
        url: 'https://w4w.dev',
        app_store_id: ''
      },
      android: {
        package: '',
        app_name: 'w4w'
      },
      web: {
        url: 'https://w4w.dev',
        should_fallback: true
      }
    },
    archives: [`https://w4w.dev/blog`],
    assets: ['/assets/images/*'],
    bookmarks: ['https://w4w.dev/blog'],
    category: 'technology',
    classification: 'Blog',
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black',
      'apple-mobile-web-app-title': 'Wyatt Walsh',
      'format-detection': 'telephone=no',
      'msapplication-TileColor': '#000000',
      'msapplication-config': '/browserconfig.xml',
      'theme-color': '#000000',
      custom: 'value',
      version: '0.1.0',
      'social-urls': socialLinks.map(link => link.url),
      'social-platforms': socialLinks.map(link => link.name.toLowerCase()),
      'social-colors': socialLinks.map(link => link.color)
    }
  }
}

interface SiteMetadata {
  website: any;
  default: any;
  generated: string;
  ttl: number;
}
