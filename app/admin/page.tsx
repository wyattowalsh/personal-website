import { Metadata } from 'next';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Eye,
  Gauge,
  MousePointerClick,
  Search,
  Settings2,
  ShieldCheck,
  Siren,
  UsersRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { validateAdminSession } from './lib/auth';
import {
  getAdminDashboardSnapshot,
  type AdminProviderSnapshot,
} from './lib/free-admin-dashboard';
import type { AnalyticsMetric, AnalyticsRow, VisitorAnalyticsSnapshot } from './lib/visitor-analytics';

export const metadata: Metadata = {
  title: 'Admin Intelligence',
  robots: { index: false, follow: false },
};

export const maxDuration = 60;

const visitorMetricIcons = [UsersRound, BarChart3, Eye, MousePointerClick] as const;

function formatGeneratedAt(timestamp: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function statusLabel(provider: Pick<AdminProviderSnapshot, 'status'>): string {
  switch (provider.status) {
    case 'configured':
      return 'Live';
    case 'partial':
      return 'Partial';
    case 'missing_config':
      return 'Setup';
    case 'error':
      return 'Error';
  }
}

function statusVariant(provider: Pick<AdminProviderSnapshot, 'status'>): 'default' | 'outline' | 'destructive' | 'secondary' {
  switch (provider.status) {
    case 'configured':
      return 'default';
    case 'partial':
      return 'secondary';
    case 'missing_config':
      return 'outline';
    case 'error':
      return 'destructive';
  }
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function MetricGrid({
  metrics,
  icons,
}: {
  metrics: AnalyticsMetric[];
  icons?: readonly React.ComponentType<{ className?: string }>[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = icons?.[index] ?? BarChart3;
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
  );
}

function DataList({
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
              <div key={`${title}-${row.label}-${row.detail ?? ''}`} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.label}</p>
                  {row.detail && <p className="text-xs text-muted-foreground text-pretty">{row.detail}</p>}
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

function ProviderCard({ provider }: { provider: AdminProviderSnapshot }) {
  const isExternalSource = provider.sourceUrl.startsWith('http');

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{provider.title}</CardTitle>
            <p className="text-xs text-muted-foreground text-pretty">{provider.freeTier}</p>
          </div>
          <Badge variant={statusVariant(provider)}>{statusLabel(provider)}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Updated {formatGeneratedAt(provider.lastCheckedAt)}</Badge>
          {isExternalSource && (
            <a
              href={provider.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 hover:text-primary"
            >
              Source
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {provider.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {provider.error}
          </div>
        )}

        {provider.missingEnv.length > 0 && (
          <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex flex-wrap gap-2">
              {provider.missingEnv.map((name) => (
                <Badge key={name} variant="outline" className="font-mono">
                  {name}
                </Badge>
              ))}
            </div>
            {provider.setupSteps.length > 0 && (
              <div className="rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground">
                {provider.setupSteps.map((step) => (
                  <p key={step}>{step}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {provider.cards.length > 0 && <MetricGrid metrics={provider.cards} />}

        <DataList
          title={`${provider.title} Details`}
          rows={provider.rows}
          emptyLabel={provider.status === 'missing_config' ? 'Add the missing free-service env vars to activate this panel.' : 'No rows returned.'}
          icon={Activity}
        />
      </CardContent>
    </Card>
  );
}

function VisitorsSection({ analytics }: { analytics: VisitorAnalyticsSnapshot }) {
  return (
    <div className="space-y-6">
      {analytics.status === 'missing_config' && (
        <ProviderCard
          provider={{
            id: 'posthog',
            title: 'PostHog',
            status: 'missing_config',
            lastCheckedAt: analytics.generatedAt,
            freeTier: 'Free tier includes product analytics, web analytics, and API access within monthly limits',
            missingEnv: analytics.missingEnv,
            setupSteps: analytics.missingEnv.map((name) => `vercel env add ${name} production`),
            sourceUrl: 'https://posthog.com/pricing',
            cards: [],
            rows: [],
          }}
        />
      )}

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

      <MetricGrid metrics={analytics.overview} icons={visitorMetricIcons} />

      <div className="grid gap-4 xl:grid-cols-2">
        <DataList title="Top Pages" rows={analytics.topPages} emptyLabel="No pageviews have been captured yet." icon={BarChart3} />
        <DataList title="Referrers" rows={analytics.referrers} emptyLabel="No referrer data is available yet." icon={ExternalLink} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DataList title="Devices" rows={analytics.devices} emptyLabel="No device categories have been captured yet." icon={Eye} />
        <DataList title="Interactions" rows={analytics.interactions} emptyLabel="No interaction events have been captured yet." icon={MousePointerClick} />
        <DataList title="Searches" rows={analytics.searches} emptyLabel="No site searches have been captured yet." icon={Search} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DataList title="Outbound Links" rows={analytics.outboundLinks} emptyLabel="No outbound link clicks have been captured yet." icon={ExternalLink} />
        <DataList title="Reading Progress" rows={analytics.readingProgress} emptyLabel="No reading-progress milestones have been captured yet." icon={BarChart3} />
      </div>
    </div>
  );
}

function ProviderSection({ providers }: { providers: AdminProviderSnapshot[] }) {
  return (
    <div className="space-y-6">
      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
}

function SetupSection({ providers }: { providers: AdminProviderSnapshot[] }) {
  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <Card key={provider.id}>
          <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{provider.title}</p>
                <Badge variant={statusVariant(provider)}>{statusLabel(provider)}</Badge>
              </div>
              <p className="text-sm text-muted-foreground text-pretty">{provider.freeTier}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {provider.missingEnv.length === 0 ? (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="size-3" />
                  No missing vars
                </Badge>
              ) : (
                provider.missingEnv.map((name) => (
                  <Badge key={name} variant="outline" className="font-mono">
                    {name}
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function AdminPage() {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) {
    return null;
  }

  const dashboard = await getAdminDashboardSnapshot();
  const providers = [
    ...dashboard.growth,
    ...dashboard.performance,
    ...dashboard.operations,
    dashboard.contentHealth,
  ];
  const configuredCount = providers.filter((provider) => provider.status === 'configured').length;
  const needsSetupCount = providers.filter((provider) => provider.status === 'missing_config').length;
  const errorCount = providers.filter((provider) => provider.status === 'error').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border border-primary/20 bg-primary/10 text-primary">Free admin intelligence</Badge>
            <Badge variant="outline">Last {dashboard.visitors.windowDays} visitor days</Badge>
            <Badge variant="outline">{configuredCount} live</Badge>
            {needsSetupCount > 0 && <Badge variant="secondary">{needsSetupCount} setup</Badge>}
            {errorCount > 0 && <Badge variant="destructive">{errorCount} errors</Badge>}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-balance">Admin Intelligence</h1>
            <p className="max-w-3xl text-sm text-muted-foreground text-pretty">
              Visitor behavior, search growth, performance, deploy health, uptime, and content quality from free services and local checks.
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Updated {formatGeneratedAt(dashboard.generatedAt)}
        </div>
      </div>

      <Tabs defaultValue="visitors" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          <TabsTrigger value="visitors" className="gap-2"><UsersRound className="size-4" />Visitors</TabsTrigger>
          <TabsTrigger value="growth" className="gap-2"><Search className="size-4" />Growth</TabsTrigger>
          <TabsTrigger value="performance" className="gap-2"><Gauge className="size-4" />Performance</TabsTrigger>
          <TabsTrigger value="operations" className="gap-2"><Siren className="size-4" />Operations</TabsTrigger>
          <TabsTrigger value="content" className="gap-2"><ShieldCheck className="size-4" />Content</TabsTrigger>
          <TabsTrigger value="setup" className="gap-2"><Settings2 className="size-4" />Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="visitors">
          <VisitorsSection analytics={dashboard.visitors} />
        </TabsContent>

        <TabsContent value="growth">
          <ProviderSection providers={dashboard.growth} />
        </TabsContent>

        <TabsContent value="performance">
          <ProviderSection providers={dashboard.performance} />
        </TabsContent>

        <TabsContent value="operations">
          <ProviderSection providers={dashboard.operations} />
        </TabsContent>

        <TabsContent value="content">
          <ProviderCard provider={dashboard.contentHealth} />
        </TabsContent>

        <TabsContent value="setup">
          <SetupSection providers={providers} />
        </TabsContent>
      </Tabs>

      <Separator />

      <p className="text-xs text-muted-foreground text-pretty">
        Secrets stay server-only. Panels either read anonymous aggregate data, free provider APIs, or local repository content; missing optional services render setup steps instead of blocking the dashboard.
      </p>
    </div>
  );
}
