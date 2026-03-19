/**
 * Server-side JSON-LD structured data components.
 * Renders <script type="application/ld+json"> tags for SEO.
 * These are server components - the JSON-LD is pre-rendered in the HTML.
 */

import { generateWebSiteSchema } from '@/lib/schema';
import { getConfig } from '@/lib/core';

const SOCIAL_LINKS = [
  'https://github.com/wyattowalsh',
  'https://twitter.com/wyattowalsh',
  'https://linkedin.com/in/wyattowalsh',
  'https://www.kaggle.com/wyattowalsh',
  'https://codepen.io/wyattowalsh',
  'https://www.reddit.com/user/onelonedatum',
];

/**
 * WebSite schema for the root layout with SearchAction.
 * Delegates to generateWebSiteSchema() from lib/schema.ts.
 */
export function WebSiteJsonLd() {
  const schema = generateWebSiteSchema();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}

/**
 * Person and ProfilePage schema for the homepage.
 */
export function PersonJsonLd() {
  const siteUrl = getConfig().site.url;
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Wyatt Walsh',
    url: siteUrl,
    email: 'mail@w4w.dev',
    jobTitle: 'Software Engineer',
    description: 'Software engineer writing about software engineering, data science, and technology',
    sameAs: SOCIAL_LINKS,
  };

  const profilePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: '2024-01-01T00:00:00Z',
    dateModified: new Date().toISOString(),
    mainEntity: {
      '@type': 'Person',
      name: 'Wyatt Walsh',
      url: siteUrl,
      sameAs: SOCIAL_LINKS,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([personSchema, profilePageSchema]).replace(/</g, '\\u003c'),
      }}
    />
  );
}

/**
 * Generic JSON-LD component for arbitrary structured data.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
