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
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { validateAdminSession } from './lib/auth';
import { ANALYTICS_WINDOWS, parseAnalyticsWindowDays, type AnalyticsWindowDays } from './lib/analytics-windows';
import { getVisitorAnalyticsShellSnapshot, getVisitorAnalyticsSnapshot } from './lib/visitor-analytics';
import { AdminHero, AdminSurface } from './components/AdminVisuals';
import { AnimatedContainer } from './components/AnimatedContainer';
import { AsyncVisitorsSection } from './components/AsyncVisitorsSection';
import {
  AsyncGrowthSection,
  AsyncPerformanceSection,
  AsyncOperationsSection,
  AsyncShellProviders,
  AsyncContentSection,
  AsyncSetupSection,
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

const ADMIN_SECTIONS = [
  { id: 'visitors', label: 'Visitors', icon: UsersRound },
  { id: 'growth', label: 'Growth', icon: Search },
  { id: 'performance', label: 'Performance', icon: Gauge },
  { id: 'operations', label: 'Operations', icon: Siren },
  { id: 'content', label: 'Content', icon: ShieldCheck },
  { id: 'setup', label: 'Setup', icon: Settings2 },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon }[];

type AdminSection = typeof ADMIN_SECTIONS[number]['id'];

function parseAdminSection(value: string | string[] | undefined): AdminSection {
  const section = Array.isArray(value) ? value[0] : value;
  return ADMIN_SECTIONS.some((item) => item.id === section) ? (section as AdminSection) : 'visitors';
}

function formatGeneratedAt(timestamp: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function buildAdminHref(section: AdminSection, windowDays: number): string {
  const params = new URLSearchParams();
  if (windowDays !== ANALYTICS_WINDOWS[0]) params.set('window', String(windowDays));
  if (section !== 'visitors') params.set('section', section);
  const query = params.toString();
  return query ? `/admin?${query}` : '/admin';
}

function AnalyticsWindowSelector({ activeWindow, activeSection }: { activeWindow: number; activeSection: AdminSection }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ANALYTICS_WINDOWS.map((windowDays) => (
        <Link
          key={windowDays}
          href={buildAdminHref(activeSection, windowDays)}
          aria-current={activeWindow === windowDays ? 'true' : undefined}
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

function AdminSectionNav({ activeSection, windowDays }: { activeSection: AdminSection; windowDays: number }) {
  return (
    <AnimatedContainer animation="fade-slide" delay={200}>
      <nav aria-label="Admin dashboard sections" className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-border/80 bg-card/75 p-1">
        {ADMIN_SECTIONS.map((section) => {
          const Icon = section.icon;
          const active = section.id === activeSection;
          return (
            <Link
              key={section.id}
              href={buildAdminHref(section.id, windowDays)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                active
                  ? 'bg-background text-foreground shadow'
                  : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
              {section.label}
            </Link>
          );
        })}
      </nav>
    </AnimatedContainer>
  );
}

function AdminSectionPanel({
  activeSection,
  windowDays,
  visitors,
}: {
  activeSection: AdminSection;
  windowDays: AnalyticsWindowDays;
  visitors: Awaited<ReturnType<typeof getVisitorAnalyticsSnapshot>>;
}) {
  if (activeSection === 'growth') {
    return (
      <Suspense fallback={<ProviderSectionSkeleton count={2} />}>
        <AsyncGrowthSection />
      </Suspense>
    );
  }

  if (activeSection === 'performance') {
    return (
      <Suspense fallback={<ProviderSectionSkeleton count={1} />}>
        <AsyncPerformanceSection />
      </Suspense>
    );
  }

  if (activeSection === 'operations') {
    return (
      <Suspense fallback={<ProviderSectionSkeleton count={4} />}>
        <AsyncOperationsSection />
      </Suspense>
    );
  }

  if (activeSection === 'content') {
    return (
      <Suspense fallback={<ProviderSectionSkeleton count={1} />}>
        <AsyncContentSection />
      </Suspense>
    );
  }

  if (activeSection === 'setup') {
    return <AsyncSetupSection />;
  }

  return (
    <Suspense fallback={<VisitorsSectionSkeleton />}>
      <AsyncVisitorsSection windowDays={windowDays} analytics={visitors} />
    </Suspense>
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
  const activeSection = parseAdminSection(params.section);

  const visitors = activeSection === 'visitors'
    ? await getVisitorAnalyticsSnapshot(windowDays)
    : await getVisitorAnalyticsShellSnapshot(windowDays);

  return (
    <AdminSurface>
      <div className="flex flex-col gap-6 md:gap-10">
        <AnimatedContainer animation="fade-slide" delay={0} className="order-2 md:order-1">
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
              <AnalyticsWindowSelector activeWindow={visitors.windowDays} activeSection={activeSection} />
              <div className="rounded-lg border border-border/80 bg-background/55 px-4 py-3">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Updated</p>
                <p className="mt-1 text-sm font-medium">{formatGeneratedAt(visitors.generatedAt)}</p>
              </div>
            </div>
          </AdminHero>
        </AnimatedContainer>

        <div className="order-1 md:order-2">
          <Suspense fallback={<ShellProvidersSkeleton />}>
            <AsyncShellProviders visitors={visitors} />
          </Suspense>
        </div>

        <section className="order-3 space-y-6" aria-label="Admin dashboard section">
          <AdminSectionNav activeSection={activeSection} windowDays={visitors.windowDays} />
          <AdminSectionPanel activeSection={activeSection} windowDays={windowDays} visitors={visitors} />
        </section>

        <AnimatedContainer animation="fade-slide" delay={300} className="order-4">
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
