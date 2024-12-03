import { NextResponse } from 'next/server';
import { cache } from 'react';
import { Feed } from 'feed';
import { backend } from '@/lib/server';
import { getConfig } from '@/lib/core';

const generateJsonFeed = cache(async () => {
  try {
    const site = getConfig().site;
    const posts = await backend.getAllPosts();

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

    return feed.json1();
  } catch (error) {
    console.error('Error generating JSON feed:', error);
    return '';
  }
});

export async function GET() {
  const jsonFeed = await generateJsonFeed();

  return new Response(jsonFeed, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
