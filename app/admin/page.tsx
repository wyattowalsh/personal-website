import { redirect } from 'next/navigation';
import { BackendService } from '@/lib/server';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { validateAdminSession } from './lib/auth';
import { StatCard } from './components/StatCard';
import { ActivityCalendar } from './components/ActivityCalendar';
import { RecentPostsList } from './components/RecentPostsList';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) {
    // Can't redirect to /admin (would loop); redirect to site root instead.
    // The layout's client-side auth check shows the login form at /admin.
    redirect('/');
  }

  await BackendService.ensurePreprocessed();
  const backend = BackendService.getInstance();
  const posts = await backend.getAllPosts();

  // Compute stats
  const totalPosts = posts.length;
  const totalWords = posts.reduce((sum, p) => sum + (p.wordCount ?? 0), 0);
  const allTags = new Set(posts.flatMap((p) => p.tags ?? []));
  const totalTags = allTags.size;

  const avgReadingMinutes =
    totalPosts > 0
      ? Math.round(
          posts.reduce((sum, p) => {
            const match = p.readingTime?.match(/(\d+)/);
            return sum + (match ? parseInt(match[1], 10) : 0);
          }, 0) / totalPosts,
        )
      : 0;

  // Days since last post
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
  );
  const lastPostDate = sortedPosts[0]?.created;
  const daysSinceLastPost = lastPostDate
    ? Math.floor(
        (Date.now() - new Date(lastPostDate).getTime()) / (1000 * 60 * 60 * 24), // eslint-disable-line react-hooks/purity -- server component, Date.now() is safe
      )
    : 0;

  const freshnessVariant =
    daysSinceLastPost < 14
      ? 'default'
      : daysSinceLastPost < 30
        ? 'secondary'
        : 'destructive';

  const freshnessColor =
    daysSinceLastPost >= 14 && daysSinceLastPost < 30 ? 'text-yellow-600' : '';

  const today = formatDate(new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">{today}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Posts"
          value={totalPosts}
          icon="fileText"
          description="Published articles"
        />
        <StatCard
          label="Total Words"
          value={totalWords}
          icon="bookOpen"
          description="Across all posts"
        />
        <StatCard
          label="Tags"
          value={totalTags}
          icon="hash"
          description="Unique categories"
        />
        <StatCard
          label="Avg. Reading Time"
          value={`${avgReadingMinutes} min`}
          icon="clock"
          description="Per article"
        />
      </div>

      {/* Content Freshness */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Content Freshness</span>
        <Badge variant={freshnessVariant} className={freshnessColor}>
          {daysSinceLastPost === 0
            ? 'Published today'
            : `${daysSinceLastPost} day${daysSinceLastPost === 1 ? '' : 's'} since last post`}
        </Badge>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentPostsList
          posts={sortedPosts.map((p) => ({
            slug: p.slug,
            title: p.title,
            created: p.created,
            wordCount: p.wordCount ?? 0,
            tags: p.tags ?? [],
          }))}
        />
        <Card>
          <CardHeader>
            <CardTitle>Post Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityCalendar
              posts={posts.map((p) => ({ created: p.created, title: p.title }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
