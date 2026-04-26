import { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  CircleDot,
  ExternalLink,
  Eye,
  Gauge,
  MousePointerClick,
  Radar,
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
import {
  DonutBreakdown,
  EngagementMatrix,
  RankedBarChart,
  ScoreRadials,
  StatusTimeline,
  TrafficAreaChart,
} from './components/AdminCharts';
import {
  AdminHero,
  AdminSurface,
  CyberPanel,
  ProviderSignalStrip,
  SignalCard,
  SourceLink,
  StatusPill,
} from './components/AdminVisuals';
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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function MetricGrid({
  metrics,
  icons,
}: {
  metrics: AnalyticsMetric[];
  icons?: readonly LucideIcon[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = icons?.[index] ?? BarChart3;
        return (
          <SignalCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            description={metric.description}
            icon={Icon}
            tone={index === 1 ? 'violet' : index === 2 ? 'emerald' : index === 3 ? 'amber' : 'blue'}
          />
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
  icon: LucideIcon;
}) {
  return (
    <CyberPanel title={title} icon={Icon}>
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
    </CyberPanel>
  );
}

function ProviderCard({ provider }: { provider: AdminProviderSnapshot }) {
  const isExternalSource = provider.sourceUrl.startsWith('http');

  return (
    <Card className="overflow-hidden border-border/80 bg-card/80">
      <CardHeader className="space-y-3 border-b border-border/70 bg-muted/20 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{provider.title}</CardTitle>
            <p className="text-xs text-muted-foreground text-pretty">{provider.freeTier}</p>
          </div>
          <StatusPill status={provider.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">Updated {formatGeneratedAt(provider.lastCheckedAt)}</Badge>
          {isExternalSource && <SourceLink href={provider.sourceUrl} />}
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

        {provider.id === 'pagespeed-crux' && provider.cards.length > 0 ? (
          <ScoreRadials metrics={provider.cards} />
        ) : provider.cards.length > 0 ? (
          <MetricGrid metrics={provider.cards} />
        ) : null}

        {provider.id === 'vercel' || provider.id === 'github' || provider.id === 'uptimerobot' ? (
          <CyberPanel title={`${provider.title} Timeline`} icon={Activity}>
            <StatusTimeline rows={provider.rows} />
          </CyberPanel>
        ) : (
          <DataList
            title={`${provider.title} Details`}
            rows={provider.rows}
            emptyLabel={provider.status === 'missing_config' ? 'Add the missing free-service env vars to activate this panel.' : 'No rows returned.'}
            icon={Activity}
          />
        )}
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

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
        <CyberPanel title="Traffic Pulse" description="Daily PostHog pageviews, visitors, and sessions." icon={Activity}>
          <TrafficAreaChart data={analytics.trafficSeries} />
        </CyberPanel>
        <CyberPanel title="Event Mix" description="Tracked events across the current visitor window." icon={Radar}>
          <RankedBarChart rows={analytics.eventMix} emptyLabel="No events have been captured yet." />
        </CyberPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <CyberPanel title="Top Pages" description="Pageview leaders with unique visitor context." icon={BarChart3}>
          <RankedBarChart rows={analytics.topPages} emptyLabel="No pageviews have been captured yet." />
        </CyberPanel>
        <CyberPanel title="Device Split" description="Device categories from captured page views." icon={Eye}>
          <DonutBreakdown rows={analytics.devices} emptyLabel="No device categories have been captured yet." centerLabel="Views" />
        </CyberPanel>
      </div>

      <CyberPanel title="Engagement Matrix" description="Top pages crossed with interaction event families." icon={MousePointerClick}>
        <EngagementMatrix rows={analytics.pageEngagement} />
      </CyberPanel>

      <div className="grid gap-4 xl:grid-cols-2">
        <DataList title="Referrers" rows={analytics.referrers} emptyLabel="No referrer data is available yet." icon={ExternalLink} />
        <DataList title="Interactions" rows={analytics.interactions} emptyLabel="No interaction events have been captured yet." icon={MousePointerClick} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DataList title="Searches" rows={analytics.searches} emptyLabel="No site searches have been captured yet." icon={Search} />
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
    <div className="grid gap-3 xl:grid-cols-2">
      {providers.map((provider) => (
        <Card key={provider.id} className="border-border/80 bg-card/80">
          <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{provider.title}</p>
                <StatusPill status={provider.status} />
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
    <AdminSurface>
      <div className="space-y-8">
        <AdminHero
          eyebrow="Free admin intelligence"
          title="Admin Intelligence"
          description="Visitor behavior, search growth, performance, deploy health, uptime, and content quality from free services and local checks."
          meta={(
            <>
              <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">Last {dashboard.visitors.windowDays} visitor days</Badge>
              <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">{configuredCount} live</Badge>
              {needsSetupCount > 0 && <Badge variant="secondary">{needsSetupCount} setup</Badge>}
              {errorCount > 0 && <Badge variant="destructive">{errorCount} errors</Badge>}
            </>
          )}
        >
          <div className="rounded-lg border border-border/80 bg-background/55 px-4 py-3">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Updated</p>
            <p className="mt-1 text-sm font-medium">{formatGeneratedAt(dashboard.generatedAt)}</p>
          </div>
        </AdminHero>

        <ProviderSignalStrip providers={providers} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SignalCard label="Provider mesh" value={`${configuredCount}/${providers.length}`} description="Live integrations" icon={CircleDot} tone="emerald" />
          <SignalCard label="Visitor window" value={`${dashboard.visitors.windowDays}d`} description="PostHog query range" icon={UsersRound} tone="blue" />
          <SignalCard label="Setup queue" value={needsSetupCount} description="Providers missing configuration" icon={Settings2} tone={needsSetupCount > 0 ? 'amber' : 'emerald'} />
          <SignalCard label="Errors" value={errorCount} description="Provider panels currently failing" icon={ShieldCheck} tone={errorCount > 0 ? 'rose' : 'emerald'} />
        </div>

        <Tabs defaultValue="visitors" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-border/80 bg-card/75 p-1">
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
    </AdminSurface>
  );
}
