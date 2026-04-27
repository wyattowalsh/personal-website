'use client';

import { cn } from '@/lib/utils';

interface PerformanceMetric {
  name: string;
  value: number;
  max?: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

const statusColors = {
  excellent: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    bar: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  good: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    bar: 'bg-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
  },
  fair: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    bar: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
  },
  poor: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    bar: 'bg-red-500',
    text: 'text-red-700 dark:text-red-300',
  },
};

interface PerformanceCardProps {
  title: string;
  metrics: PerformanceMetric[];
  description?: string;
}

export function PerformanceCard({
  title,
  metrics,
  description,
}: PerformanceCardProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-5 backdrop-blur-sm">
      <div className="space-y-1 mb-5">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => {
          const colors = statusColors[metric.status];
          const percentage = metric.max
            ? Math.min((metric.value / metric.max) * 100, 100)
            : metric.value;

          return (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{metric.name}</span>
                <span className={cn('text-sm font-semibold', colors.text)}>
                  {metric.value}{metric.max ? `/${metric.max}` : ''}
                </span>
              </div>
              <div className={cn('h-2 rounded-full overflow-hidden', colors.bg)}>
                <div
                  className={cn('h-full rounded-full transition-all duration-500', colors.bar)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-end">
                <span className={cn('text-xs font-medium', colors.text)}>
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
