'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  animated?: boolean;
}

export function Skeleton({ className, animated = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-muted/50',
        animated && 'animate-pulse',
        className
      )}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-5 w-full" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-5 space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-72 w-full" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
