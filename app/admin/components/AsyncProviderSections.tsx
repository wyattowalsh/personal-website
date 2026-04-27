import {
  getSearchConsoleSnapshot,
  getPerformanceSnapshot,
  getVercelSnapshot,
  getGitHubSnapshot,
  getUptimeRobotSnapshot,
  getIndexNowSnapshot,
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
