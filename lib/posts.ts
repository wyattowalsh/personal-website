import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { promises as fs } from 'fs';  // Update import
import { LRUCache } from 'lru-cache';

// Update the posts directory path to ensure it's absolute
const postsDirectory = path.join(process.cwd(), "app/blog/posts");

export interface PostMetaData {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;
  image?: string;
  caption?: string;
  updated?: string;
  readingTime: string;
}

// Update interfaces to use created/updated instead of date
export interface PostMetadata {
  slug: string;
  title: string;
  summary: string;
  created: string;    // Changed from date
  updated: string;    // Now required
  tags: string[];
  image?: string;
  caption?: string;
  content?: string;
  readingTime?: string;
  adjacent?: {
    prev: AdjacentPost | null;
    next: AdjacentPost | null;
  };
}

export interface AdjacentPost {
  slug: string;
  title: string;
}

// Update interfaces to use created/updated instead of date
export interface Post {
  slug: string;
  title: string;
  created: string;    // Changed from date
  updated: string;    // Now required
  tags: string[];
  summary: string;
  content: string;
  image?: string;
  caption?: string;
  readingTime?: string;
}

export async function getAllMdxFiles(dir: string, files: string[] = []): Promise<string[]> {
  const { readdir } = await import("fs/promises");
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const pagePath = path.join(fullPath, "page.mdx");
      const { existsSync } = await import("fs");
      if (existsSync(pagePath)) {
        files.push(pagePath);
      } else {
        await getAllMdxFiles(fullPath, files);
      }
    }
  }

  return files;
}

// Update getSortedPostsData to use created date for sorting
export async function getSortedPostsData(): Promise<{ posts: Post[]; total: number }> {
  try {
    const files = await getAllMdxFiles(postsDirectory);

    const allPostsData = await Promise.all(files.map(async (file) => {
      const { readFile } = await import("fs/promises");
      const fileContents = await readFile(file, "utf8");
      const matterResult = matter(fileContents);

      const relativePath = path.relative(postsDirectory, file);
      const slug = path.dirname(relativePath).replace(/\\/g, "/");

      const stats = readingTime(matterResult.content);

      return {
        slug,
        ...(matterResult.data as {
          title: string;
          created: string;    // Changed from date
          updated: string;    // Now required
          tags: string[];
          summary: string;
          image?: string;
          caption?: string;
        }),
        content: matterResult.content,
        readingTime: stats.text,
      };
    }));

    const sortedPosts = allPostsData.sort((a, b) =>
      new Date(b.created) > new Date(a.created) ? 1 : -1  // Changed from date to created
    );

    return { posts: sortedPosts, total: sortedPosts.length };
  } catch (error) {
    console.error("Error getting sorted posts data:", error);
    return { posts: [], total: 0 };
  }
}

export async function getAllPostSlugs() {
  try {
    const files = await getAllMdxFiles(postsDirectory);

    return files.map((file) => {
      const relativePath = path.relative(postsDirectory, file);
      const slug = path.dirname(relativePath).replace(/\\/g, "/");
      return slug.split("/");
    });
  } catch (error) {
    console.error("Error getting all post slugs:", error);
    return [];
  }
}

// Define cache options type
type PostsCacheType = {
  max: number;
  ttl: number;
};

// Add cache for posts with proper type definition
const postsCache = new LRUCache<string, PostMetadata | Post[]>({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
} as PostsCacheType);

// Replace getAllPosts implementation
export async function getAllPosts(): Promise<Post[]> {
  const cacheKey = 'all-posts';
  const cached = postsCache.get(cacheKey);
  if (cached) return cached as Post[];

  try {
    const cacheDir = path.join(process.cwd(), '.cache');
    const metadata = await fs.readFile(path.join(cacheDir, 'posts-metadata.json'), 'utf-8');
    const metadataJson = JSON.parse(metadata);

    if (!metadataJson || !Object.keys(metadataJson).length) {
      console.warn('No posts found in cache, falling back to filesystem');
      return await getSortedPostsData().then(result => result.posts);
    }

    const allPostsData = Object.values(metadataJson);
    postsCache.set(cacheKey, allPostsData);
    return allPostsData as Post[];
  } catch (error) {
    console.error("Error getting all posts:", error);
    // Fallback to direct file system reading if cache fails
    return await getSortedPostsData().then(result => result.posts);
  }
}

// Update getPostBySlug implementation
export async function getPostBySlug(slug: string | string[]): Promise<PostMetadata | null> {
  const cacheKey = Array.isArray(slug) ? slug.join('/') : slug;
  const cached = postsCache.get(cacheKey);
  if (cached) return cached as PostMetadata;

  try {
    const cacheDir = path.join(process.cwd(), '.cache');
    const metadata = await fs.readFile(path.join(cacheDir, 'posts-metadata.json'), 'utf-8');
    const metadataJson = JSON.parse(metadata);

    const postMetadata = metadataJson[cacheKey];
    if (!postMetadata) {
      console.warn(`Post not found for slug: ${cacheKey}`);
      return null;
    }

    postsCache.set(cacheKey, postMetadata);
    return postMetadata;
  } catch (error) {
    console.error(`Error fetching post by slug: ${slug}`, error);
    return null;
  }
}

export async function getAllTags() {
  try {
    const files = await getAllMdxFiles(postsDirectory);

    const tagsSet = new Set<string>();

    for (const file of files) {
      const { readFile } = await import("fs/promises");
      const fileContents = await readFile(file, "utf8");
      const matterResult = matter(fileContents);

      const tags = matterResult.data.tags || [];
      tags.forEach((tag: string) => tagsSet.add(tag));
    }

    return Array.from(tagsSet);
  } catch (error) {
    console.error("Error getting all tags:", error);
    return [];
  }
}

export async function getAdjacentPosts(currentSlug: string | string[]): Promise<{
  prevPost?: AdjacentPost;
  nextPost?: AdjacentPost;
}> {
  try {
    const posts = await getAllPosts();
    const normalizedSlug = Array.isArray(currentSlug) ? currentSlug.join('/') : currentSlug;
    const currentIndex = posts.findIndex((post: Post) => post.slug === normalizedSlug);
    
    if (currentIndex === -1) {
      return { prevPost: undefined, nextPost: undefined };
    }

    return {
      // Switch these - newer posts are "previous", older posts are "next"
      prevPost: currentIndex < posts.length - 1 ? {
        slug: posts[currentIndex + 1].slug,
        title: posts[currentIndex + 1].title,
      } : undefined,
      nextPost: currentIndex > 0 ? {
        slug: posts[currentIndex - 1].slug,
        title: posts[currentIndex - 1].title,
      } : undefined,
    };
  } catch (error) {
    console.error("Error getting adjacent posts:", error);
    return { prevPost: undefined, nextPost: undefined };
  }
}