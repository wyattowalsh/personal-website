import { Metadata } from 'next';
import { BarChart3, ExternalLink, Eye, MousePointerClick, Search, UsersRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { validateAdminSession } from './lib/auth';
import { getVisitorAnalyticsSnapshot, type AnalyticsRow } from './lib/visitor-analytics';

export const metadata: Metadata = {
  title: 'Admin Analytics',
  robots: { index: false, follow: false },
};

const metricIcons = [UsersRound, BarChart3, Eye, MousePointerClick] as const;

function formatGeneratedAt(timestamp: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function AnalyticsList({
  title,
  rows,
  emptyLabel,
  icon: Icon,
}: {
  title: string;
  rows: AnalyticsRow[];
  emptyLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState label={emptyLabel} />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={`${row.label}-${row.detail ?? ''}`} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.label}</p>
                  {row.detail && <p className="text-xs text-muted-foreground">{row.detail}</p>}
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SetupState({ missingEnv }: { missingEnv: string[] }) {
  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="text-base">PostHog setup required</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          The dashboard is wired for anonymous PostHog analytics, but production still needs the
          PostHog project values in Vercel before real visitor data can appear here.
        </p>
        <div>
          <p className="mb-2 font-medium text-foreground">Missing environment variables</p>
          <div className="flex flex-wrap gap-2">
            {missingEnv.map((name) => (
              <Badge key={name} variant="outline" className="font-mono">
                {name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground">
          <p>vercel env add NEXT_PUBLIC_POSTHOG_TOKEN production</p>
          <p>vercel env add NEXT_PUBLIC_POSTHOG_HOST production</p>
          <p>vercel env add POSTHOG_PERSONAL_API_KEY production</p>
          <p>vercel env add POSTHOG_PROJECT_ID production</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminPage() {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) {
    return null;
  }

  const analytics = await getVisitorAnalyticsSnapshot();
  const isConfigured = analytics.status === 'configured';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border border-primary/20 bg-primary/10 text-primary">
              {isConfigured ? 'Visitor analytics live' : 'Analytics setup'}
            </Badge>
            <Badge variant="outline">Last {analytics.windowDays} days</Badge>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-balance">Visitor Analytics</h1>
            <p className="max-w-3xl text-sm text-muted-foreground text-pretty">
              Anonymous traffic, content engagement, search behavior, shares, outbound clicks, and reading progress.
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Updated {formatGeneratedAt(analytics.generatedAt)}
        </div>
      </div>

      {analytics.status === 'missing_config' && <SetupState missingEnv={analytics.missingEnv} />}

      {analytics.status === 'error' && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base">Analytics query failed</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {analytics.error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analytics.overview.map((metric, index) => {
          const Icon = metricIcons[index] ?? BarChart3;
          return (
            <Card key={metric.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-semibold tabular-nums">{metric.value}</p>
                  <p className="text-xs text-muted-foreground text-pretty">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsList
          title="Top Pages"
          rows={analytics.topPages}
          emptyLabel="No pageviews have been captured yet."
          icon={BarChart3}
        />
        <AnalyticsList
          title="Referrers"
          rows={analytics.referrers}
          emptyLabel="No referrer data is available yet."
          icon={ExternalLink}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <AnalyticsList
          title="Devices"
          rows={analytics.devices}
          emptyLabel="No device categories have been captured yet."
          icon={Eye}
        />
        <AnalyticsList
          title="Interactions"
          rows={analytics.interactions}
          emptyLabel="No interaction events have been captured yet."
          icon={MousePointerClick}
        />
        <AnalyticsList
          title="Searches"
          rows={analytics.searches}
          emptyLabel="No site searches have been captured yet."
          icon={Search}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsList
          title="Outbound Links"
          rows={analytics.outboundLinks}
          emptyLabel="No outbound link clicks have been captured yet."
          icon={ExternalLink}
        />
        <AnalyticsList
          title="Reading Progress"
          rows={analytics.readingProgress}
          emptyLabel="No reading-progress milestones have been captured yet."
          icon={BarChart3}
        />
      </div>

      <Separator />

      <p className="text-xs text-muted-foreground text-pretty">
        Visitor analytics are anonymous. The admin dashboard reads aggregate event data from PostHog with a server-only API key.
      </p>
    </div>
  );
}
