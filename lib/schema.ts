import { links } from '@/components/Links';
import { Post } from './posts';
import { cache } from 'react';

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
    // ...additional properties...
  };
}

// Cache the generation of the website schema
export const generateWebSiteSchema = cache((url = 'https://w4w.dev') => {
  const currentYear = new Date().getFullYear()
  const socialLinks = links.filter(link => !link.url.startsWith('/'))

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Wyatt Walsh',
    alternateName: ['W4W', 'wyattowalsh'],
    url,
    description: 'Personal website and blog covering software engineering, data science, and technology',
    author: {
      '@type': 'Person',
      name: 'Wyatt Walsh',
      url,
      sameAs: socialLinks.map(link => link.url),
      jobTitle: 'Software Engineer',
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'University of California, Berkeley'
      },
      knowsAbout: [
        'Software Engineering',
        'Data Science',
        'Machine Learning',
        'Web Development'
      ]
    },
    publisher: {
      '@type': 'Organization',
      name: 'Wyatt Walsh',
      logo: {
        '@type': 'ImageObject',
        url: `${url}/logo.webp`
      }
    },
    copyrightYear: currentYear,
    copyrightHolder: {
      '@type': 'Person',
      name: 'Wyatt Walsh'
    },
    inLanguage: 'en-US',
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    version: '0.1.0',
    applicationCategory: 'Blog',
    keywords: [
      'Software Engineering',
      'Data Science',
      'Machine Learning',
      'Web Development',
      'Technology'
    ]
  }
})

// ...existing code...

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
