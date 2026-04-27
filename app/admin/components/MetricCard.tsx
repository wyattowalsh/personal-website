'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const variantStyles = {
  default: 'bg-gradient-to-br from-card/95 to-card/75 border-border/60',
  accent: 'bg-gradient-to-br from-[hsl(var(--chart-1)/0.08)] to-[hsl(var(--chart-1)/0.04)] border-[hsl(var(--chart-1)/0.3)]',
  success: 'bg-gradient-to-br from-emerald-500/8 to-emerald-500/4 border-emerald-500/30',
  warning: 'bg-gradient-to-br from-amber-500/8 to-amber-500/4 border-amber-500/30',
  destructive: 'bg-gradient-to-br from-destructive/8 to-destructive/4 border-destructive/30',
};

const textVariants = {
  default: 'text-foreground',
  accent: 'text-[hsl(var(--chart-1))]',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  destructive: 'text-destructive',
};

export function MetricCard({
  label,
  value,
  change,
  description,
  icon: Icon,
  variant = 'default',
  className,
}: MetricCardProps) {
  const textColor = textVariants[variant];

  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-5 transition-all duration-300 hover:shadow-md hover:border-opacity-100 group',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-3">
            <p className={cn('text-2xl font-bold tabular-nums', textColor)}>{value}</p>
            {change && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-semibold',
                  change.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                )}
              >
                {change.isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                <span>{Math.abs(change.value)}%</span>
              </div>
            )}
          </div>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        {Icon && (
          <div
            className={cn(
              'rounded-lg border p-3 transition-colors group-hover:bg-opacity-100',
              variant === 'default'
                ? 'border-border/40 bg-muted/30'
                : `border-opacity-30 bg-opacity-10`
            )}
          >
            <Icon className={cn('size-5', textColor)} />
          </div>
        )}
      </div>
    </div>
  );
}
