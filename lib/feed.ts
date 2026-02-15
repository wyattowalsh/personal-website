import { Feed } from 'feed';
import { BackendService } from '@/lib/server';
import { getConfig } from '@/lib/core';

/**
 * Build a feed object with posts data.
 * Limits to 20 most recent posts for performance.
 */
export async function buildFeed(): Promise<Feed> {
  const site = getConfig().site;
  await BackendService.ensurePreprocessed();
  const backend = BackendService.getInstance();
  const allPosts = await backend.getAllPosts();

  if (!allPosts?.length) {
    throw new Error('No posts found for feed');
  }

  // Limit to 20 most recent posts
  const posts = allPosts.slice(0, 20);

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
    const url = `${site.url}/blog/posts/${post.slug}`;

    // Further clean content for feed - strip any remaining JSX/MDX syntax
    const feedContent = post.content
      .replace(/<[A-Z][a-zA-Z0-9]*[\s\S]*?\/>/g, '') // Self-closing JSX components
      .replace(/<[A-Z][a-zA-Z0-9]*[\s\S]*?>[\s\S]*?<\/[A-Z][a-zA-Z0-9]*>/g, '') // JSX components with children
      .replace(/\{[\s\S]*?\}/g, '') // JSX expressions
      .trim();

    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.summary,
      content: feedContent,
      author: [site.author],
      date: new Date(post.created),
      published: new Date(post.created),
      image: post.image ? `${site.url}${post.image}` : undefined,
      category: post.tags.map(tag => ({ name: tag })),
    });
  }

  return feed;
}
