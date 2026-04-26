import { redirect } from 'next/navigation';
import { BackendService } from '@/lib/server';
import { validateAdminSession } from '@/app/admin/lib/auth';
import { Metadata } from 'next';
import { Charts } from './Charts';
import { PostsTable } from '../components/PostsTable';
import { AdminHero, AdminSurface, SignalCard } from '../components/AdminVisuals';
import { BookOpen, Clock, FileText, Hash } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog Analytics',
  robots: { index: false, follow: false },
};

export default async function BlogStatsPage() {
  const isValid = await validateAdminSession();
  if (!isValid) {
    redirect('/admin');
  }

  await BackendService.ensurePreprocessed();
  const backend = BackendService.getInstance();
  const posts = await backend.getAllPosts();
  const tags = await backend.getAllTags();

  // Compute stats
  const totalWords = posts.reduce((sum, p) => sum + p.wordCount, 0);
  const avgReadingTime =
    posts.length > 0
      ? Math.round(
          posts.reduce((sum, p) => {
            const minutes = parseInt(p.readingTime || '0', 10);
            return sum + (isNaN(minutes) ? 0 : minutes);
          }, 0) / posts.length
        )
      : 0;

  // Posts per year
  const postsByYearMap = new Map<number, number>();
  posts.forEach(p => {
    const year = new Date(p.created).getFullYear();
    postsByYearMap.set(year, (postsByYearMap.get(year) || 0) + 1);
  });
  const postsByYear = Array.from(postsByYearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, count]) => ({ year: String(year), count }));

  // Tag frequency
  const tagCountMap = new Map<string, number>();
  posts.forEach(p =>
    p.tags.forEach(t => tagCountMap.set(t, (tagCountMap.get(t) || 0) + 1))
  );
  const tagData = Array.from(tagCountMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([tag, count]) => ({ tag, count }));

  // Word count by post (truncate long titles)
  const wordData = posts.map(p => ({
    name: p.title.length > 25 ? p.title.slice(0, 25) + '...' : p.title,
    words: p.wordCount,
  }));

  // Reading time distribution buckets
  const buckets = [
    { label: '1-3 min', min: 1, max: 3 },
    { label: '4-6 min', min: 4, max: 6 },
    { label: '7-10 min', min: 7, max: 10 },
    { label: '10+ min', min: 11, max: Infinity },
  ];
  const readingTimeDist = buckets.map(({ label, min, max }) => ({
    bucket: label,
    count: posts.filter(p => {
      const minutes = parseInt(p.readingTime || '0', 10);
      return !isNaN(minutes) && minutes >= min && minutes <= max;
    }).length,
  }));

  // Word count timeline (chronological)
  const wordTimeline = [...posts]
    .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
    .map(p => ({
      date: new Date(p.created).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      words: p.wordCount,
      title: p.title,
    }));

  // Posts table data
  const postsTableData = posts.map(p => ({
    slug: p.slug,
    title: p.title,
    created: p.created,
    wordCount: p.wordCount,
    readingTime: p.readingTime,
    tags: p.tags,
  }));

  return (
    <AdminSurface>
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminHero
          eyebrow="Content telemetry"
          title="Blog Analytics"
          description="Publishing cadence, topic distribution, reading depth, and content inventory health."
        />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SignalCard label="Total Posts" value={posts.length} description="Published MDX articles" icon={FileText} tone="blue" />
        <SignalCard label="Total Words" value={totalWords.toLocaleString()} description="Indexed article copy" icon={BookOpen} tone="violet" />
        <SignalCard label="Total Tags" value={tags.length} description="Unique topic labels" icon={Hash} tone="emerald" />
        <SignalCard label="Avg Reading Time" value={`${avgReadingTime} min`} description="Mean estimated read" icon={Clock} tone="amber" />
      </div>

      <Charts
        postsByYear={postsByYear}
        tagData={tagData}
        wordData={wordData}
        readingTimeDist={readingTimeDist}
        wordTimeline={wordTimeline}
      />

      <div className="mt-8">
        <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">All Posts</h2>
        <PostsTable posts={postsTableData} />
      </div>
      </div>
    </AdminSurface>
  );
}
