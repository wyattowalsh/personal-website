import type { Post } from './types';
import { getConfig } from './core';
import { cache } from 'react';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface SchemaOptions {
  baseUrl?: string;
  images?: string[];
  tags?: string[];
  datePublished?: string;
  dateModified?: string;
}

// Cache the generation of the website schema
export const generateWebSiteSchema = cache(() => {
  const config = getConfig();
  const currentYear = new Date().getFullYear();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.site.title,
    alternateName: ['w4w', 'wyattowalsh'],
    url: config.site.url,
    description: config.site.description,
    author: {
      '@type': 'Person',
      name: config.site.author.name,
      url: config.site.url,
      email: config.site.author.email,
      sameAs: [
        `https://github.com/${config.site.author.github}`,
        `https://twitter.com/${config.site.author.twitter}`,
        `https://linkedin.com/in/${config.site.author.linkedin}`
      ]
    },
    publisher: {
      '@type': 'Organization',
      name: config.site.author.name,
      logo: {
        '@type': 'ImageObject',
        url: `${config.site.url}/logo.webp`
      }
    },
    copyrightYear: currentYear,
    copyrightHolder: {
      '@type': 'Person',
      name: config.site.author.name
    },
    inLanguage: 'en-US',
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    keywords: [
      'Software Engineering',
      'Web Development',
      'Technology',
      'Blog'
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.site.url}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
});

export function generateArticleSchema(post: Post, options?: SchemaOptions) {
  const config = getConfig();
  const baseUrl = options?.baseUrl || config.site.url;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.image ? [`${baseUrl}${post.image}`] : options?.images || [],
    datePublished: post.created,
    dateModified: post.updated || post.created,
    author: {
      '@type': 'Person',
      name: config.site.author.name,
      url: config.site.url
    },
    publisher: {
      '@type': 'Organization',
      name: config.site.author.name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.webp`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/posts/${post.slug}`,
    },
    keywords: post.tags,
    wordCount: post.wordCount,
    ...(post.readingTime ? { timeRequired: `PT${parseInt(post.readingTime)}M` } : {}),
    isAccessibleForFree: true,
    inLanguage: 'en-US',
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
  };
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[], baseUrl = getConfig().site.url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.item}`,
    })),
  };
}

export interface CollectionPageItem {
  name: string;
  url: string;
  image?: string;
  datePublished?: string;
}

export function generateCollectionPageSchema({
  name,
  description,
  url,
  items,
}: {
  name: string;
  description: string;
  url: string;
  items: CollectionPageItem[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      url: getConfig().site.url,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
        ...(item.image ? { image: item.image } : {}),
        ...(item.datePublished ? { datePublished: item.datePublished } : {}),
      })),
    },
  };
}
