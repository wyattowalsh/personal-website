import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";

const postsDirectory = path.join(process.cwd(), "posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content: any;
  image: string;
}

export function getSortedPostsData(): Post[] {
  const directories = fs.readdirSync(postsDirectory);
  const allPostsData = directories
    .filter((directory) => {
      const fullPath = path.join(postsDirectory, directory);
      return fs.statSync(fullPath).isDirectory();
    })
    .map((directory) => {
      const fullPath = path.join(postsDirectory, directory, "index.mdx");
      const fileContents = fs.readFileSync(fullPath, "utf8");

      const matterResult = matter(fileContents);

      return {
        slug: directory,
        ...(matterResult.data as {
          title: string;
          date: string;
          tags: string[];
          summary: string;
          image: string;
        }),
        content: matterResult.content,
      };
    });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPostSlugs() {
  const directories = fs.readdirSync(postsDirectory);
  return directories.filter((directory) => {
    const fullPath = path.join(postsDirectory, directory);
    return fs.statSync(fullPath).isDirectory();
  });
}

export async function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, slug, "index.mdx");
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  const mdxSource = await serialize(matterResult.content);

  return {
    slug,
    content: mdxSource,
    image: matterResult.data.image || "/logo.webp",
    title: matterResult.data.title,
    date: matterResult.data.date,
    summary: matterResult.data.summary,
    tags: matterResult.data.tags || [],
  };
}

export function getPostsByTag(tag: string): Post[] {
  const posts = getSortedPostsData();
  return posts.filter((post) => post.tags.includes(tag));
}

export function getAllTags(): string[] {
  const posts = getSortedPostsData();
  const tagsSet = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tagsSet.add(tag));
  });
  return Array.from(tagsSet);
}
