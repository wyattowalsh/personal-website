'use server';

import { cache } from 'react';

export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  author: {
    name: string;
    email: string;
    twitter?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
    plausibleDomain?: string;
  };
}

// Convert to async function since we're using 'use server'
export async function getDefaultConfig(): Promise<SiteConfig> {
  return {
    title: "Wyatt Walsh's Blog",
    description: 'Articles about software engineering, data science, and technology',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev',
    author: {
      name: 'Wyatt Walsh',
      email: 'mail@w4w.dev',
      twitter: '@wyattowalsh',
    }
  };
}

export const getSiteConfig = cache(getDefaultConfig);

// If you need to use the config synchronously in client components,
// create a separate client config file without 'use server'
