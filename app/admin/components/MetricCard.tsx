'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  icon?: LucideIcon;
  trend?: number[];
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'destructive';
  className?: string;
  interactive?: boolean;
}

const variantStyles = {
  default: 'bg-gradient-to-br from-card/95 to-card/75 border-border/60 hover:border-border/80',
  accent: 'bg-gradient-to-br from-[hsl(var(--chart-1)/0.08)] to-[hsl(var(--chart-1)/0.04)] border-[hsl(var(--chart-1)/0.3)] hover:border-[hsl(var(--chart-1)/0.5)]',
  success: 'bg-gradient-to-br from-emerald-500/8 to-emerald-500/4 border-emerald-500/30 hover:border-emerald-500/50',
  warning: 'bg-gradient-to-br from-amber-500/8 to-amber-500/4 border-amber-500/30 hover:border-amber-500/50',
  destructive: 'bg-gradient-to-br from-destructive/8 to-destructive/4 border-destructive/30 hover:border-destructive/50',
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
  trend,
  variant = 'default',
  className,
  interactive = true,
}: MetricCardProps) {
  const textColor = textVariants[variant];

  return (
    <div
      className={cn(
        'group/card relative overflow-hidden rounded-xl border p-5 transition-all duration-500',
        interactive && 'hover:shadow-lg hover:shadow-foreground/[0.04] cursor-default',
        variantStyles[variant],
        className
      )}
    >
      {/* ambient glow on hover */}
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover/card:opacity-100',
          variant === 'accent' && 'bg-[hsl(var(--chart-1)/0.08)]',
          variant === 'success' && 'bg-emerald-500/8',
          variant === 'warning' && 'bg-amber-500/8',
          variant === 'destructive' && 'bg-destructive/8',
          variant === 'default' && 'bg-foreground/[0.03]'
        )}
      />

      {/* shimmer sweep on hover */}
      {interactive && (
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-in-out" />
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
            <div className="mt-2 flex items-baseline gap-3">
              <p className={cn('text-2xl font-bold tabular-nums tracking-tight transition-colors duration-300', textColor)}>{value}</p>
              {change && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-semibold transition-all duration-300',
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
                'rounded-lg border p-2.5 transition-all duration-300 shadow-sm',
                variant === 'default' && 'border-border/40 bg-muted/30 group-hover/card:bg-muted/50',
                variant === 'accent' && 'border-[hsl(var(--chart-1)/0.3)] bg-[hsl(var(--chart-1)/0.1)]',
                variant === 'success' && 'border-emerald-500/30 bg-emerald-500/10',
                variant === 'warning' && 'border-amber-500/30 bg-amber-500/10',
                variant === 'destructive' && 'border-destructive/30 bg-destructive/10',
                interactive && 'group-hover/card:scale-110 group-hover/card:shadow-md'
              )}
            >
              <Icon className={cn('size-4 transition-all duration-300 group-hover/card:scale-125', textColor)} />
            </div>
          )}
        </div>

        {/* Sparkline trend visualization */}
        {trend && trend.length > 1 && (
          <Sparkline
            data={trend}
            color={
              variant === 'accent'
                ? 'hsl(var(--chart-1))'
                : variant === 'success'
                  ? '#10b981'
                  : variant === 'warning'
                    ? '#f59e0b'
                    : variant === 'destructive'
                      ? 'hsl(var(--destructive))'
                      : 'currentColor'
            }
            height={20}
            className={cn('transition-opacity duration-300', interactive && 'opacity-50 group-hover/card:opacity-100')}
          />
        )}
      </div>
    </div>
  );
}

