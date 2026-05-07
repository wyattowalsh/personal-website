'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ChartInteractionProps {
  title: string;
  children: React.ReactNode;
  stats?: Array<{ label: string; value: string | number; color?: string; trend?: 'up' | 'down' | 'neutral' }>;
  summary?: React.ReactNode;
  dataDescription?: {
    caption: string;
    rows: Array<{ label: string; value: string | number; detail?: string }>;
  };
  className?: string;
}

export function ChartInteraction({ title, children, stats, summary, dataDescription, className }: ChartInteractionProps) {
  const chartId = useId();
  const titleId = `${chartId}-title`;
  const descriptionId = `${chartId}-description`;
  const hasDescription = Boolean(summary || (dataDescription && dataDescription.rows.length > 0));

  return (
    <figure
      aria-labelledby={titleId}
      aria-describedby={hasDescription ? descriptionId : undefined}
      className={cn(
        'group/chart relative overflow-hidden rounded-xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm transition-all duration-500 hover:border-border/70 hover:bg-card/80 hover:shadow-lg hover:shadow-foreground/[0.03] focus-within:border-border/70 focus-within:bg-card/80 focus-within:shadow-lg focus-within:shadow-foreground/[0.03]',
        className
      )}
    >
      {/* ambient glow on hover */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[hsl(var(--chart-1)/0.04)] opacity-0 blur-3xl transition-opacity duration-700 group-hover/chart:opacity-100" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <h3 id={titleId} className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{title}</h3>
          {hasDescription ? (
            <div id={descriptionId}>
              {summary ? <p className="sr-only">{summary}</p> : null}
              {dataDescription && dataDescription.rows.length > 0 ? (
                <table className="sr-only">
                  <caption>{dataDescription.caption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Label</th>
                      <th scope="col">Value</th>
                      <th scope="col">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataDescription.rows.map((row) => (
                      <tr key={`${row.label}-${row.value}-${row.detail ?? ''}`}>
                        <th scope="row">{row.label}</th>
                        <td>{row.value}</td>
                        <td>{row.detail ?? ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className={cn(
          'flex items-center gap-3 transition-all duration-300',
          stats && stats.length > 0 ? 'opacity-100' : 'opacity-0'
        )}>
          {stats?.slice(0, 3).map((stat, idx) => (
            <div key={idx} className={cn(
              'flex items-center gap-1.5 rounded-md border border-border/40 bg-background/40 px-2 py-1 transition-all duration-300 group-hover/chart:border-border/60 group-hover/chart:bg-background/60 group-focus-within/chart:border-border/60 group-focus-within/chart:bg-background/60'
            )}>
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stat.color || 'currentColor' }} />
              <span className="text-[0.65rem] text-muted-foreground font-mono uppercase tracking-wider">{stat.label}</span>
              <span className="text-xs font-semibold tabular-nums">{stat.value}</span>
              {stat.trend && (
                <span className="ml-0.5">
                  {stat.trend === 'up' && <TrendingUp aria-hidden="true" className="size-3 text-emerald-500" />}
                  {stat.trend === 'down' && <TrendingDown aria-hidden="true" className="size-3 text-destructive" />}
                  {stat.trend === 'neutral' && <Minus aria-hidden="true" className="size-3 text-muted-foreground" />}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 transition-opacity duration-300">
        {children}
      </div>
    </figure>
  );
}
