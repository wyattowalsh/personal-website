import { BackendService } from '@/lib/server';
import { validateAdminSession } from '../lib/auth';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { ContentView } from './ContentView';

export const metadata: Metadata = {
  title: 'Content Management',
  robots: { index: false, follow: false },
};

export default async function ContentPage() {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) {
    redirect('/admin');
  }

  await BackendService.ensurePreprocessed();
  const backend = BackendService.getInstance();
  const posts = await backend.getAllPosts();
  const allTags = await backend.getAllTags();

  // Serialize post data for client component
  const serializedPosts = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    created: post.created,
    updated: post.updated,
    wordCount: post.wordCount,
    readingTime: post.readingTime,
    tags: post.tags,
    image: post.image,
    summary: post.summary,
    series: post.series,
  }));

  return <ContentView posts={serializedPosts} allTags={allTags} />;
}
