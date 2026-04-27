'use client';

import { Lightbulb, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedContainer } from './AnimatedContainer';

export type InsightType = 'insight' | 'alert' | 'success' | 'action';

const insightStyles = {
  insight: {
    bg: 'bg-gradient-to-br from-[hsl(var(--chart-1)/0.08)] to-[hsl(var(--chart-1)/0.02)]',
    border: 'border-[hsl(var(--chart-1)/0.20)]',
    icon: 'text-[hsl(var(--chart-1))]',
    glow: 'bg-[hsl(var(--chart-1)/0.10)]',
    text: 'text-foreground',
    badge: 'bg-[hsl(var(--chart-1)/0.12)] text-[hsl(var(--chart-1))] border-[hsl(var(--chart-1)/0.20)]',
  },
  alert: {
    bg: 'bg-gradient-to-br from-[hsl(var(--chart-4)/0.08)] to-[hsl(var(--chart-4)/0.02)]',
    border: 'border-[hsl(var(--chart-4)/0.20)]',
    icon: 'text-[hsl(var(--chart-4))]',
    glow: 'bg-[hsl(var(--chart-4)/0.10)]',
    text: 'text-foreground',
    badge: 'bg-[hsl(var(--chart-4)/0.12)] text-[hsl(var(--chart-4))] border-[hsl(var(--chart-4)/0.20)]',
  },
  success: {
    bg: 'bg-gradient-to-br from-[hsl(var(--chart-3)/0.08)] to-[hsl(var(--chart-3)/0.02)]',
    border: 'border-[hsl(var(--chart-3)/0.20)]',
    icon: 'text-[hsl(var(--chart-3))]',
    glow: 'bg-[hsl(var(--chart-3)/0.10)]',
    text: 'text-foreground',
    badge: 'bg-[hsl(var(--chart-3)/0.12)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.20)]',
  },
  action: {
    bg: 'bg-gradient-to-br from-[hsl(var(--chart-2)/0.08)] to-[hsl(var(--chart-2)/0.02)]',
    border: 'border-[hsl(var(--chart-2)/0.20)]',
    icon: 'text-[hsl(var(--chart-2))]',
    glow: 'bg-[hsl(var(--chart-2)/0.10)]',
    text: 'text-foreground',
    badge: 'bg-[hsl(var(--chart-2)/0.12)] text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2)/0.20)]',
  },
};

const iconMap = {
  insight: Lightbulb,
  alert: AlertTriangle,
  success: CheckCircle,
  action: Zap,
};

interface InsightCardProps {
  type?: InsightType;
  title: string;
  description?: string;
  metric?: string | number;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  delay?: number;
}

export function InsightCard({
  type = 'insight',
  title,
  description,
  metric,
  action,
  className,
  delay = 0,
}: InsightCardProps) {
  const style = insightStyles[type];
  const Icon = iconMap[type];

  return (
    <AnimatedContainer delay={delay} animation="fade-slide">
      <div
        className={cn(
          'group/insight relative overflow-hidden rounded-xl border p-4 backdrop-blur-sm transition-all duration-500',
          'hover:shadow-lg hover:shadow-foreground/[0.02] hover:border-opacity-40',
          style.bg,
          style.border,
          className
        )}
      >
        {/* ambient glow on hover */}
        <div className={cn('pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover/insight:opacity-100', style.glow)} />

        <div className="relative z-10 flex items-start gap-3">
          <div className={cn('rounded-lg border p-2 transition-all duration-300 group-hover/insight:scale-110', style.border, 'bg-background/40')}>
            <Icon className={cn('size-4', style.icon)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={cn('font-semibold text-sm', style.text)}>{title}</h3>
                {description && (
                  <p className="text-xs leading-relaxed mt-1 text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              {metric && (
                <div className={cn('rounded-md border px-2 py-0.5 text-xs font-bold whitespace-nowrap backdrop-blur-sm', style.badge)}>
                  {metric}
                </div>
              )}
            </div>
            {action && (
              <button
                onClick={action.onClick}
                className={cn(
                  'mt-3 inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-300 backdrop-blur-sm',
                  'hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]',
                  style.badge
                )}
              >
                {action.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
}
