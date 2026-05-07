import { cache } from 'react';
import {
  getSearchConsoleSnapshot,
  getPerformanceSnapshot,
  getVercelSnapshot,
  getGitHubSnapshot,
  getUptimeRobotSnapshot,
  getIndexNowSnapshot,
  getContentHealthSnapshot,
  getAnalyticsRollupProviderSnapshot,
  getAdminShellProviderSnapshots,
  getAdminSetupSnapshot,
  type AdminProviderSnapshot,
  type AdminSetupProvider,
} from '../lib/free-admin-dashboard';
import type { VisitorAnalyticsSnapshot } from '../lib/visitor-analytics';
import { withTimeout } from '../lib/resilience';
import {
  SEARCH_CONSOLE_QUERY_TIMEOUT_MS,
  PAGESPEED_QUERY_TIMEOUT_MS,
  VERCEL_API_TIMEOUT_MS,
  GITHUB_API_TIMEOUT_MS,
  SLOW_PROVIDER_TIMEOUT_MS,
} from '../lib/analytics-constants';
import { ProviderCard } from './page-client';
import { ProviderSignalStrip, SignalCard } from './AdminVisuals';
import { AnimatedContainer } from './AnimatedContainer';
import { Badge } from '@/components/ui/badge';

const getCachedIndexNowSnapshot = cache(getIndexNowSnapshot);
const getCachedContentHealthSnapshot = cache(getContentHealthSnapshot);
const getCachedAnalyticsRollupProviderSnapshot = cache(getAnalyticsRollupProviderSnapshot);
const getCachedAdminShellProviderSnapshots = cache(getAdminShellProviderSnapshots);

const setupStatusConfig = {
  configured: {
    label: 'Configured',
    className: 'border-emerald-600/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  partial: {
    label: 'Optional setup',
    className: 'border-amber-600/35 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  disabled_paid_risk: {
    label: 'Disabled guardrail',
    className: 'border-border/60 bg-muted/30 text-muted-foreground',
  },
  error: {
    label: 'Error',
    className: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
  missing_config: {
    label: 'Setup needed',
    className: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
} satisfies Record<AdminSetupProvider['status'], { label: string; className: string }>;

function setupGroups(providers: AdminSetupProvider[]) {
  return providers.reduce<Record<string, AdminSetupProvider[]>>((groups, provider) => {
    groups[provider.group] ??= [];
    groups[provider.group].push(provider);
    return groups;
  }, {});
}

export async function AsyncGrowthSection() {
  const results = await Promise.allSettled([
    withTimeout(() => getSearchConsoleSnapshot(), { timeoutMs: SEARCH_CONSOLE_QUERY_TIMEOUT_MS, label: 'search-console' }),
    withTimeout(() => getCachedIndexNowSnapshot(), { timeoutMs: SLOW_PROVIDER_TIMEOUT_MS, label: 'indexnow' }),
  ]);

  const providers: AdminProviderSnapshot[] = [
    results[0].status === 'fulfilled' ? results[0].value : errorProvider('search-console', 'Google Search Console', results[0].reason),
    results[1].status === 'fulfilled' ? results[1].value : errorProvider('indexnow', 'IndexNow', results[1].reason),
  ];

  return (
    <div className="space-y-6">
      {providers.map((provider, index) => (
        <ProviderCard key={provider.id} provider={provider} animated={index > 0} />
      ))}
    </div>
  );
}

export async function AsyncPerformanceSection() {
  const performance = await withTimeout(
    () => getPerformanceSnapshot(),
    { timeoutMs: PAGESPEED_QUERY_TIMEOUT_MS, label: 'pagespeed' }
  ).catch((reason) => errorProvider('pagespeed-crux', 'PageSpeed + CrUX', reason));

  return (
    <div className="space-y-6">
      <ProviderCard provider={performance} animated />
    </div>
  );
}

export async function AsyncOperationsSection() {
  const results = await Promise.allSettled([
    withTimeout(() => getCachedAnalyticsRollupProviderSnapshot(), { timeoutMs: SLOW_PROVIDER_TIMEOUT_MS, label: 'analytics-rollups' }),
    withTimeout(() => getVercelSnapshot(), { timeoutMs: VERCEL_API_TIMEOUT_MS, label: 'vercel' }),
    withTimeout(() => getGitHubSnapshot(), { timeoutMs: GITHUB_API_TIMEOUT_MS, label: 'github' }),
    withTimeout(() => getUptimeRobotSnapshot(), { timeoutMs: SLOW_PROVIDER_TIMEOUT_MS, label: 'uptimerobot' }),
  ]);

  const providers: AdminProviderSnapshot[] = [
    results[0].status === 'fulfilled' ? results[0].value : errorProvider('analytics-rollups', 'Analytics Rollups', results[0].reason),
    results[1].status === 'fulfilled' ? results[1].value : errorProvider('vercel', 'Vercel Deployments', results[1].reason),
    results[2].status === 'fulfilled' ? results[2].value : errorProvider('github', 'GitHub Health', results[2].reason),
    results[3].status === 'fulfilled' ? results[3].value : errorProvider('uptimerobot', 'UptimeRobot', results[3].reason),
  ];

  return (
    <div className="space-y-6">
      {providers.map((provider, index) => (
        <ProviderCard key={provider.id} provider={provider} animated={index > 0} />
      ))}
    </div>
  );
}

export async function AsyncContentSection() {
  const contentHealth = await withTimeout(
    () => getCachedContentHealthSnapshot(),
    { timeoutMs: SLOW_PROVIDER_TIMEOUT_MS, label: 'content-health' }
  ).catch((reason) => errorProvider('content-health', 'Content Health', reason));

  return <ProviderCard provider={contentHealth} animated />;
}

export async function AsyncShellProviders({ visitors }: { visitors: VisitorAnalyticsSnapshot }) {
  const { providers } = await getCachedAdminShellProviderSnapshots();

  const configuredCount = providers.filter((p) => p.status === 'configured').length;
  const errorCount = providers.filter((p) => p.status === 'error').length;
  const visitorMetric = visitors.overview.find((metric) => metric.label === 'Visitors');

  return (
    <>
      <AnimatedContainer animation="fade-slide" delay={100}>
        <ProviderSignalStrip providers={providers} />
      </AnimatedContainer>

      <AnimatedContainer animation="fade-slide" delay={150}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SignalCard label="Provider mesh" value={`${configuredCount}/${providers.length}`} description="Live integrations" iconName="circle-dot" tone="emerald" />
          <SignalCard label="Visitor window" value={`${visitors.windowDays}d`} description="PostHog query range" iconName="users-round" tone="blue" />
          <SignalCard label="Visitors" value={visitorMetric?.value ?? 'n/a'} description="Unique anonymous browsers" iconName="eye" tone="violet" />
          <SignalCard label="Errors" value={errorCount} description="Provider panels currently failing" iconName="shield-check" tone={errorCount > 0 ? 'rose' : 'emerald'} />
        </div>
      </AnimatedContainer>
    </>
  );
}

export function AsyncSetupSection() {
  const setup = getAdminSetupSnapshot();
  const groups = setupGroups(setup.providers);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SignalCard label="Configured" value={setup.totals.configured} description="Ready free services" iconName="shield-check" tone="emerald" />
        <SignalCard label="Setup Gaps" value={setup.totals.missing} description="Required env groups missing" iconName="circle-dot" tone={setup.totals.missing > 0 ? 'amber' : 'emerald'} />
        <SignalCard label="Optional" value={setup.totals.partial} description="Enhanced data available" iconName="funnel" tone="blue" />
        <SignalCard label="Guardrails" value={setup.totals.disabledPaidRisk} description="Paid-risk providers disabled" iconName="shield-check" tone="violet" />
      </div>

      {Object.entries(groups).map(([group, providers]) => (
        <section key={group} className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{group}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Free-service configuration state and setup commands.</p>
            </div>
            <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">
              {providers.length} {providers.length === 1 ? 'provider' : 'providers'}
            </Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {providers.map((provider) => (
              <article key={provider.id} className="rounded-lg border border-border/50 bg-background/55 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h4 className="font-medium text-foreground">{provider.title}</h4>
                    <p className="text-xs leading-5 text-muted-foreground text-pretty">{provider.freeTier}</p>
                  </div>
                  <span className={`rounded-md border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] ${setupStatusConfig[provider.status].className}`}>
                    {setupStatusConfig[provider.status].label}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-5 text-muted-foreground text-pretty">{provider.guardrail}</p>

                {provider.missingEnv.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {provider.missingEnv.map((name) => (
                        <Badge key={name} variant="outline" className="font-mono border-border/50">
                          {name}
                        </Badge>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border/40 bg-background/70 p-3">
                      {provider.setupSteps.map((step) => (
                        <p key={step} className="font-mono text-xs text-foreground">{step}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function errorProvider(id: string, title: string, reason: unknown) {
  return {
    id,
    title,
    status: 'error' as const,
    lastCheckedAt: new Date().toISOString(),
    freeTier: 'Provider request failed',
    missingEnv: [] as string[],
    cards: [] as { label: string; value: string; description: string }[],
    rows: [] as { label: string; value: string; detail?: string }[],
    setupSteps: [] as string[],
    sourceUrl: '',
    error: reason instanceof Error ? reason.message : String(reason),
  };
}
