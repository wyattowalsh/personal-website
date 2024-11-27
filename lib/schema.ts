import { links } from '@/components/Links';
import { Post } from '@/lib/services/backend';
import { cache } from 'react';
import { getConfig } from './config';

interface BreadcrumbItem {
  name: string;
  item: string;
}

export function generateArticleStructuredData(post: Post, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.image ? [`${siteUrl}${post.image}`] : [],
    datePublished: new Date(post.created).toISOString(),
    dateModified: new Date(post.updated || post.created).toISOString(),
    author: {
      '@type': 'Person',
      name: 'Wyatt Walsh',
      url: siteUrl,
    },
  };
}

// Cache the generation of the website schema
export const generateWebSiteSchema = cache((url = 'https://w4w.dev') => {
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
    ]
  };
});

export function generateArticleSchema(post: any) {
  const config = getConfig();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.image ? [`${config.site.url}${post.image}`] : [],
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
        url: `${config.site.url}/logo.webp`
      }
    }
  };
}

export const generateBreadcrumbSchema = cache(
  (items: BreadcrumbItem[], baseUrl = 'https://w4w.dev') => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${baseUrl}${item.item}`
      }))
    }
  }
);
