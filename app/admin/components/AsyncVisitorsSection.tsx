import { getVisitorAnalyticsSnapshot } from '../lib/visitor-analytics';
import { CyberPanel } from './AdminVisuals';
import { CircleDot, BarChart3, Activity, ShieldCheck, Radar } from 'lucide-react';
import { AnimatedContainer } from './AnimatedContainer';

const visitorMetricIcons = [BarChart3, Activity, Radar, ShieldCheck] as const;
import { MetricCard } from './MetricCard';
import { SignalCard } from './AdminVisuals';
import { ChartInteraction } from './ChartInteraction';
import { DynamicTrafficAreaChart, DynamicRankedBarChart, DynamicDonutBreakdown, DynamicEngagementMatrix } from './DynamicCharts';
import { DataList } from './page-client';
import type { AnalyticsWindowDays } from '../lib/analytics-windows';

interface AsyncVisitorsSectionProps {
  windowDays?: AnalyticsWindowDays;
}

export async function AsyncVisitorsSection({ windowDays }: AsyncVisitorsSectionProps) {
  const analytics = await getVisitorAnalyticsSnapshot(windowDays);

  return (
    <div className="space-y-8">
      {analytics.status === 'error' && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Analytics query failed: {analytics.error}
        </div>
      )}

      <AnimatedContainer animation="fade-slide" delay={0}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {analytics.overview.map((metric, index) => {
            const Icon = visitorMetricIcons[index] ?? BarChart3;
            const variants = ['accent', 'success', 'warning', 'default'] as const;
            return (
              <AnimatedContainer key={metric.label} delay={index * 100} animation="fade-slide">
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
                <DynamicTrafficAreaChart data={analytics.trafficSeries} />
              </ChartInteraction>
            </CyberPanel>
          </AnimatedContainer>
          <AnimatedContainer animation="fade-slide" delay={350}>
            <CyberPanel title="Event Mix" description="Tracked events across the current visitor window." icon={Radar}>
              <ChartInteraction title="Event Distribution">
                <DynamicRankedBarChart rows={analytics.eventMix} emptyLabel="No events have been captured yet." />
              </ChartInteraction>
            </CyberPanel>
          </AnimatedContainer>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <AnimatedContainer animation="fade-slide" delay={400}>
            <CyberPanel title="Top Pages" description="Pageview leaders with unique visitor context." icon={BarChart3}>
              <ChartInteraction title="Page Performance">
                <DynamicRankedBarChart rows={analytics.topPages} emptyLabel="No pageviews have been captured yet." />
              </ChartInteraction>
            </CyberPanel>
          </AnimatedContainer>
          <AnimatedContainer animation="fade-slide" delay={450}>
            <CyberPanel title="Device Split" description="Device categories from captured page views." icon={Activity}>
              <ChartInteraction title="Device Breakdown">
                <DynamicDonutBreakdown rows={analytics.devices} emptyLabel="No device categories have been captured yet." centerLabel="Views" />
              </ChartInteraction>
            </CyberPanel>
          </AnimatedContainer>
        </div>

        <AnimatedContainer animation="fade-slide" delay={500}>
          <CyberPanel title="Engagement Matrix" description="Top pages crossed with interaction event families." icon={Activity}>
            <ChartInteraction title="Engagement Overview">
              <DynamicEngagementMatrix rows={analytics.pageEngagement} />
            </ChartInteraction>
          </CyberPanel>
        </AnimatedContainer>

        <div className="grid gap-4 xl:grid-cols-2">
          <DataList title="Referrers" rows={analytics.referrers} emptyLabel="No referrer data is available yet." icon={Activity} animated />
          <DataList title="Interactions" rows={analytics.interactions} emptyLabel="No interaction events have been captured yet." icon={Activity} animated />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <DataList title="Searches" rows={analytics.searches} emptyLabel="No site searches have been captured yet." icon={Activity} animated />
          <DataList title="Outbound Links" rows={analytics.outboundLinks} emptyLabel="No outbound link clicks have been captured yet." icon={Activity} animated />
          <DataList title="Reading Progress" rows={analytics.readingProgress} emptyLabel="No reading-progress milestones have been captured yet." icon={Activity} animated />
        </div>
      </div>
    </div>
  );
}
