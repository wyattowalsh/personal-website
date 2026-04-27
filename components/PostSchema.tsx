/**
 * Server-side JSON-LD structured data components.
 * Renders <script type="application/ld+json"> tags for SEO.
 * These are server components - the JSON-LD is pre-rendered in the HTML.
 */

import { generateWebSiteSchema } from '@/lib/schema';
import { getSiteIdentity } from '@/lib/config';

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
        // Escape '<' as '\u003c' to prevent script injection via JSON-LD content.
        // Without this, a value containing "</script>" could prematurely close
        // the JSON-LD block, allowing arbitrary script execution (XSS).
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}

/**
 * Person and ProfilePage schema for the homepage.
 */
export function PersonJsonLd() {
  const identity = getSiteIdentity();
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: identity.author.name,
    url: identity.url,
    email: identity.author.email,
    jobTitle: identity.author.jobTitle,
    description: identity.description,
    sameAs: identity.socialLinks,
  };

  const profilePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: '2024-01-01T00:00:00Z',
    dateModified: new Date().toISOString(),
    mainEntity: {
      '@type': 'Person',
      name: identity.author.name,
      url: identity.url,
      sameAs: identity.socialLinks,
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
