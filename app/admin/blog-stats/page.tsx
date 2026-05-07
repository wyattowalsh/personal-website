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
import { ExportButton } from '../components/ExportButton';
import { BarChart3, FileText, Tags } from 'lucide-react';
import { buildBlogStatsSummary, getInventoryChange, getInventoryTrend } from './summary';

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

  const summary = buildBlogStatsSummary(posts, tags);
  const {
    avgPostsPerYear,
    avgReadingTime,
    avgWordCount,
    maxWordCount,
    minWordCount,
    newestPost,
    oldestPost,
    postsByYear,
    postsTableData,
    readingTimeDist,
    tagData,
    topTags,
    totalWords,
    wordData,
    wordTimeline,
  } = summary;

  const inventoryTrend = getInventoryTrend();

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
              { label: 'Total Posts', value: posts.length, iconName: 'file-text' },
              { label: 'Total Words', value: totalWords.toLocaleString(), iconName: 'book-open' },
              { label: 'Avg Words/Post', value: avgWordCount.toLocaleString(), iconName: 'trending-up' },
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
              iconName="file-text"
              variant={getTotalPostsVariant()}
              trend={postsByYear.map(p => p.count)}
              change={getInventoryChange()}
            />
            <MetricCard
              label="Unique Tags"
              value={tags.length}
              description="Topic categorization"
              iconName="hash"
              variant={getTagsVariant()}
              trend={tagData.slice(0, 12).map(t => t.count)}
              change={getInventoryChange()}
            />
            <MetricCard
              label="Avg Reading Time"
              value={`${avgReadingTime}m`}
              description="Estimated read duration"
              iconName="clock"
              variant={getReadingTimeVariant()}
              change={getInventoryChange()}
            />
            <MetricCard
              label="Total Words"
              value={totalWords.toLocaleString()}
              description="Indexed article content"
              iconName="book-open"
              variant={getWordCountVariant()}
              trend={wordTimeline.slice(-12).map(w => w.words)}
              change={getInventoryChange()}
            />
          </div>
        </AnimatedContainer>

        {/* Topic Distribution Section */}
        <AnimatedContainer delay={150} animation="fade-slide">
          <div className="rounded-lg border border-border/60 bg-card/50 p-6 hover:border-border/80 transition-colors">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Tags aria-hidden="true" className="size-4" />
              Topic Distribution
            </h2>
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
              <BarChart3 aria-hidden="true" className="size-4" />
              Content Metrics
            </h2>
            <ChartInteraction
              title="Publishing & Distribution Analytics"
              summary={`Publishing analytics charts covering ${postsByYear.length} years, ${tagData.length} tags, and ${wordTimeline.length} posts.`}
              dataDescription={{
                caption: 'Publishing and distribution chart values',
                rows: [
                  ...postsByYear.map((row) => ({ label: `Posts in ${row.year}`, value: row.count })),
                  ...tagData.slice(0, 8).map((row) => ({ label: `Tag ${row.tag}`, value: row.count })),
                  ...wordData.map((row) => ({ label: `Words in ${row.name}`, value: row.words })),
                  ...readingTimeDist.slice(0, 6).map((row) => ({ label: `Reading time ${row.bucket}`, value: row.count })),
                  ...wordTimeline.map((row) => ({ label: row.date, value: `${row.words} words`, detail: row.title })),
                ],
              }}
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
                <FileText aria-hidden="true" className="size-4" />
                All Posts
              </h2>
              <StatPulse
                value={posts.length}
                label="Published"
                trend={inventoryTrend}
              />
              <ExportButton
                data={postsTableData}
                filename={`blog-stats-posts-${new Date().toISOString().slice(0, 10)}.csv`}
                label="Export posts"
              />
            </div>
            <PostsTable posts={postsTableData} />
          </div>
        </AnimatedContainer>
      </div>
    </AdminSurface>
  );
}
