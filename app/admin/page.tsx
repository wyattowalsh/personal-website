import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import {
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
import { getVisitorAnalyticsSnapshot } from './lib/visitor-analytics';
import { AdminHero, AdminSurface } from './components/AdminVisuals';
import { AnimatedContainer } from './components/AnimatedContainer';
import { AsyncVisitorsSection } from './components/AsyncVisitorsSection';
import {
  AsyncGrowthSection,
  AsyncPerformanceSection,
  AsyncOperationsSection,
  AsyncShellProviders,
  AsyncContentSection,
} from './components/AsyncProviderSections';
import {
  VisitorsSectionSkeleton,
  ProviderSectionSkeleton,
  ShellProvidersSkeleton,
} from './components/DynamicCharts';

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

  // Fetch visitors for shell (has internal try-catch, always returns safely)
  const visitors = await getVisitorAnalyticsSnapshot(windowDays);

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

        <Suspense fallback={<ShellProvidersSkeleton />}>
          <AsyncShellProviders visitorsWindowDays={visitors.windowDays} />
        </Suspense>

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
            <Suspense fallback={<ProviderSectionSkeleton count={1} />}>
              <AsyncContentSection />
            </Suspense>
          </TabsContent>

          <TabsContent value="setup">
            <div className="rounded-lg border border-border/80 bg-card/80 p-8 text-center text-sm text-muted-foreground">
              Setup configuration is available via the provider panels above.
            </div>
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
