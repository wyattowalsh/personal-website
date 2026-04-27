import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  CircleDot,
  Eye,
  Gauge,
  Search,
  Settings2,
  ShieldCheck,
  Siren,
  UsersRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { validateAdminSession } from './lib/auth';
import { ANALYTICS_WINDOWS, parseAnalyticsWindowDays } from './lib/analytics-windows';
import {
  getIndexNowSnapshot,
  getContentHealthSnapshot,
  getAnalyticsRollupProviderSnapshot,
  type AdminProviderSnapshot,
} from './lib/free-admin-dashboard';
import { getVisitorAnalyticsSnapshot } from './lib/visitor-analytics';
import { AdminHero, AdminSurface, ProviderSignalStrip, SignalCard } from './components/AdminVisuals';
import { AnimatedContainer } from './components/AnimatedContainer';
import { AsyncVisitorsSection } from './components/AsyncVisitorsSection';
import {
  AsyncGrowthSection,
  AsyncPerformanceSection,
  AsyncOperationsSection,
} from './components/AsyncProviderSections';
import {
  VisitorsSectionSkeleton,
  ProviderSectionSkeleton,
} from './components/DynamicCharts';
import { ProviderCard } from './components/page-client';

export const metadata: Metadata = {
  title: 'Admin Intelligence',
  robots: { index: false, follow: false },
};

export const maxDuration = 60;

function formatGeneratedAt(timestamp: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
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

function SetupSection({ providers }: { providers: AdminProviderSnapshot[] }) {
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {providers.map((provider) => (
        <div key={provider.id} className="rounded-lg border border-border/80 bg-card/80 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{provider.title}</p>
                <Badge variant={provider.status === 'configured' ? 'default' : provider.status === 'error' ? 'destructive' : 'secondary'}>
                  {provider.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground text-pretty">{provider.freeTier}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {provider.missingEnv.length === 0 ? (
                <Badge variant="outline" className="gap-1">
                  <ShieldCheck className="size-3" />
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
          </div>
        </div>
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

  // Fetch fast providers immediately for the shell
  const [visitors, indexNow, contentHealth, rollupStorage] = await Promise.all([
    getVisitorAnalyticsSnapshot(windowDays),
    getIndexNowSnapshot(),
    getContentHealthSnapshot(),
    getAnalyticsRollupProviderSnapshot(),
  ]);

  const fastProviders = [indexNow, contentHealth, rollupStorage];
  const configuredCount = fastProviders.filter((p) => p.status === 'configured').length;
  const needsSetupCount = fastProviders.filter((p) => p.status === 'missing_config').length;
  const errorCount = fastProviders.filter((p) => p.status === 'error').length;

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
                <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">Last {visitors.windowDays} visitor days</Badge>
                <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">{visitors.source === 'turso_rollup' ? 'Rollup store' : 'Live PostHog'}</Badge>
                <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">{configuredCount} live</Badge>
                {needsSetupCount > 0 && <Badge variant="secondary">{needsSetupCount} setup</Badge>}
                {errorCount > 0 && <Badge variant="destructive">{errorCount} errors</Badge>}
              </>
            )}
          >
            <div className="space-y-3">
              <AnalyticsWindowSelector activeWindow={visitors.windowDays} />
              <div className="rounded-lg border border-border/80 bg-background/55 px-4 py-3">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Updated</p>
                <p className="mt-1 text-sm font-medium">{formatGeneratedAt(new Date().toISOString())}</p>
              </div>
            </div>
          </AdminHero>
        </AnimatedContainer>

        <AnimatedContainer animation="fade-slide" delay={100}>
          <ProviderSignalStrip providers={fastProviders} />
        </AnimatedContainer>

        <AnimatedContainer animation="fade-slide" delay={150}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SignalCard label="Provider mesh" value={`${configuredCount}/${fastProviders.length}`} description="Live integrations" icon={CircleDot} tone="emerald" />
            <SignalCard label="Visitor window" value={`${visitors.windowDays}d`} description={visitors.source === 'turso_rollup' ? 'Persisted rollup range' : 'PostHog query range'} icon={UsersRound} tone="blue" />
            <SignalCard label="Visitors" value={visitors.overview[0]?.value ?? 'n/a'} description="Unique anonymous browsers" icon={Eye} tone="violet" />
            <SignalCard label="Errors" value={errorCount} description="Provider panels currently failing" icon={ShieldCheck} tone={errorCount > 0 ? 'rose' : 'emerald'} />
          </div>
        </AnimatedContainer>

        <Tabs defaultValue="visitors" className="space-y-6">
          <AnimatedContainer animation="fade-slide" delay={200}>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-border/80 bg-card/75 p-1">
              <TabsTrigger value="visitors" className="gap-2"><UsersRound className="size-4" />Visitors</TabsTrigger>
              <TabsTrigger value="growth" className="gap-2"><Search className="size-4" />Growth</TabsTrigger>
              <TabsTrigger value="performance" className="gap-2"><Gauge className="size-4" />Performance</TabsTrigger>
              <TabsTrigger value="operations" className="gap-2"><Siren className="size-4" />Operations</TabsTrigger>
              <TabsTrigger value="content" className="gap-2"><ShieldCheck className="size-4" />Content</TabsTrigger>
              <TabsTrigger value="setup" className="gap-2"><Settings2 className="size-4" />Setup</TabsTrigger>
            </TabsList>
          </AnimatedContainer>

          <TabsContent value="visitors">
            <Suspense fallback={<VisitorsSectionSkeleton />}>
              <AsyncVisitorsSection windowDays={windowDays} />
            </Suspense>
          </TabsContent>

          <TabsContent value="growth">
            <Suspense fallback={<ProviderSectionSkeleton count={2} />}>
              <AsyncGrowthSection />
            </Suspense>
          </TabsContent>

          <TabsContent value="performance">
            <Suspense fallback={<ProviderSectionSkeleton count={1} />}>
              <AsyncPerformanceSection />
            </Suspense>
          </TabsContent>

          <TabsContent value="operations">
            <Suspense fallback={<ProviderSectionSkeleton count={4} />}>
              <AsyncOperationsSection />
            </Suspense>
          </TabsContent>

          <TabsContent value="content">
            <ProviderCard provider={contentHealth} animated />
          </TabsContent>

          <TabsContent value="setup">
            <SetupSection providers={fastProviders} />
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
