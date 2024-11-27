import { NextResponse } from 'next/server';
import { cache } from 'react';
import { Feed } from 'feed';
import { getAllPosts } from '@/lib/services/backend';
import { getSiteConfig } from '@/lib/config';

// Removed exports of 'dynamic' and 'revalidate'
// export const dynamic = 'force-dynamic';
// export const revalidate = 3600; // Revalidate every hour

// Use cache to precompute the feed
const generateFeed = cache(async () => {
  try {
    const site = await getSiteConfig();
    const posts = await getAllPosts();

    const feed = new Feed({
      title: site.title,
      description: site.description,
      id: site.url,
      link: site.url,
      language: "en",
      favicon: `${site.url}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${site.author.name}`,
      author: {
        name: site.author.name,
        email: site.author.email,
        link: site.url,
      },
      feedLinks: {
        rss2: `${site.url}/feed.xml`,
        json: `${site.url}/feed.json`,
        atom: `${site.url}/feed.atom`,
      }
    });

    posts.forEach((post) => {
      feed.addItem({
        title: post.title,
        id: `${site.url}/blog/${post.slug}`,
        link: `${site.url}/blog/${post.slug}`,
        description: post.summary,
        content: post.content,
        author: [site.author],
        date: new Date(post.created),
        image: post.image ? `${site.url}${post.image}` : undefined,
        category: post.tags.map(tag => ({ name: tag })),
      });
    });

    return feed.rss2();
  } catch (error) {
    console.error('Error generating feed:', error);
    return ''; // Return empty string or default feed content
  }
});

export async function GET() {
  const rssFeed = await generateFeed();

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Control caching via headers
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
