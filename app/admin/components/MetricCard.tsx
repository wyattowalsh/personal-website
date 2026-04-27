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
}

const variantStyles = {
  default: 'bg-gradient-to-br from-card/95 to-card/75 border-border/60 hover:border-border/80',
  accent: 'bg-gradient-to-br from-[hsl(var(--chart-1)/0.08)] to-[hsl(var(--chart-1)/0.04)] border-[hsl(var(--chart-1)/0.3)] hover:border-[hsl(var(--chart-1)/0.5)] hover:from-[hsl(var(--chart-1)/0.12)] hover:to-[hsl(var(--chart-1)/0.06)]',
  success: 'bg-gradient-to-br from-emerald-500/8 to-emerald-500/4 border-emerald-500/30 hover:border-emerald-500/50 hover:from-emerald-500/12 hover:to-emerald-500/6',
  warning: 'bg-gradient-to-br from-amber-500/8 to-amber-500/4 border-amber-500/30 hover:border-amber-500/50 hover:from-amber-500/12 hover:to-amber-500/6',
  destructive: 'bg-gradient-to-br from-destructive/8 to-destructive/4 border-destructive/30 hover:border-destructive/50 hover:from-destructive/12 hover:to-destructive/6',
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
}: MetricCardProps) {
  const textColor = textVariants[variant];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border px-4 py-5 transition-all duration-300 hover:shadow-lg hover:shadow-[hsl(var(--chart-1))/0.08] hover:border-opacity-100',
        variantStyles[variant],
        className
      )}
    >
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground animate-in fade-in duration-500">{label}</p>
            <div className="mt-2 flex items-baseline gap-3">
              <p className={cn('text-2xl font-bold tabular-nums transition-colors duration-300', textColor)}>{value}</p>
              {change && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-semibold transition-all duration-300',
                    change.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                  )}
                >
                  {change.isPositive ? <ArrowUp className="size-3 animate-in slide-in-from-bottom duration-500" /> : <ArrowDown className="size-3 animate-in slide-in-from-top duration-500" />}
                  <span>{Math.abs(change.value)}%</span>
                </div>
              )}
            </div>
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
          {Icon && (
            <div
              className={cn(
                'rounded-lg border p-3 transition-all duration-300',
                variant === 'default'
                  ? 'border-border/40 bg-muted/30 group-hover:bg-muted/50'
                  : `border-opacity-30 bg-opacity-10 group-hover:bg-opacity-15`
              )}
            >
              <Icon className={cn('size-5 transition-transform duration-300 group-hover:scale-110', textColor)} />
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
            className="opacity-50 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </div>
    </div>
  );
}
