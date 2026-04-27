'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  animated?: boolean;
  variant?: 'pulse' | 'shimmer';
}

export function Skeleton({ className, animated = true, variant = 'shimmer' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-muted/50',
        animated && variant === 'pulse' && 'animate-pulse',
        animated && variant === 'shimmer' && 'shimmer-skeleton',
        className
      )}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-3 overflow-hidden">
      <Skeleton className="h-4 w-24" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-5 w-full" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4 overflow-hidden">
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

export function ProviderCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden space-y-0">
      <div className="p-4 border-b border-border/30 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-full max-w-[280px]" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <Skeleton className="h-5 w-48 rounded-md" />
      </div>
      <div className="p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-muted to-transparent" />
      <div className="space-y-3 max-w-3xl">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-full max-w-[500px]" />
      </div>
    </div>
  );
}
