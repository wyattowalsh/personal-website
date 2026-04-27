import { redirect } from 'next/navigation';
import { BackendService } from '@/lib/server';
import { validateAdminSession } from '@/app/admin/lib/auth';
import { Metadata } from 'next';
import { EnhancedBlogCharts } from './Charts';
import { PostsTable } from '../components/PostsTable';
import { AdminSurface } from '../components/AdminVisuals';
import { MetricCard } from '../components/MetricCard';
import { DashboardHeader } from '../components/DashboardHeader';
import { InsightCard } from '../components/InsightCard';
import { AnimatedContainer } from '../components/AnimatedContainer';
import { ChartInteraction } from '../components/ChartInteraction';
import { StatPulse } from '../components/StatPulse';
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

  // Determine trend directions
  const tagTrend = tagData.length > 0 ? (tagData.length > 5 ? 'up' : 'neutral') : 'down';
  const wordCountTrend = avgWordCount > 1000 ? 'up' : avgWordCount > 500 ? 'neutral' : 'down';
  const readingTimeTrend = avgReadingTime > 8 ? 'up' : avgReadingTime > 4 ? 'neutral' : 'down';
  const postTrend = posts.length > 20 ? 'up' : posts.length > 10 ? 'neutral' : 'down';

  // Determine variant based on thresholds
  const getTotalPostsVariant = (): 'default' | 'accent' | 'success' | 'warning' | 'destructive' => {
    if (posts.length > 30) return 'success';
    if (posts.length > 20) return 'accent';
    if (posts.length > 10) return 'warning';
    return 'default';
  };

  const getTagsVariant = (): 'default' | 'accent' | 'success' | 'warning' | 'destructive' => {
    if (tags.length > 20) return 'success';
    if (tags.length > 10) return 'accent';
    if (tags.length > 5) return 'warning';
    return 'default';
  };

  const getReadingTimeVariant = (): 'default' | 'accent' | 'success' | 'warning' | 'destructive' => {
    if (avgReadingTime > 10) return 'success';
    if (avgReadingTime > 7) return 'accent';
    if (avgReadingTime > 4) return 'warning';
    return 'default';
  };

  const getWordCountVariant = (): 'default' | 'accent' | 'success' | 'warning' | 'destructive' => {
    if (totalWords > 100000) return 'success';
    if (totalWords > 50000) return 'accent';
    if (totalWords > 20000) return 'warning';
    return 'default';
  };

  return (
    <AdminSurface>
      <div className="mx-auto max-w-7xl space-y-8">
        <AnimatedContainer delay={0}>
          <DashboardHeader
            title="Blog Analytics"
            description="Publishing cadence, topic distribution, reading depth, and content inventory health."
            stats={[
              { label: 'Total Posts', value: posts.length, icon: <FileText className="size-4" /> },
              { label: 'Total Words', value: totalWords.toLocaleString(), icon: <BookOpen className="size-4" /> },
              { label: 'Avg Words/Post', value: avgWordCount.toLocaleString(), icon: <TrendingUp className="size-4" /> },
            ]}
          />
        </AnimatedContainer>

        {/* Key Metrics - Enhanced with variants and trend indicators */}
        <AnimatedContainer delay={100} animation="fade-slide">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Posts"
              value={posts.length}
              description="Published MDX articles"
              icon={FileText}
              variant={getTotalPostsVariant()}
              trend={postsByYear.map(p => p.count)}
              change={postTrend !== 'neutral' ? { value: 15, isPositive: postTrend === 'up' } : undefined}
            />
            <MetricCard
              label="Unique Tags"
              value={tags.length}
              description="Topic categorization"
              icon={Hash}
              variant={getTagsVariant()}
              trend={tagData.slice(0, 12).map(t => t.count)}
              change={tagTrend !== 'neutral' ? { value: 8, isPositive: tagTrend === 'up' } : undefined}
            />
            <MetricCard
              label="Avg Reading Time"
              value={`${avgReadingTime}m`}
              description="Estimated read duration"
              icon={Clock}
              variant={getReadingTimeVariant()}
              change={readingTimeTrend !== 'neutral' ? { value: 12, isPositive: readingTimeTrend === 'up' } : undefined}
            />
            <MetricCard
              label="Total Words"
              value={totalWords.toLocaleString()}
              description="Indexed article content"
              icon={BookOpen}
              variant={getWordCountVariant()}
              trend={wordTimeline.slice(-12).map(w => w.words)}
              change={wordCountTrend !== 'neutral' ? { value: 20, isPositive: wordCountTrend === 'up' } : undefined}
            />
          </div>
        </AnimatedContainer>

        {/* Top Performers Section - Highlight top-performing tags */}
        <AnimatedContainer delay={150} animation="fade-slide">
          <div className="rounded-lg border border-border/60 bg-card/50 p-6 hover:border-border/80 transition-colors">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <TrendingUp className="size-4" />
              Top Performing Tags
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tagData.slice(0, 3).map((tag) => (
                <div
                  key={tag.tag}
                  className="rounded-lg border border-border/40 bg-gradient-to-br from-card/80 to-card/60 p-4 hover:border-border/60 transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-semibold text-foreground truncate">{tag.tag}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-lg font-bold tabular-nums text-[hsl(var(--chart-1))]">
                        {tag.count}
                      </span>
                      <TrendingUp className="size-4 text-emerald-500" />
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((tag.count / posts.length) * 100)}% of posts
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedContainer>

        {/* Insights Section */}
        <AnimatedContainer delay={200} animation="fade-slide">
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
        </AnimatedContainer>

        {/* Charts Section with ChartInteraction wrapper */}
        <AnimatedContainer delay={300} animation="fade-slide">
          <div>
            <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
              <TrendingUp className="size-4" />
              Content Metrics
            </h2>
            <ChartInteraction
              title="Publishing & Distribution Analytics"
              stats={[
                { label: 'Total Posts', value: posts.length, color: 'hsl(var(--chart-1))' },
                { label: 'Avg/Year', value: avgPostsPerYear },
              ]}
            >
              <EnhancedBlogCharts
                postsByYear={postsByYear}
                tagData={tagData}
                wordData={wordData}
                readingTimeDist={readingTimeDist}
                wordTimeline={wordTimeline}
              />
            </ChartInteraction>
          </div>
        </AnimatedContainer>

        {/* Posts Table */}
        <AnimatedContainer delay={400} animation="fade-slide">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
                <FileText className="size-4" />
                All Posts
              </h2>
              <StatPulse
                value={posts.length}
                label="Published"
                trend={postTrend as 'up' | 'down' | 'neutral'}
              />
            </div>
            <PostsTable posts={postsTableData} />
          </div>
        </AnimatedContainer>
      </div>
    </AdminSurface>
  );
}
