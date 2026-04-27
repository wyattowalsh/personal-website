'use client';

import { cn } from '@/lib/utils';

interface StatPulseProps {
  value: number | string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatPulse({ value, label, trend = 'neutral', className }: StatPulseProps) {
  const toneColor = {
    up: 'bg-emerald-500',
    down: 'bg-destructive',
    neutral: 'bg-[hsl(var(--chart-1))]',
  }[trend];

  const glowColor = {
    up: 'shadow-emerald-500/50',
    down: 'shadow-destructive/50',
    neutral: 'shadow-[hsl(var(--chart-1))/0.5]',
  }[trend];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex items-center justify-center">
        {/* breathing outer glow */}
        <span className={cn(
          'absolute inline-flex h-full w-full animate-ping rounded-full opacity-40',
          toneColor
        )} />
        {/* inner glow */}
        <span className={cn(
          'absolute h-3 w-3 rounded-full blur-sm opacity-60',
          toneColor
        )} />
        {/* core dot */}
        <span className={cn(
          'relative inline-flex h-2 w-2 rounded-full',
          toneColor,
          glowColor,
          'shadow-[0_0_8px_currentColor]'
        )} />
      </div>
      <div className="flex flex-col gap-0">
        <span className="text-xs font-semibold tabular-nums text-foreground leading-tight">{value}</span>
        <span className="text-[0.65rem] text-muted-foreground leading-tight">{label}</span>
      </div>
    </div>
  );
}
