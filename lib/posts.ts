import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PostMetaData } from '@/types';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData(): PostMetaData[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const slug = fileName;
    const fullPath = path.join(postsDirectory, slug, 'index.mdx');
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      slug,
      image: matterResult.data.image || '/logo.webp',
      title: matterResult.data.title,
      datePosted: matterResult.data.datePosted || matterResult.data.date,
      dateUpdated: matterResult.data.dateUpdated || matterResult.data.date,
      summary: matterResult.data.summary,
      tags: matterResult.data.tags || [],
    };
  });

  // Sort posts by datePosted
  return allPostsData.sort((a, b) => {
    return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
  });
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((slug) => {
    return {
      params: {
        slug,
      },
    };
  });
}

export function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, slug, 'index.mdx');
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    slug,
    content: matterResult.content,
    image: matterResult.data.image || '/logo.webp',
    title: matterResult.data.title,
    datePosted: matterResult.data.datePosted || matterResult.data.date,
    dateUpdated: matterResult.data.dateUpdated || matterResult.data.date,
    summary: matterResult.data.summary,
    tags: matterResult.data.tags || [],
  };
}
