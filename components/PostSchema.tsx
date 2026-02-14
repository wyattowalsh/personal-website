/**
 * Server-side JSON-LD structured data component for blog posts.
 * Renders a <script type="application/ld+json"> tag with BlogPosting and BreadcrumbList schemas.
 * This is a server component for proper SEO - the JSON-LD is pre-rendered in the HTML.
 */

const siteUrl = 'https://w4w.dev';

interface ArticleSchemaProps {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  slug: string;
  tags?: string[];
}

/**
 * Generates BlogPosting and BreadcrumbList JSON-LD for a blog post.
 * Use this in MDX files or page components.
 */
export function ArticleJsonLd({
  title,
  description,
  image,
  datePublished,
  dateModified,
  slug,
  tags = [],
}: ArticleSchemaProps) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: image.startsWith('http') ? image : `${siteUrl}${image}`,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: 'Wyatt Walsh',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Wyatt Walsh',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.webp`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/posts/${slug}`,
    },
    keywords: tags.join(', '),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${siteUrl}/blog/posts/${slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([articleSchema, breadcrumbSchema]).replace(/</g, '\\u003c'),
      }}
    />
  );
}

/**
 * WebSite schema for the root layout.
 */
export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'onelonedatum',
    alternateName: ['w4w', 'wyattowalsh'],
    url: siteUrl,
    description: 'Articles about software engineering, data science, and technology',
    author: {
      '@type': 'Person',
      name: 'Wyatt Walsh',
      url: siteUrl,
      sameAs: [
        'https://github.com/wyattowalsh',
        'https://twitter.com/wyattowalsh',
        'https://linkedin.com/in/wyattowalsh',
      ],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Wyatt Walsh',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.webp`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
