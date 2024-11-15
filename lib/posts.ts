// lib/posts.ts

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Fuse from "fuse.js";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "data/posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content?: string;
  image: string;
  caption?: string;
  updated: string;
  readingTime: string;
}

function getAllMdxFiles(dir: string, files: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllMdxFiles(fullPath, files);
    } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  });

  return files;
}

export function getSortedPostsData(options?: {
  searchTerm?: string;
  selectedTags?: string[];
  sortBy?: 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): { posts: Post[]; total: number } {
  const files = getAllMdxFiles(postsDirectory);

  const allPostsData = files.map((file) => {
    const fileContents = fs.readFileSync(file, 'utf8');
    const matterResult = matter(fileContents);

    const relativePath = path.relative(postsDirectory, file);
    const slug = relativePath
      .replace(/\.mdx?$/, '')
      .replace(/\\/g, '/'); // Replace backslashes with forward slashes for Windows compatibility

    return {
      slug,
      ...(matterResult.data as {
        title: string;
        date: string;
        tags: string[];
        summary: string;
        image: string;
        updated: string;
      }),
      content: matterResult.content,
    };
  });

  let filteredPosts = allPostsData;

  // Filtering by search term
  if (options?.searchTerm) {
    const fuse = new Fuse(filteredPosts, {
      keys: ['title', 'summary', 'content'],
      threshold: 0.3,
    });
    const results = fuse.search(options.searchTerm);
    filteredPosts = results.map((result) => result.item);
  }

  // Filtering by tags
  if (options?.selectedTags && options.selectedTags.length > 0) {
    filteredPosts = filteredPosts.filter((post) =>
      options.selectedTags.every((tag) => post.tags.includes(tag))
    );
  }

  // Sorting
  if (options?.sortBy) {
    const order = options.sortOrder === 'asc' ? 1 : -1;
    filteredPosts.sort((a, b) => {
      if (options.sortBy === 'date') {
        return (new Date(a.date) < new Date(b.date) ? -1 : 1) * order;
      } else if (options.sortBy === 'title') {
        return a.title.localeCompare(b.title) * order;
      }
      return 0;
    });
  }

  const total = filteredPosts.length;

  // Pagination
  if (options?.page && options?.pageSize) {
    const start = (options.page - 1) * options.pageSize;
    const end = options.page * options.pageSize;
    filteredPosts = filteredPosts.slice(start, end);
  }

  return { posts: filteredPosts, total };
}

export function getAllPostSlugs() {
  const files = getAllMdxFiles(postsDirectory);

  return files.map((file) => {
    const relativePath = path.relative(postsDirectory, file);
    const slug = relativePath
      .replace(/\.mdx?$/, '')
      .replace(/\\/g, '/'); // Replace backslashes with forward slashes

    return slug.split('/');
  });
}

export async function getPostData(slug: string) {
  let fullPath = path.join(postsDirectory, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, slug, "index.mdx");
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  const mdxSource = matterResult.content;
  const stats = readingTime(mdxSource);

  return {
    slug,
    content: mdxSource,
    image: matterResult.data.image || "/logo.webp",
    title: matterResult.data.title || "Untitled Post",
    date: matterResult.data.date || null,
    summary: matterResult.data.summary || "No summary available.",
    tags: matterResult.data.tags || [],
    caption: matterResult.data.caption || null,
    updated: matterResult.data.updated || null,
    readingTime: stats.text,
  };
}

export async function getAllTags() {
  const files = getAllMdxFiles(postsDirectory);

  const tagsSet = new Set<string>();

  files.forEach((file) => {
    const fileContents = fs.readFileSync(file, 'utf8');
    const matterResult = matter(fileContents);

    const tags = matterResult.data.tags || [];
    tags.forEach((tag: string) => tagsSet.add(tag));
  });

  return Array.from(tagsSet);
}
