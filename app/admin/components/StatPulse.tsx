'use client';

import { cn } from '@/lib/utils';

interface StatPulseProps {
  value: number | string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatPulse({ value, label, trend = 'neutral', className }: StatPulseProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-[hsl(var(--chart-1))] blur-sm" />
        <div className={cn(
          'relative h-2 w-2 rounded-full',
          trend === 'up' && 'bg-emerald-500',
          trend === 'down' && 'bg-destructive',
          trend === 'neutral' && 'bg-[hsl(var(--chart-1))]'
        )} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold tabular-nums text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
