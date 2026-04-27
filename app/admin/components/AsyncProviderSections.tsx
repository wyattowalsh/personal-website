import {
  getSearchConsoleSnapshot,
  getPerformanceSnapshot,
  getVercelSnapshot,
  getGitHubSnapshot,
  getUptimeRobotSnapshot,
  getIndexNowSnapshot,
  getContentHealthSnapshot,
  getAnalyticsRollupProviderSnapshot,
  type AdminProviderSnapshot,
} from '../lib/free-admin-dashboard';
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
import { CircleDot, Eye, ShieldCheck, UsersRound } from 'lucide-react';
import { AnimatedContainer } from './AnimatedContainer';

export async function AsyncGrowthSection() {
  const results = await Promise.allSettled([
    withTimeout(() => getSearchConsoleSnapshot(), { timeoutMs: SEARCH_CONSOLE_QUERY_TIMEOUT_MS, label: 'search-console' }),
    withTimeout(() => getIndexNowSnapshot(), { timeoutMs: SLOW_PROVIDER_TIMEOUT_MS, label: 'indexnow' }),
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
    withTimeout(() => getAnalyticsRollupProviderSnapshot(), { timeoutMs: SLOW_PROVIDER_TIMEOUT_MS, label: 'analytics-rollups' }),
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
    () => getContentHealthSnapshot(),
    { timeoutMs: SLOW_PROVIDER_TIMEOUT_MS, label: 'content-health' }
  ).catch((reason) => errorProvider('content-health', 'Content Health', reason));

  return <ProviderCard provider={contentHealth} animated />;
}

export async function AsyncShellProviders({ visitorsWindowDays }: { visitorsWindowDays: number }) {
  const results = await Promise.allSettled([
    withTimeout(() => getIndexNowSnapshot(), { timeoutMs: SLOW_PROVIDER_TIMEOUT_MS, label: 'indexnow' }),
    withTimeout(() => getContentHealthSnapshot(), { timeoutMs: SLOW_PROVIDER_TIMEOUT_MS, label: 'content-health' }),
    withTimeout(() => getAnalyticsRollupProviderSnapshot(), { timeoutMs: SLOW_PROVIDER_TIMEOUT_MS, label: 'analytics-rollups' }),
  ]);

  const providers: AdminProviderSnapshot[] = [
    results[0].status === 'fulfilled' ? results[0].value : errorProvider('indexnow', 'IndexNow', results[0].reason),
    results[1].status === 'fulfilled' ? results[1].value : errorProvider('content-health', 'Content Health', results[1].reason),
    results[2].status === 'fulfilled' ? results[2].value : errorProvider('analytics-rollups', 'Analytics Rollups', results[2].reason),
  ];

  const configuredCount = providers.filter((p) => p.status === 'configured').length;
  const errorCount = providers.filter((p) => p.status === 'error').length;

  return (
    <>
      <AnimatedContainer animation="fade-slide" delay={100}>
        <ProviderSignalStrip providers={providers} />
      </AnimatedContainer>

      <AnimatedContainer animation="fade-slide" delay={150}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SignalCard label="Provider mesh" value={`${configuredCount}/${providers.length}`} description="Live integrations" icon={CircleDot} tone="emerald" />
          <SignalCard label="Visitor window" value={`${visitorsWindowDays}d`} description="PostHog query range" icon={UsersRound} tone="blue" />
          <SignalCard label="Visitors" value="—" description="Unique anonymous browsers" icon={Eye} tone="violet" />
          <SignalCard label="Errors" value={errorCount} description="Provider panels currently failing" icon={ShieldCheck} tone={errorCount > 0 ? 'rose' : 'emerald'} />
        </div>
      </AnimatedContainer>
    </>
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
