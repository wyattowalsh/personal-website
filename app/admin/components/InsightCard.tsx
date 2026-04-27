'use client';

import { Lightbulb, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type InsightType = 'insight' | 'alert' | 'success' | 'action';

const insightStyles = {
  insight: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-25 dark:from-blue-950/30 dark:to-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800/50',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-950 dark:text-blue-100',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  },
  alert: {
    bg: 'bg-gradient-to-br from-amber-50 to-amber-25 dark:from-amber-950/30 dark:to-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800/50',
    icon: 'text-amber-600 dark:text-amber-400',
    text: 'text-amber-950 dark:text-amber-100',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  },
  success: {
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-25 dark:from-emerald-950/30 dark:to-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    icon: 'text-emerald-600 dark:text-emerald-400',
    text: 'text-emerald-950 dark:text-emerald-100',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  },
  action: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-25 dark:from-purple-950/30 dark:to-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800/50',
    icon: 'text-purple-600 dark:text-purple-400',
    text: 'text-purple-950 dark:text-purple-100',
    badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
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
}

export function InsightCard({
  type = 'insight',
  title,
  description,
  metric,
  action,
  className,
}: InsightCardProps) {
  const style = insightStyles[type];
  const Icon = iconMap[type];

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all hover:shadow-sm',
        style.bg,
        style.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('size-5 shrink-0 mt-0.5', style.icon)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={cn('font-semibold', style.text)}>{title}</h3>
              {description && (
                <p className={cn('text-sm leading-relaxed mt-1', style.text + ' opacity-90')}>
                  {description}
                </p>
              )}
            </div>
            {metric && (
              <div className={cn('rounded px-2 py-1 text-sm font-bold whitespace-nowrap', style.badge)}>
                {metric}
              </div>
            )}
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'mt-3 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors',
                'hover:opacity-80 active:opacity-70',
                style.badge
              )}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
