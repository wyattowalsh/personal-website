import { redirect } from 'next/navigation';
import { BackendService } from '@/lib/server';
import { validateAdminSession } from '@/app/admin/lib/auth';
import { Metadata } from 'next';
import { Charts } from './Charts';
import { PostsTable } from '../components/PostsTable';
import { AdminSurface } from '../components/AdminVisuals';
import { MetricCard } from '../components/MetricCard';
import { DashboardHeader } from '../components/DashboardHeader';
import { InsightCard } from '../components/InsightCard';
import { BookOpen, Clock, FileText, Hash, TrendingUp } from 'lucide-react';

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

  // Calculate additional insights
  const maxWordCount = Math.max(...posts.map(p => p.wordCount), 0);
  const minWordCount = Math.min(...posts.map(p => p.wordCount), 0);
  const avgWordCount = posts.length > 0 ? Math.round(totalWords / posts.length) : 0;
  const avgPostsPerYear = posts.length > 0 ? (postsByYear.length > 0 ? (posts.length / postsByYear.length).toFixed(1) : '0') : '0';

  // Get most popular tags
  const topTags = tagData.slice(0, 3).map(t => t.tag).join(', ') || 'None';

  // Newest and oldest posts
  const newestPost = posts.length > 0 ? new Date(posts[posts.length - 1].created).toLocaleDateString() : 'N/A';
  const oldestPost = posts.length > 0 ? new Date(posts[0].created).toLocaleDateString() : 'N/A';

  return (
    <AdminSurface>
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardHeader
          title="Blog Analytics"
          description="Publishing cadence, topic distribution, reading depth, and content inventory health."
          stats={[
            { label: 'Total Posts', value: posts.length, icon: <FileText className="size-4" /> },
            { label: 'Total Words', value: totalWords.toLocaleString(), icon: <BookOpen className="size-4" /> },
            { label: 'Avg Words/Post', value: avgWordCount.toLocaleString(), icon: <TrendingUp className="size-4" /> },
          ]}
        />

        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Posts"
            value={posts.length}
            description="Published MDX articles"
            icon={FileText}
            variant="accent"
          />
          <MetricCard
            label="Unique Tags"
            value={tags.length}
            description="Topic categorization"
            icon={Hash}
            variant="success"
          />
          <MetricCard
            label="Avg Reading Time"
            value={`${avgReadingTime}m`}
            description="Estimated read duration"
            icon={Clock}
            variant="warning"
          />
          <MetricCard
            label="Total Words"
            value={totalWords.toLocaleString()}
            description="Indexed article content"
            icon={BookOpen}
            variant="default"
          />
        </div>

        {/* Insights Section */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InsightCard
            type="insight"
            title="Top Tags"
            description={`Most frequently used: ${topTags}`}
            metric={`${tagData.length} total`}
          />
          <InsightCard
            type="action"
            title="Content Length"
            description={`Average post: ${avgWordCount.toLocaleString()} words (${minWordCount} – ${maxWordCount.toLocaleString()})`}
            metric={avgPostsPerYear}
          />
          <InsightCard
            type="insight"
            title="Publishing Timeline"
            description={`Oldest: ${oldestPost} • Newest: ${newestPost}`}
            metric={`${postsByYear.length} years`}
          />
        </div>

        {/* Charts */}
        <div>
          <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Content Metrics
          </h2>
          <Charts
            postsByYear={postsByYear}
            tagData={tagData}
            wordData={wordData}
            readingTimeDist={readingTimeDist}
            wordTimeline={wordTimeline}
          />
        </div>

        {/* Posts Table */}
        <div>
          <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            All Posts
          </h2>
          <PostsTable posts={postsTableData} />
        </div>
      </div>
    </AdminSurface>
  );
}
