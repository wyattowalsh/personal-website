'use client';

import { cn } from '@/lib/utils';
import { BookOpen, FileText, RefreshCw, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

type DashboardHeaderIconName = 'book-open' | 'file-text' | 'trending-up';

const dashboardHeaderIconMap = {
  'book-open': BookOpen,
  'file-text': FileText,
  'trending-up': TrendingUp,
} satisfies Record<DashboardHeaderIconName, typeof BookOpen>;

interface QuickStatProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  iconName?: DashboardHeaderIconName;
}

export function QuickStat({ label, value, icon, iconName }: QuickStatProps) {
  const NamedIcon = iconName ? dashboardHeaderIconMap[iconName] : undefined;

  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-muted/40 border border-border/60 backdrop-blur-sm">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      {!icon && NamedIcon ? (
        <div className="text-muted-foreground">
          <NamedIcon className="size-4" />
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-base font-semibold text-foreground tabular-nums">{value}</p>
      </div>
    </div>
  );
}

interface DashboardHeaderProps {
  title: string;
  description?: string;
  stats?: QuickStatProps[];
  actions?: ReactNode;
  isLoading?: boolean;
  lastUpdated?: string;
  onRefresh?: () => void;
}

export function DashboardHeader({
  title,
  description,
  stats,
  actions,
  isLoading,
  lastUpdated,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {/* Stats Row */}
      {stats && stats.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {stats.map((stat) => (
            <QuickStat key={stat.label} {...stat} />
          ))}
        </div>
      )}

      {/* Meta Info */}
      <div className="flex flex-col items-start justify-between gap-2 pt-2 sm:flex-row sm:items-center sm:gap-3">
        {lastUpdated && (
          <div className="text-xs text-muted-foreground">
            <span>Last updated: {lastUpdated}</span>
          </div>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors',
              'border border-border/60 hover:border-border/80 hover:bg-muted/60 hover:shadow-sm',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>
    </div>
  );
}
