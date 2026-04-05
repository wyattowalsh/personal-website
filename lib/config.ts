import { z } from 'zod';
import type { Config } from './types';

export const schemas = {
  slug: z.object({ slug: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_-]+$/, { error: 'Invalid slug format' }) }),
  search: z.object({ query: z.string().min(1).max(100) }),
  tag: z.object({ tag: z.string().min(1).max(50) }),
};

const defaultConfig = {
  site: {
    title: 'Wyatt Walsh',
    description: 'Articles about software engineering, data science, and technology',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev',
    author: {
      name: 'Wyatt Walsh',
      email: 'mail@w4w.dev',
      twitter: 'wyattowalsh',
      github: 'wyattowalsh',
      linkedin: 'wyattowalsh',
    },
  },
  blog: {
    postsPerPage: 10,
    featuredLimit: 3,
  },
} satisfies Config;

export function getConfig(): Config {
  return defaultConfig;
}

export function getDefaultMetadata() {
  const config = getConfig();
  return {
    title: config.site.title,
    description: config.site.description,
    url: config.site.url,
    author: config.site.author,
  };
}
