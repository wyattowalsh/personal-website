import { BackendService } from "@/lib/server";
import { HomePageClient } from "@/components/HomePageClient";
import { Metadata } from 'next';
import { getConfig } from '@/lib/core';
import { PersonJsonLd } from '@/components/PostSchema';

const config = getConfig();
const siteUrl = config.site.url;

export const metadata: Metadata = {
  title: config.site.title,
  description: config.site.description,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    title: config.site.title,
    description: config.site.description,
    url: siteUrl,
    siteName: config.site.title,
    images: [
      {
        url: `${siteUrl}/opengraph.png`,
        width: 1200,
        height: 630,
        alt: config.site.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: config.site.title,
    description: config.site.description,
    images: [`${siteUrl}/opengraph.png`],
    creator: `@${config.site.author.twitter}`,
  },
};

export default async function HomePage() {
  // Fetch recent posts on the server
  await BackendService.ensurePreprocessed();
  const allPosts = await BackendService.getInstance().getAllPosts();

  // Get the 3 most recent posts
  const recentPosts = allPosts.slice(0, 3).map(({ content: _c, wordCount: _wc, adjacent: _adj, ...meta }) => meta);

  return (
    <>
      <PersonJsonLd />
      <HomePageClient recentPosts={recentPosts} />
    </>
  );
}
