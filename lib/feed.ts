import { Feed } from 'feed';
import { BackendService } from '@/lib/server';
import { getConfig } from '@/lib/config';
import { stripMdxSyntax } from '@/lib/utils';

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

  const posts = allPosts.slice(0, 20);

  // Use the most recent updated/created date across all posts
  const latestDate = posts.reduce((latest, post) => {
    const d = new Date(post.updated || post.created);
    return d > latest ? d : latest;
  }, new Date(0));

  const currentYear = new Date().getFullYear();

  const feed = new Feed({
    title: site.title,
    description: site.description,
    id: site.url,
    link: site.url,
    language: "en",
    favicon: `${site.url}/favicon.ico`,
    copyright: `All rights reserved ${currentYear}, ${site.author.name}`,
    updated: latestDate,
    generator: "Next.js using Feed for Node.js",
    feedLinks: {
      rss2: `${site.url}/feed.xml`,
      json: `${site.url}/feed.json`,
      atom: `${site.url}/feed.atom`,
    },
    author: site.author,
    image: `${site.url}/opengraph.png`,
  });

  for (const post of posts) {
    const url = `${site.url}/blog/posts/${post.slug}`;
    const feedContent = stripMdxSyntax(post.content);
    const postDate = new Date(post.updated || post.created);
    const publishedDate = new Date(post.created);
    const imageUrl = post.image ? `${site.url}${post.image}` : undefined;

    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      guid: url,
      description: post.summary,
      content: feedContent,
      author: [site.author],
      date: postDate,
      published: publishedDate,
      image: imageUrl,
      category: post.tags.map(tag => ({ name: tag })),
      copyright: `${currentYear} ${site.author.name}`,
    });
  }

  return feed;
}
