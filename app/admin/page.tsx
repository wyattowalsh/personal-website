import { Metadata } from 'next';
import { AlertTriangle, CheckCircle2, Clock3, Database, ShieldAlert, TerminalSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn, formatDate } from '@/lib/utils';
import { validateAdminSession } from './lib/auth';
import { getAdminTelemetrySnapshot } from './lib/telemetry';
import { StatCard } from './components/StatCard';
import { ActivityCalendar } from './components/ActivityCalendar';
import { TelemetryAutoRefresh } from './components/TelemetryAutoRefresh';

export const metadata: Metadata = {
  title: 'Admin Telemetry',
  robots: { index: false, follow: false },
};

function formatDuration(durationMs: number | null): string {
  if (durationMs == null) return 'n/a';
  if (durationMs < 1000) return `${durationMs} ms`;
  return `${(durationMs / 1000).toFixed(1)} s`;
}

function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return 'No recorded run';

  const elapsedMs = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.max(1, Math.round(elapsedMs / (1000 * 60)));
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function statusBadgeClass(status: 'healthy' | 'degraded') {
  return status === 'healthy'
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300';
}

function logBadgeClass(level: string) {
  if (level === 'error') return 'border-destructive/20 bg-destructive/10 text-destructive';
  if (level === 'warning') return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  if (level === 'success') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  return 'border-border bg-muted text-muted-foreground';
}

function statusRowTone(isPositive: boolean) {
  return isPositive
    ? 'text-emerald-700 dark:text-emerald-300'
    : 'text-amber-700 dark:text-amber-300';
}

export default async function AdminPage() {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) {
    return null;
  }

  const telemetry = await getAdminTelemetrySnapshot();
  const daysSinceLastPost = telemetry.overview.daysSinceLastPost;

  const freshnessVariant =
    daysSinceLastPost === null
      ? 'secondary'
      : daysSinceLastPost < 14
      ? 'default'
      : daysSinceLastPost < 30
        ? 'secondary'
        : 'destructive';

  const today = formatDate(new Date().toISOString().slice(0, 10));
  const lastRunLabel = formatRelativeTime(telemetry.preprocess.lastRunAt);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn('border', statusBadgeClass(telemetry.status))}>
              {telemetry.status === 'healthy' ? 'Telemetry healthy' : 'Telemetry degraded'}
            </Badge>
            <Badge variant="outline">{today}</Badge>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-balance">Telemetry</h1>
            <p className="max-w-3xl text-sm text-muted-foreground text-pretty">
              Runtime health, preprocess cadence, auth pressure, and publishing activity in one admin surface.
            </p>
          </div>
        </div>
        <TelemetryAutoRefresh />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-balance">
                {telemetry.status === 'healthy' ? <CheckCircle2 className="size-5 text-emerald-500" /> : <AlertTriangle className="size-5 text-amber-500" />}
                Operations snapshot
              </CardTitle>
              <p className="text-sm text-muted-foreground text-pretty">
                Last preprocess {lastRunLabel}. Search index and admin controls are currently {telemetry.status === 'healthy' ? 'stable' : 'under watch'}.
              </p>
            </div>
            <div className="grid min-w-0 gap-2 sm:min-w-52">
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">Uptime</p>
                <p className="text-lg font-semibold tabular-nums">{Math.floor(telemetry.system.uptimeSeconds / 3600)}h</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">Heap in use</p>
                <p className="text-lg font-semibold tabular-nums">{telemetry.system.heapUsedMb} MB</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Preprocess window</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{formatDuration(telemetry.preprocess.durationMs)}</p>
                <p className="mt-1 text-xs text-muted-foreground text-pretty">Latest full content scan duration.</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Auth pressure</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{telemetry.security.totalBlockedAttempts}</p>
                <p className="mt-1 text-xs text-muted-foreground text-pretty">Blocked attempts in the active in-memory limiter window.</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Publishing freshness</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{daysSinceLastPost === null ? 'n/a' : `${daysSinceLastPost}d`}</p>
                <p className="mt-1 text-xs text-muted-foreground text-pretty">Days since the most recent published post.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Signal quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/20 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Content freshness</p>
                <p className="text-xs text-muted-foreground text-pretty">Posts in the last 30 days: {telemetry.overview.postsLast30Days}</p>
              </div>
              <Badge variant={freshnessVariant}>
                {daysSinceLastPost === null
                  ? 'No posts yet'
                  : daysSinceLastPost === 0
                    ? 'Published today'
                    : `${daysSinceLastPost} day${daysSinceLastPost === 1 ? '' : 's'}`}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-lg border border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">Warnings in buffer</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{telemetry.overview.recentWarnings}</p>
              </div>
              <div className="rounded-lg border border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">Errors in buffer</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{telemetry.overview.recentErrors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Search Index"
          value={telemetry.overview.searchIndexSize}
          icon="activity"
          description="Indexed documents ready for search"
          tone="success"
        />
        <StatCard
          label="Last Preprocess"
          value={formatDuration(telemetry.overview.preprocessDurationMs)}
          icon="gauge"
          description="Latest content pipeline duration"
        />
        <StatCard
          label="Warnings"
          value={telemetry.overview.recentWarnings}
          icon="alertTriangle"
          description="Recent warning signals in memory"
          tone={telemetry.overview.recentWarnings > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Rate-Limited IPs"
          value={telemetry.security.limitedKeys}
          icon="shield"
          description="Limiter keys currently over budget"
          tone={telemetry.security.limitedKeys > 0 ? 'danger' : 'default'}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-balance">System board</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <Database className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Preprocess pipeline</p>
                    <p className="text-xs text-muted-foreground">Last run {lastRunLabel}</p>
                  </div>
                </div>
                <Badge variant="outline" className={statusRowTone(telemetry.preprocess.ready && telemetry.preprocess.errors === 0)}>
                  {telemetry.preprocess.inFlight ? 'Running' : telemetry.preprocess.ready ? 'Ready' : 'Cold'}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <Clock3 className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Memory footprint</p>
                    <p className="text-xs text-muted-foreground">RSS {telemetry.system.rssMb} MB / heap total {telemetry.system.heapTotalMb} MB</p>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums">{telemetry.system.heapUsedMb} MB</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <TerminalSquare className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Recent signal buffer</p>
                    <p className="text-xs text-muted-foreground">Warnings + errors captured in-memory for admin review</p>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums">{telemetry.overview.recentWarnings + telemetry.overview.recentErrors}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Auth limiter</p>
                    <p className="text-xs text-muted-foreground">{telemetry.security.maxAttempts} attempts every {telemetry.security.windowMinutes} minutes</p>
                  </div>
                </div>
                <Badge variant="outline" className={statusRowTone(telemetry.security.limitedKeys === 0)}>
                  {telemetry.security.limitedKeys === 0 ? 'Quiet' : `${telemetry.security.limitedKeys} hot`}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-balance">Recent signal feed</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80 pr-4">
                <div className="space-y-3">
                  {telemetry.recent.logs.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground text-pretty">No recent runtime signals have been captured yet.</p>
                    </div>
                  ) : telemetry.recent.logs.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-border px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn('capitalize', logBadgeClass(entry.level))}>
                          {entry.level}
                        </Badge>
                        {entry.source ? <Badge variant="secondary">{entry.source}</Badge> : null}
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(entry.timestamp)}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-pretty">{entry.message}</p>
                      {entry.data ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground text-pretty">{entry.data}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-balance">Security watch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-lg border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">Tracked keys</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">{telemetry.security.trackedKeys}</p>
                </div>
                <div className="rounded-lg border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">Limited keys</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">{telemetry.security.limitedKeys}</p>
                </div>
                <div className="rounded-lg border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">Blocked attempts</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">{telemetry.security.totalBlockedAttempts}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Hot limiter keys</p>
                  <p className="text-xs text-muted-foreground">Newest buckets with remaining capacity and block counts.</p>
                </div>
                {telemetry.security.recentRateLimits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active limiter keys.</p>
                ) : telemetry.security.recentRateLimits.map((entry) => (
                  <div key={entry.key} className="rounded-lg border border-border px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">{entry.key}</p>
                      <Badge variant={entry.isLimited ? 'destructive' : 'outline'}>
                        {entry.isLimited ? 'Limited' : 'Watching'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground tabular-nums">
                      {entry.count} attempts, {entry.remaining} remaining, {entry.blockedCount} blocked
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Last seen {formatRelativeTime(entry.lastSeenAt)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Recent auth events</p>
                  <p className="text-xs text-muted-foreground">Successful and rejected login attempts captured by the admin auth route.</p>
                </div>
                {telemetry.security.recentAuthEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent auth events.</p>
                ) : telemetry.security.recentAuthEvents.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('capitalize', logBadgeClass(entry.level))}>{entry.level}</Badge>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(entry.timestamp)}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-pretty">{entry.message}</p>
                    {entry.data ? <p className="mt-1 text-xs text-muted-foreground">{entry.data}</p> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-balance">Publishing cadence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-lg border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">Published posts</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">{telemetry.overview.totalPosts}</p>
                </div>
                <div className="rounded-lg border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">Total words</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">{telemetry.overview.totalWords.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">Avg reading time</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">{telemetry.overview.avgReadingMinutes} min</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {telemetry.recent.posts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No published posts yet.</p>
                ) : telemetry.recent.posts.map((post) => (
                  <div key={post.slug} className="rounded-lg border border-border px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{post.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(post.created)}</p>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">{post.wordCount.toLocaleString()} words</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Publishing heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityCalendar
              posts={telemetry.recent.calendar}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Telemetry notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-border px-4 py-3">
              <p className="font-medium text-foreground">What this surface covers</p>
              <p className="mt-1 text-pretty">In-repo observability only: preprocess cadence, runtime memory, auth pressure, recent logs, and publishing freshness.</p>
            </div>
            <div className="rounded-lg border border-border px-4 py-3">
              <p className="font-medium text-foreground">What is intentionally excluded</p>
              <p className="mt-1 text-pretty">External analytics and durable historical metrics are still outside this first pass, so this view behaves like a live operations console rather than a long-term BI dashboard.</p>
            </div>
            <div className="rounded-lg border border-border px-4 py-3">
              <p className="font-medium text-foreground">Current readiness</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">Search index {telemetry.preprocess.ready ? 'ready' : 'cold'}</Badge>
                <Badge variant="outline">Cache slots {telemetry.preprocess.cache.taggedPostsCached}</Badge>
                <Badge variant="outline">Tags {telemetry.overview.totalTags}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
