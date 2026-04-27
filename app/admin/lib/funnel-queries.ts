import 'server-only';

import type { AnalyticsWindowDays } from './analytics-windows';
import { DEFAULT_ANALYTICS_WINDOW_DAYS } from './analytics-constants';
import { getPostHogConfig, queryPostHog, type PostHogConfig } from './posthog-query';
import { getRollupConfig } from './analytics-rollups';

export interface FunnelStage {
  name: string;
  count: number;
  previousCount?: number;
  conversionRate: number;
  dropOffRate: number;
}

export async function getVisitorFunnel(
  windowDays: AnalyticsWindowDays = DEFAULT_ANALYTICS_WINDOW_DAYS
): Promise<FunnelStage[]> {
  const { config } = getPostHogConfig();

  if (config) {
    return getPostHogFunnel(config, windowDays);
  }

  const { config: rollupConfig } = getRollupConfig();
  if (rollupConfig) {
    return getRollupFunnel(windowDays);
  }

  return getDefaultFunnel();
}

async function getPostHogFunnel(
  config: PostHogConfig,
  windowDays: number
): Promise<FunnelStage[]> {
  try {
    const [visitorRows, engagedRows, convertedRows] = await Promise.all([
      queryPostHog(
        config,
        'admin funnel visitors',
        `SELECT uniqExact(distinct_id) AS visitors
         FROM events
         WHERE timestamp >= now() - INTERVAL ${windowDays} DAY AND event = '$pageview'`
      ),
      queryPostHog(
        config,
        'admin funnel engaged',
        `SELECT uniqExact(distinct_id) AS engaged
         FROM events
         WHERE timestamp >= now() - INTERVAL ${windowDays} DAY
           AND event = 'scroll_depth'
           AND properties.percent > 50`
      ),
      queryPostHog(
        config,
        'admin funnel converted',
        `SELECT uniqExact(distinct_id) AS converted
         FROM events
         WHERE timestamp >= now() - INTERVAL ${windowDays} DAY
           AND event IN ('link_click', 'share_click')`
      ),
    ]);

    const visitors = Number(visitorRows[0]?.[0] ?? 0);
    const engaged = Number(engagedRows[0]?.[0] ?? 0);
    const converted = Number(convertedRows[0]?.[0] ?? 0);

    return buildFunnelStages(visitors, engaged, converted);
  } catch {
    return getDefaultFunnel();
  }
}

async function getRollupFunnel(_windowDays: number): Promise<FunnelStage[]> {
  return getDefaultFunnel();
}

function buildFunnelStages(visitors: number, engaged: number, converted: number): FunnelStage[] {
  const visitorToEngagedRate = visitors > 0 ? (engaged / visitors) * 100 : 0;
  const engagedToConvertedRate = engaged > 0 ? (converted / engaged) * 100 : 0;

  return [
    {
      name: 'Visitors',
      count: visitors,
      conversionRate: 100,
      dropOffRate: 0,
    },
    {
      name: 'Engaged (>50% scroll)',
      count: engaged,
      previousCount: visitors,
      conversionRate: Number(visitorToEngagedRate.toFixed(1)),
      dropOffRate: Number((100 - visitorToEngagedRate).toFixed(1)),
    },
    {
      name: 'Converted (CTA click)',
      count: converted,
      previousCount: engaged,
      conversionRate: Number(engagedToConvertedRate.toFixed(1)),
      dropOffRate: Number((100 - engagedToConvertedRate).toFixed(1)),
    },
  ];
}

function getDefaultFunnel(): FunnelStage[] {
  return [
    { name: 'Visitors', count: 0, conversionRate: 100, dropOffRate: 0 },
    { name: 'Engaged (>50% scroll)', count: 0, previousCount: 0, conversionRate: 0, dropOffRate: 0 },
    { name: 'Converted (CTA click)', count: 0, previousCount: 0, conversionRate: 0, dropOffRate: 0 },
  ];
}
