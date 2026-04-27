'use client';

import dynamic from 'next/dynamic';
import { Skeleton, ChartSkeleton, MetricCardSkeleton } from './Skeleton';

// Dynamic imports for Recharts-based components (54KB chunk)
export const DynamicTrafficAreaChart = dynamic(
  () => import('./Charts').then((mod) => ({ default: mod.EnhancedTrafficAreaChart })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

export const DynamicRankedBarChart = dynamic(
  () => import('./Charts').then((mod) => ({ default: mod.EnhancedRankedBarChart })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

export const DynamicDonutBreakdown = dynamic(
  () => import('./Charts').then((mod) => ({ default: mod.EnhancedDonutBreakdown })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

export const DynamicScoreRadials = dynamic(
  () => import('./Charts').then((mod) => ({ default: mod.EnhancedScoreRadials })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

// Dynamic imports for AdminCharts
export const DynamicEngagementMatrix = dynamic(
  () => import('./AdminCharts').then((mod) => ({ default: mod.EngagementMatrix })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

export const DynamicStatusTimeline = dynamic(
  () => import('./AdminCharts').then((mod) => ({ default: mod.StatusTimeline })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    ),
  }
);

// Section skeletons for Suspense fallbacks
export function VisitorsSectionSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <ChartSkeleton />
    </div>
  );
}

export function ProviderSectionSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card/50 overflow-hidden space-y-0">
          <div className="p-4 border-b border-border/30 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-72" />
              </div>
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            <Skeleton className="h-5 w-48 rounded-md" />
          </div>
          <div className="p-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <MetricCardSkeleton key={j} />
              ))}
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SignalsSectionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShellProvidersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-28" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
