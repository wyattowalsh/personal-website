import type { Metadata } from 'next';
import { z } from 'zod';
import type { Config } from './types';

export const schemas = {
  slug: z.object({ slug: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_-]+$/, { error: 'Invalid slug format' }) }),
  search: z.object({ query: z.string().min(1).max(100) }),
  tag: z.object({ tag: z.string().min(1).max(50) }),
};

const defaultConfig = {
  site: {
    name: 'Wyatt Walsh',
    title: 'Wyatt Walsh',
    description: 'Articles about software engineering, data science, and technology',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev',
    locale: 'en_US',
    brand: {
      name: 'onelonedatum',
      shortName: 'w4w',
      domain: 'w4w.dev',
      aliases: ['w4w', 'wyattowalsh'],
      ogImagePath: '/opengraph.png',
      logoPath: '/logo.webp',
    },
    author: {
      name: 'Wyatt Walsh',
      email: 'mail@w4w.dev',
      jobTitle: 'Software Engineer',
      twitter: 'wyattowalsh',
      github: 'wyattowalsh',
      linkedin: 'wyattowalsh',
      reddit: 'onelonedatum',
      kaggle: 'wyattowalsh',
      codepen: 'wyattowalsh',
    },
  },
  blog: {
    postsPerPage: 10,
    featuredLimit: 3,
  },
} satisfies Config;

const feedAlternates: NonNullable<Metadata['alternates']>['types'] = {
  'application/rss+xml': '/feed.xml',
  'application/atom+xml': '/feed.atom',
  'application/feed+json': '/feed.json',
};

function normalizeSiteUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function buildSocialLinks(config: Config): string[] {
  const { author } = config.site;

  return [
    author.github ? `https://github.com/${author.github}` : undefined,
    author.twitter ? `https://twitter.com/${author.twitter}` : undefined,
    author.linkedin ? `https://linkedin.com/in/${author.linkedin}` : undefined,
    author.kaggle ? `https://www.kaggle.com/${author.kaggle}` : undefined,
    author.codepen ? `https://codepen.io/${author.codepen}` : undefined,
    author.reddit ? `https://www.reddit.com/user/${author.reddit}` : undefined,
  ].filter((value): value is string => Boolean(value));
}

export function getConfig(): Config {
  return {
    ...defaultConfig,
    site: {
      ...defaultConfig.site,
      url: normalizeSiteUrl(defaultConfig.site.url),
    },
  };
}

export function getAbsoluteUrl(path = ''): string {
  const baseUrl = `${getConfig().site.url}/`;

  if (!path) {
    return getConfig().site.url;
  }

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return new URL(path, baseUrl).toString();
}

export function getSiteIdentity() {
  const config = getConfig();
  const { site } = config;
  const twitterHandle = site.author.twitter ? `@${site.author.twitter}` : undefined;

  return {
    name: site.name,
    title: site.title,
    description: site.description,
    url: site.url,
    locale: site.locale,
    metadataBase: new URL(site.url),
    brandName: site.brand.name,
    brandShortName: site.brand.shortName,
    brandDomain: site.brand.domain,
    brandAliases: site.brand.aliases,
    ogImagePath: site.brand.ogImagePath,
    ogImageUrl: getAbsoluteUrl(site.brand.ogImagePath),
    logoPath: site.brand.logoPath,
    logoUrl: getAbsoluteUrl(site.brand.logoPath),
    author: site.author,
    twitterHandle,
    socialLinks: buildSocialLinks(config),
    feedAlternates: feedAlternates,
  };
}

export function getDefaultMetadata(): Metadata {
  const identity = getSiteIdentity();

  return {
    metadataBase: identity.metadataBase,
    title: identity.title,
    description: identity.description,
    applicationName: identity.brandName,
    authors: [
      {
        name: identity.author.name,
        url: identity.url,
      },
    ],
    creator: identity.author.name,
    publisher: identity.author.name,
    openGraph: {
      type: 'website',
      locale: identity.locale,
      siteName: identity.brandName,
      title: identity.title,
      description: identity.description,
      url: identity.url,
      images: [
        {
          url: identity.ogImageUrl,
          width: 1200,
          height: 630,
          alt: identity.brandName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      ...(identity.twitterHandle ? { site: identity.twitterHandle, creator: identity.twitterHandle } : {}),
      title: identity.title,
      description: identity.description,
      images: [identity.ogImageUrl],
    },
    alternates: {
      types: identity.feedAlternates,
    },
  };
}
