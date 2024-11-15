import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "data/posts");

export interface Post {
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

export function getAllMdxFiles(dir: string, files: string[] = []) {
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

export function getSortedPostsData(): { posts: Post[]; total: number } {
  const files = getAllMdxFiles(postsDirectory);

  const allPostsData = files.map((file) => {
    const fileContents = fs.readFileSync(file, "utf8");
    const matterResult = matter(fileContents);

    const relativePath = path.relative(postsDirectory, file);
    const slug = relativePath.replace(/\.mdx?$/, "").replace(/\\/g, "/");

    const stats = readingTime(matterResult.content);

    return {
      slug,
      ...(matterResult.data as {
        title: string;
        date: string;
        tags: string[];
        summary: string;
        image?: string;
        caption?: string;
        updated?: string;
      }),
      content: matterResult.content,
      readingTime: stats.text,
    };
  });

  const sortedPosts = allPostsData.sort((a, b) =>
    new Date(b.date) > new Date(a.date) ? 1 : -1
  );

  return { posts: sortedPosts, total: sortedPosts.length };
}

export function getAllPostSlugs() {
  const files = getAllMdxFiles(postsDirectory);

  return files.map((file) => {
    const relativePath = path.relative(postsDirectory, file);
    const slug = relativePath.replace(/\/index\.mdx?$/, "").replace(/\.mdx?$/, "").replace(/\\/g, "/");

    return slug.split("/");
  });
}

export async function getPostData(slug: string | string[]) {
  const slugPath = Array.isArray(slug) ? slug.join("/") : slug;

  let fullPath = path.join(postsDirectory, `${slugPath}.mdx`);

  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, slugPath, "index.mdx");
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Post not found: ${slugPath}`);
    }
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  const stats = readingTime(matterResult.content);

  let imagePath = matterResult.data.image;
  if (imagePath) {
    if (imagePath.startsWith("./") || imagePath.startsWith("../")) {
      const imageFullPath = path.join(path.dirname(fullPath), imagePath);
      imagePath =
        "/" +
        path
          .relative(path.join(process.cwd(), "public"), imageFullPath)
          .replace(/\\/g, "/");
    }
  }

  return {
    slug: slugPath,
    content: matterResult.content,
    image: imagePath,
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
    const fileContents = fs.readFileSync(file, "utf8");
    const matterResult = matter(fileContents);

    const tags = matterResult.data.tags || [];
    tags.forEach((tag: string) => tagsSet.add(tag));
  });

  return Array.from(tagsSet);
}

export async function getPostBySlug(slug: string | string[]) {
  const slugPath = Array.isArray(slug) ? slug.join("/") : slug;
  let fullPath = path.join(postsDirectory, `${slugPath}.mdx`);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, slugPath, "index.mdx");
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Post not found: ${slugPath}`);
    }
  }
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);
  const stats = readingTime(matterResult.content);
  let imagePath = matterResult.data.image;
  if (imagePath) {
    if (imagePath.startsWith("./") || imagePath.startsWith("../")) {
      const imageFullPath = path.join(path.dirname(fullPath), imagePath);
      imagePath =
        "/" +
        path
          .relative(path.join(process.cwd(), "public"), imageFullPath)
          .replace(/\\/g, "/");
    }
  }
  return {
    slug: slugPath,
    content: matterResult.content,
    image: imagePath,
    title: matterResult.data.title || "Untitled Post",
    date: matterResult.data.date || null,
    summary: matterResult.data.summary || "No summary available.",
    tags: matterResult.data.tags || [],
    caption: matterResult.data.caption || null,
    updated: matterResult.data.updated || null,
    readingTime: stats.text,
  };
}

export async function getAllPosts() {
  const files = getAllMdxFiles(postsDirectory);
  const allPostsData = files.map((file) => {
    const fileContents = fs.readFileSync(file, "utf8");
    const matterResult = matter(fileContents);
    const relativePath = path.relative(postsDirectory, file);
    const slug = relativePath.replace(/\.mdx?$/, "").replace(/\\/g, "/");
    const stats = readingTime(matterResult.content);
    return {
      slug,
      ...(matterResult.data as {
        title: string;
        date: string;
        tags: string[];
        summary: string;
        image?: string;
        caption?: string;
        updated?: string;
      }),
      content: matterResult.content,
      readingTime: stats.text,
    };
  });
  return allPostsData.sort((a, b) =>
    new Date(b.date) > new Date(a.date) ? 1 : -1
  );
}
