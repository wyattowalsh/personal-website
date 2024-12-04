import { Feed } from 'feed';
import { BackendService, handleRequest } from '@/lib/server';
import { getConfig } from '@/lib/core';
import { formatDate } from '@/lib/utils';

const generateRSSFeed = async () => {
  const site = getConfig().site;
  await BackendService.ensurePreprocessed();
  const backend = BackendService.getInstance();
  const posts = await backend.getAllPosts();

  if (!posts?.length) {
    throw new Error('No posts found for RSS feed');
  }

  const feed = new Feed({
    title: site.title,
    description: site.description,
    id: site.url,
    link: site.url,
    language: "en",
    favicon: `${site.url}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${site.author.name}`,
    updated: new Date(posts[0].created),
    generator: "Next.js using Feed for Node.js",
    feedLinks: {
      rss2: `${site.url}/feed.xml`,
      json: `${site.url}/feed.json`,
      atom: `${site.url}/feed.atom`,
    },
    author: site.author
  });

  for (const post of posts) {
    const url = `${site.url}/blog/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.summary,
      content: post.content,
      author: [site.author],
      date: new Date(post.created),
      image: post.image ? `${site.url}${post.image}` : undefined,
      category: post.tags.map(tag => ({ name: tag })),
    });
  }

  return feed.rss2();
};

export async function GET() {
  return handleRequest({
    handler: async () => {
      const feed = await generateRSSFeed();
      return new Response(feed, {
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
        },
      });
    },
    cache: 3600,
  });
}
