import { getVisitorAnalyticsSnapshot, type VisitorAnalyticsSnapshot } from '../lib/visitor-analytics';
import { CyberPanel } from './AdminVisuals';
import { AnimatedContainer } from './AnimatedContainer';

const visitorMetricIconNames = ['bar-chart', 'activity', 'radar', 'shield-check'] as const;
import { MetricCard } from './MetricCard';
import { SignalCard } from './AdminVisuals';
import { ChartInteraction } from './ChartInteraction';
import { DynamicTrafficAreaChart, DynamicRankedBarChart, DynamicDonutBreakdown, DynamicEngagementMatrix } from './DynamicCharts';
import { DataList } from './page-client';
import type { AnalyticsWindowDays } from '../lib/analytics-windows';

interface AsyncVisitorsSectionProps {
  windowDays?: AnalyticsWindowDays;
  analytics?: VisitorAnalyticsSnapshot;
}

export async function AsyncVisitorsSection({ windowDays, analytics: analyticsSnapshot }: AsyncVisitorsSectionProps) {
  const analytics = analyticsSnapshot ?? await getVisitorAnalyticsSnapshot(windowDays);

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
            const iconName = visitorMetricIconNames[index] ?? 'bar-chart';
            const variants = ['accent', 'success', 'warning', 'default'] as const;
            return (
              <AnimatedContainer key={metric.label} delay={index * 100} animation="fade-slide">
                <MetricCard
                  label={metric.label}
                  value={metric.value}
                  description={metric.description}
                  iconName={iconName}
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
            iconName="circle-dot"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SignalCard label="Source" value={analytics.source === 'turso_rollup' ? 'Turso' : 'PostHog'} description="Active data path" iconName="radar" tone="blue" />
              <SignalCard label="Covered Days" value={analytics.rollup.coveredDays} description="Persisted daily rows" iconName="bar-chart" tone="emerald" />
              <SignalCard label="Latest Day" value={analytics.rollup.latestDay ?? 'n/a'} description="Newest rollup snapshot" iconName="activity" tone="violet" />
              <SignalCard label="Last Run" value={analytics.rollup.lastRunStatus ?? analytics.rollup.status} description={analytics.rollup.lastRunAt ?? 'No recorded run'} iconName="shield-check" tone={analytics.rollup.status === 'error' ? 'rose' : analytics.rollup.status === 'missing_config' ? 'amber' : 'emerald'} />
            </div>
          </CyberPanel>
        </AnimatedContainer>
      )}

      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
          <AnimatedContainer animation="fade-slide" delay={300}>
            <CyberPanel title="Traffic Pulse" description="Daily PostHog pageviews, visitors, and sessions." iconName="activity">
              <ChartInteraction
                title="Traffic Trends"
                summary={`Daily traffic chart for ${analytics.windowDays} days with ${analytics.trafficSeries.length} data points.`}
                dataDescription={{
                  caption: 'Daily traffic values',
                  rows: analytics.trafficSeries.map((point) => ({
                    label: point.date,
                    value: `${point.pageviews} pageviews`,
                    detail: `${point.visitors} visitors, ${point.sessions} sessions`,
                  })),
                }}
              >
                <DynamicTrafficAreaChart data={analytics.trafficSeries} />
              </ChartInteraction>
            </CyberPanel>
          </AnimatedContainer>
          <AnimatedContainer animation="fade-slide" delay={350}>
            <CyberPanel title="Event Mix" description="Tracked events across the current visitor window." iconName="radar">
              <ChartInteraction
                title="Event Distribution"
                summary={`Event distribution chart with ${analytics.eventMix.length} event rows.`}
                dataDescription={{
                  caption: 'Event distribution values',
                  rows: analytics.eventMix,
                }}
              >
                <DynamicRankedBarChart rows={analytics.eventMix} emptyLabel="No events have been captured yet." />
              </ChartInteraction>
            </CyberPanel>
          </AnimatedContainer>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <AnimatedContainer animation="fade-slide" delay={400}>
            <CyberPanel title="Top Pages" description="Pageview leaders with unique visitor context." iconName="bar-chart">
              <ChartInteraction
                title="Page Performance"
                summary={`Top pages chart with ${analytics.topPages.length} page rows.`}
                dataDescription={{
                  caption: 'Top page performance values',
                  rows: analytics.topPages,
                }}
              >
                <DynamicRankedBarChart rows={analytics.topPages} emptyLabel="No pageviews have been captured yet." />
              </ChartInteraction>
            </CyberPanel>
          </AnimatedContainer>
          <AnimatedContainer animation="fade-slide" delay={450}>
            <CyberPanel title="Device Split" description="Device categories from captured page views." iconName="activity">
              <ChartInteraction
                title="Device Breakdown"
                summary={`Device breakdown chart with ${analytics.devices.length} device rows.`}
                dataDescription={{
                  caption: 'Device breakdown values',
                  rows: analytics.devices,
                }}
              >
                <DynamicDonutBreakdown rows={analytics.devices} emptyLabel="No device categories have been captured yet." centerLabel="Views" />
              </ChartInteraction>
            </CyberPanel>
          </AnimatedContainer>
        </div>

        <AnimatedContainer animation="fade-slide" delay={500}>
          <CyberPanel title="Engagement Matrix" description="Top pages crossed with interaction event families." iconName="activity">
              <ChartInteraction
                title="Engagement Overview"
                summary={`Engagement matrix with ${analytics.pageEngagement.length} page rows.`}
                dataDescription={{
                  caption: 'Page engagement values',
                  rows: analytics.pageEngagement.map((row) => ({
                    label: row.page,
                    value: `${row.pageviews} pageviews`,
                    detail: `${row.visitors} visitors, ${Object.entries(row.interactions).map(([name, count]) => `${name}: ${count}`).join(', ') || 'no interactions'}`,
                  })),
                }}
              >
                <DynamicEngagementMatrix rows={analytics.pageEngagement} />
              </ChartInteraction>
          </CyberPanel>
        </AnimatedContainer>

        <div className="grid gap-4 xl:grid-cols-2">
          <DataList title="Referrers" rows={analytics.referrers} emptyLabel="No referrer data is available yet." iconName="activity" animated />
          <DataList title="Interactions" rows={analytics.interactions} emptyLabel="No interaction events have been captured yet." iconName="activity" animated />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <DataList title="Searches" rows={analytics.searches} emptyLabel="No site searches have been captured yet." iconName="activity" animated />
          <DataList title="Outbound Links" rows={analytics.outboundLinks} emptyLabel="No outbound link clicks have been captured yet." iconName="activity" animated />
          <DataList title="Reading Progress" rows={analytics.readingProgress} emptyLabel="No reading-progress milestones have been captured yet." iconName="activity" animated />
        </div>
      </div>
    </div>
  );
}
