import { Metadata } from 'next';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  CircleDot,
  ExternalLink,
  Eye,
  Gauge,
  Lightbulb,
  MousePointerClick,
  Radar,
  Search,
  Settings2,
  ShieldCheck,
  Siren,
  Sparkles,
  TriangleAlert,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { validateAdminSession } from './lib/auth';
import { ANALYTICS_WINDOWS, parseAnalyticsWindowDays } from './lib/analytics-windows';
import {
  getAdminDashboardSnapshot,
  type AdminCostLedgerItem,
  type AdminCostStatus,
  type AdminProviderSnapshot,
  type AdminSignal,
} from './lib/free-admin-dashboard';
import {
  EngagementMatrix,
  StatusTimeline,
} from './components/AdminCharts';
import {
  EnhancedTrafficAreaChart,
  EnhancedRankedBarChart,
  EnhancedDonutBreakdown,
  EnhancedScoreRadials,
} from './components/Charts';
import {
  AdminHero,
  AdminSurface,
  CyberPanel,
  ProviderSignalStrip,
  SignalCard,
  SourceLink,
  StatusPill,
} from './components/AdminVisuals';
import { MetricCard } from './components/MetricCard';
import { AnimatedContainer } from './components/AnimatedContainer';
import { ChartInteraction } from './components/ChartInteraction';
import { StatPulse } from './components/StatPulse';
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

function AnalyticsWindowSelector({ activeWindow }: { activeWindow: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ANALYTICS_WINDOWS.map((windowDays) => (
        <Link
          key={windowDays}
          href={`/admin?window=${windowDays}`}
          className={cn(
            'rounded-md border px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] no-underline transition-colors',
            activeWindow === windowDays
              ? 'border-[hsl(var(--chart-1)/0.45)] bg-[hsl(var(--chart-1)/0.12)] text-[hsl(var(--chart-1))]'
              : 'border-border/80 bg-background/55 text-muted-foreground hover:border-[hsl(var(--chart-1)/0.35)] hover:text-foreground'
          )}
        >
          {windowDays}d
        </Link>
      ))}
    </div>
  );
}

function MetricGrid({
  metrics,
  icons,
  animated = false,
}: {
  metrics: AnalyticsMetric[];
  icons?: readonly LucideIcon[];
  animated?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = icons?.[index] ?? BarChart3;
        const variants = ['accent', 'success', 'warning', 'default'] as const;
        return (
          <AnimatedContainer
            key={metric.label}
            delay={animated ? index * 100 : 0}
            animation="fade-slide"
          >
            <MetricCard
              label={metric.label}
              value={metric.value}
              description={metric.description}
              icon={Icon}
              variant={variants[index % variants.length]}
            />
          </AnimatedContainer>
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
  animated = false,
}: {
  title: string;
  rows: AnalyticsRow[];
  emptyLabel: string;
  icon: LucideIcon;
  animated?: boolean;
}) {
  return (
    <AnimatedContainer animation="fade-slide" delay={animated ? 100 : 0}>
      <CyberPanel title={title} icon={Icon}>
        {rows.length === 0 ? (
          <EmptyState label={emptyLabel} />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={`${title}-${row.label}-${row.detail ?? ''}`}
                className="flex items-start justify-between gap-4 rounded-md border border-border/40 bg-muted/20 p-3 transition-colors hover:border-border/60 hover:bg-muted/30"
              >
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
    </AnimatedContainer>
  );
}

function ProviderCard({ provider, animated = false }: { provider: AdminProviderSnapshot; animated?: boolean }) {
  const isExternalSource = provider.sourceUrl.startsWith('http');

  return (
    <AnimatedContainer animation="fade-slide" delay={animated ? 150 : 0}>
      <Card className="overflow-hidden border-border/80 bg-card/80 transition-all hover:shadow-md hover:border-border">
        <CardHeader className="space-y-3 border-b border-border/70 bg-muted/20 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{provider.title}</CardTitle>
                {provider.status === 'configured' && (
                  <StatPulse value="●" label="Live" trend="up" />
                )}
              </div>
              <p className="text-xs text-muted-foreground text-pretty">{provider.freeTier}</p>
            </div>
            <StatusPill status={provider.status} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">Updated {formatGeneratedAt(provider.lastCheckedAt)}</Badge>
            {isExternalSource && <SourceLink href={provider.sourceUrl} />}
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-4">
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
            <ChartInteraction title={`${provider.title} Metrics`}>
              <EnhancedScoreRadials metrics={provider.cards} />
            </ChartInteraction>
          ) : provider.cards.length > 0 ? (
            <MetricGrid metrics={provider.cards} animated />
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
    </AnimatedContainer>
  );
}

function VisitorsSection({ analytics }: { analytics: VisitorAnalyticsSnapshot }) {
  const isRollup = analytics.source === 'turso_rollup';

  return (
    <div className="space-y-8">
      {analytics.status === 'missing_config' && (
        <ProviderCard
          provider={{
            id: 'posthog',
            title: isRollup ? 'Analytics Rollups' : 'PostHog',
            status: 'missing_config',
            lastCheckedAt: analytics.generatedAt,
            freeTier: isRollup
              ? 'Turso stores daily SQLite rollups for longer visitor windows'
              : 'Free tier includes product analytics, web analytics, and API access within monthly limits',
            missingEnv: analytics.missingEnv,
            setupSteps: analytics.missingEnv.map((name) => `vercel env add ${name} production`),
            sourceUrl: isRollup ? 'https://turso.tech/pricing' : 'https://posthog.com/pricing',
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

      <AnimatedContainer animation="fade-slide" delay={0}>
        <MetricGrid metrics={analytics.overview} icons={visitorMetricIcons} animated />
      </AnimatedContainer>

      {analytics.rollup && (
        <AnimatedContainer animation="fade-slide" delay={200}>
          <CyberPanel
            title="Rollup Store"
            description={analytics.rollup.status === 'configured'
              ? 'Daily SQLite snapshots power longer visitor windows.'
              : 'Longer visitor windows need Turso rollup storage.'}
            icon={CircleDot}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SignalCard label="Source" value={analytics.source === 'turso_rollup' ? 'Turso' : 'PostHog'} description="Active data path" icon={Radar} tone="blue" />
              <SignalCard label="Covered Days" value={analytics.rollup.coveredDays} description="Persisted daily rows" icon={BarChart3} tone="emerald" />
              <SignalCard label="Latest Day" value={analytics.rollup.latestDay ?? 'n/a'} description="Newest rollup snapshot" icon={Activity} tone="violet" />
              <SignalCard label="Last Run" value={analytics.rollup.lastRunStatus ?? analytics.rollup.status} description={analytics.rollup.lastRunAt ?? 'No recorded run'} icon={ShieldCheck} tone={analytics.rollup.status === 'error' ? 'rose' : analytics.rollup.status === 'missing_config' ? 'amber' : 'emerald'} />
            </div>
          </CyberPanel>
        </AnimatedContainer>
      )}

      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
          <AnimatedContainer animation="fade-slide" delay={300}>
            <CyberPanel title="Traffic Pulse" description="Daily PostHog pageviews, visitors, and sessions." icon={Activity}>
              <ChartInteraction title="Traffic Trends">
                <EnhancedTrafficAreaChart data={analytics.trafficSeries} />
              </ChartInteraction>
            </CyberPanel>
          </AnimatedContainer>
          <AnimatedContainer animation="fade-slide" delay={350}>
            <CyberPanel title="Event Mix" description="Tracked events across the current visitor window." icon={Radar}>
              <ChartInteraction title="Event Distribution">
                <EnhancedRankedBarChart rows={analytics.eventMix} emptyLabel="No events have been captured yet." />
              </ChartInteraction>
            </CyberPanel>
          </AnimatedContainer>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <AnimatedContainer animation="fade-slide" delay={400}>
            <CyberPanel title="Top Pages" description="Pageview leaders with unique visitor context." icon={BarChart3}>
              <ChartInteraction title="Page Performance">
                <EnhancedRankedBarChart rows={analytics.topPages} emptyLabel="No pageviews have been captured yet." />
              </ChartInteraction>
            </CyberPanel>
          </AnimatedContainer>
          <AnimatedContainer animation="fade-slide" delay={450}>
            <CyberPanel title="Device Split" description="Device categories from captured page views." icon={Eye}>
              <ChartInteraction title="Device Breakdown">
                <EnhancedDonutBreakdown rows={analytics.devices} emptyLabel="No device categories have been captured yet." centerLabel="Views" />
              </ChartInteraction>
            </CyberPanel>
          </AnimatedContainer>
        </div>

        <AnimatedContainer animation="fade-slide" delay={500}>
          <CyberPanel title="Engagement Matrix" description="Top pages crossed with interaction event families." icon={MousePointerClick}>
            <ChartInteraction title="Engagement Overview">
              <EngagementMatrix rows={analytics.pageEngagement} />
            </ChartInteraction>
          </CyberPanel>
        </AnimatedContainer>

        <div className="grid gap-4 xl:grid-cols-2">
          <DataList title="Referrers" rows={analytics.referrers} emptyLabel="No referrer data is available yet." icon={ExternalLink} animated />
          <DataList title="Interactions" rows={analytics.interactions} emptyLabel="No interaction events have been captured yet." icon={MousePointerClick} animated />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <DataList title="Searches" rows={analytics.searches} emptyLabel="No site searches have been captured yet." icon={Search} animated />
          <DataList title="Outbound Links" rows={analytics.outboundLinks} emptyLabel="No outbound link clicks have been captured yet." icon={ExternalLink} animated />
          <DataList title="Reading Progress" rows={analytics.readingProgress} emptyLabel="No reading-progress milestones have been captured yet." icon={BarChart3} animated />
        </div>
      </div>
    </div>
  );
}

function ProviderSection({ providers }: { providers: AdminProviderSnapshot[] }) {
  return (
    <div className="space-y-6">
      {providers.map((provider, index) => (
        <ProviderCard key={provider.id} provider={provider} animated={index > 0} />
      ))}
    </div>
  );
}

function costStatusLabel(status: AdminCostStatus): string {
  return {
    free: 'Free',
    free_with_limit: 'Free limit',
    optional_unverified: 'Verify',
    disabled_paid_risk: 'Blocked',
  }[status];
}

function costStatusClass(status: AdminCostStatus): string {
  return {
    free: 'border-[hsl(var(--chart-3)/0.35)] bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))]',
    free_with_limit: 'border-[hsl(var(--chart-4)/0.35)] bg-[hsl(var(--chart-4)/0.1)] text-[hsl(var(--chart-4))]',
    optional_unverified: 'border-[hsl(var(--chart-2)/0.35)] bg-[hsl(var(--chart-2)/0.1)] text-[hsl(var(--chart-2))]',
    disabled_paid_risk: 'border-destructive/35 bg-destructive/10 text-destructive',
  }[status];
}

function signalSeverityClass(severity: AdminSignal['severity']): string {
  return {
    critical: 'border-destructive/35 bg-destructive/10 text-destructive',
    action: 'border-[hsl(var(--chart-4)/0.35)] bg-[hsl(var(--chart-4)/0.1)] text-[hsl(var(--chart-4))]',
    watch: 'border-[hsl(var(--chart-2)/0.35)] bg-[hsl(var(--chart-2)/0.1)] text-[hsl(var(--chart-2))]',
    info: 'border-[hsl(var(--chart-1)/0.35)] bg-[hsl(var(--chart-1)/0.1)] text-[hsl(var(--chart-1))]',
  }[severity];
}

function SignalsSection({
  signals,
  costLedger,
  providers,
}: {
  signals: AdminSignal[];
  costLedger: AdminCostLedgerItem[];
  providers: AdminProviderSnapshot[];
}) {
  const disabledPaidRisk = costLedger.filter((item) => item.status === 'disabled_paid_risk').length;
  const freeReady = costLedger.filter((item) => item.status === 'free').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SignalCard label="Action signals" value={signals.filter((signal) => signal.severity === 'action' || signal.severity === 'critical').length} description="Items that should be fixed or configured" icon={Lightbulb} tone="amber" />
        <SignalCard label="Free sources" value={`${freeReady}/${costLedger.length}`} description="Integrations running inside free limits" icon={WalletCards} tone="emerald" />
        <SignalCard label="Paid-risk blocked" value={disabledPaidRisk} description="Optional providers disabled until verified free" icon={ShieldCheck} tone={disabledPaidRisk > 0 ? 'blue' : 'emerald'} />
        <SignalCard label="Provider errors" value={providers.filter((provider) => provider.status === 'error').length} description="Panels currently failing" icon={TriangleAlert} tone={providers.some((provider) => provider.status === 'error') ? 'rose' : 'emerald'} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <CyberPanel title="Action Queue" description="Ranked recommendations generated from free aggregate providers." icon={Sparkles}>
          {signals.length === 0 ? (
            <EmptyState label="No recommendations yet. The signal engine will populate as provider snapshots accumulate." />
          ) : (
            <div className="space-y-3">
              {signals.map((signal) => (
                <div key={signal.id} className="rounded-lg border border-border/80 bg-background/55 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn('font-mono uppercase tracking-[0.14em]', signalSeverityClass(signal.severity))}>
                          {signal.severity}
                        </Badge>
                        <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">
                          {Math.round(signal.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium">{signal.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground text-pretty">{signal.evidence}</p>
                      </div>
                    </div>
                    <span className="rounded-md border border-border/80 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
                      {signal.entity}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-border/70 bg-muted/20 p-3">
                      <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">Next action</p>
                      <p className="mt-1 text-sm leading-6">{signal.recommendation}</p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-muted/20 p-3">
                      <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">Expected impact</p>
                      <p className="mt-1 text-sm leading-6">{signal.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CyberPanel>

        <CyberPanel title="Signal Constellation" description="Signals clustered by entity, confidence, and source provider." icon={Radar}>
          <SignalConstellation signals={signals} />
        </CyberPanel>
      </div>

      <CyberPanel title="Provider Freshness" description="Current integration state and freshness from the free provider mesh." icon={Activity}>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {providers.map((provider) => (
            <div key={provider.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-border/70 bg-background/55 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{provider.title}</p>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {formatGeneratedAt(provider.lastCheckedAt)}
                </p>
              </div>
              <StatusPill status={provider.status} />
            </div>
          ))}
        </div>
      </CyberPanel>

      <CostLedgerSection costLedger={costLedger} />
    </div>
  );
}

function CostLedgerSection({ costLedger }: { costLedger: AdminCostLedgerItem[] }) {
  return (
    <CyberPanel title="Free-Tier Cost Ledger" description="Every provider is capped, aggregate-only, or blocked until free access is verified." icon={WalletCards}>
      <div className="grid gap-3 xl:grid-cols-2">
        {costLedger.map((item) => (
          <div key={item.id} className="rounded-lg border border-border/80 bg-background/55 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs leading-5 text-muted-foreground text-pretty">{item.freeTier}</p>
              </div>
              <Badge variant="outline" className={cn('font-mono uppercase tracking-[0.14em]', costStatusClass(item.status))}>
                {costStatusLabel(item.status)}
              </Badge>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Usage</p>
                <p className="mt-1 text-sm font-medium">{item.usage}</p>
              </div>
              <div>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Cadence</p>
                <p className="mt-1 text-sm font-medium">{item.cadence}</p>
              </div>
              <div>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Guardrail</p>
                <p className="mt-1 text-sm font-medium">{item.guardrail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CyberPanel>
  );
}

function SignalConstellation({ signals }: { signals: AdminSignal[] }) {
  if (signals.length === 0) {
    return <EmptyState label="No signal clusters yet." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {signals.slice(0, 8).map((signal) => (
        <div key={`constellation-${signal.id}`} className={cn('rounded-lg border p-3', signalSeverityClass(signal.severity))}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{signal.entity}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{signal.title}</p>
            </div>
            <span className="shrink-0 rounded-full border border-current/30 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em]">
              {Math.round(signal.confidence * 100)}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {signal.providerIds.map((providerId) => (
              <span key={`${signal.id}-${providerId}`} className="rounded-md border border-current/20 px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em]">
                {providerId}
              </span>
            ))}
          </div>
        </div>
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

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) {
    return null;
  }

  const params = searchParams ? await searchParams : {};
  const windowDays = parseAnalyticsWindowDays(params.window);
  const dashboard = await getAdminDashboardSnapshot(windowDays);
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
      <div className="space-y-10">
        <AnimatedContainer animation="fade-slide" delay={0}>
          <AdminHero
            eyebrow="Free admin intelligence"
            title="Admin Intelligence"
            description="Visitor behavior, search growth, performance, deploy health, uptime, and content quality from free services and local checks."
            meta={(
              <>
                <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">Last {dashboard.visitors.windowDays} visitor days</Badge>
                <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">{dashboard.visitors.source === 'turso_rollup' ? 'Rollup store' : 'Live PostHog'}</Badge>
                <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">{configuredCount} live</Badge>
                {needsSetupCount > 0 && <Badge variant="secondary">{needsSetupCount} setup</Badge>}
                {errorCount > 0 && <Badge variant="destructive">{errorCount} errors</Badge>}
              </>
            )}
          >
            <div className="space-y-3">
              <AnalyticsWindowSelector activeWindow={dashboard.visitors.windowDays} />
              <div className="rounded-lg border border-border/80 bg-background/55 px-4 py-3">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Updated</p>
                <p className="mt-1 text-sm font-medium">{formatGeneratedAt(dashboard.generatedAt)}</p>
              </div>
            </div>
          </AdminHero>
        </AnimatedContainer>

        <AnimatedContainer animation="fade-slide" delay={100}>
          <ProviderSignalStrip providers={providers} />
        </AnimatedContainer>

        <AnimatedContainer animation="fade-slide" delay={150}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SignalCard label="Provider mesh" value={`${configuredCount}/${providers.length}`} description="Live integrations" icon={CircleDot} tone="emerald" />
            <SignalCard label="Visitor window" value={`${dashboard.visitors.windowDays}d`} description={dashboard.visitors.source === 'turso_rollup' ? 'Persisted rollup range' : 'PostHog query range'} icon={UsersRound} tone="blue" />
            <SignalCard label="Signals" value={dashboard.signals.length} description="Ranked recommendations and guardrails" icon={Sparkles} tone="violet" />
            <SignalCard label="Errors" value={errorCount} description="Provider panels currently failing" icon={ShieldCheck} tone={errorCount > 0 ? 'rose' : 'emerald'} />
          </div>
        </AnimatedContainer>

        <Tabs defaultValue="visitors" className="space-y-6">
        <AnimatedContainer animation="fade-slide" delay={200}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-border/80 bg-card/75 p-1">
            <TabsTrigger value="visitors" className="gap-2"><UsersRound className="size-4" />Visitors</TabsTrigger>
            <TabsTrigger value="signals" className="gap-2"><Sparkles className="size-4" />Signals</TabsTrigger>
            <TabsTrigger value="growth" className="gap-2"><Search className="size-4" />Growth</TabsTrigger>
            <TabsTrigger value="performance" className="gap-2"><Gauge className="size-4" />Performance</TabsTrigger>
            <TabsTrigger value="operations" className="gap-2"><Siren className="size-4" />Operations</TabsTrigger>
            <TabsTrigger value="content" className="gap-2"><ShieldCheck className="size-4" />Content</TabsTrigger>
            <TabsTrigger value="setup" className="gap-2"><Settings2 className="size-4" />Setup</TabsTrigger>
          </TabsList>
        </AnimatedContainer>

        <TabsContent value="visitors">
          <VisitorsSection analytics={dashboard.visitors} />
        </TabsContent>

        <TabsContent value="signals">
          <SignalsSection signals={dashboard.signals} costLedger={dashboard.costLedger} providers={providers} />
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
          <ProviderCard provider={dashboard.contentHealth} animated />
        </TabsContent>

        <TabsContent value="setup">
          <SetupSection providers={providers} />
        </TabsContent>
      </Tabs>

      <AnimatedContainer animation="fade-slide" delay={300}>
        <div className="space-y-4">
          <Separator />
          <p className="text-xs text-muted-foreground text-pretty">
            Secrets stay server-only. Panels either read anonymous aggregate data, free provider APIs, or local repository content; missing optional services render setup steps instead of blocking the dashboard.
          </p>
        </div>
      </AnimatedContainer>
      </div>
    </AdminSurface>
  );
}
