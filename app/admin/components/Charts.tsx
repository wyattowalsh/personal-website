'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import type { AnalyticsMetric, AnalyticsRow } from '../lib/visitor-analytics';

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

interface EnhancedTrafficAreaChartProps {
  data: Array<{
    date: string;
    pageviews: number;
    visitors: number;
    sessions: number;
  }>;
}

export function EnhancedTrafficAreaChart({ data }: EnhancedTrafficAreaChartProps) {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const chartConfig = {
    pageviews: { label: 'Pageviews', color: 'hsl(var(--chart-1))' },
    visitors: { label: 'Visitors', color: 'hsl(var(--chart-3))' },
    sessions: { label: 'Sessions', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig;

  const stats = useMemo(() => {
    if (data.length === 0) return { avgPageviews: 0, avgVisitors: 0, avgSessions: 0, maxPageviews: 0 };
    return {
      avgPageviews: Math.round(data.reduce((sum, d) => sum + d.pageviews, 0) / data.length),
      avgVisitors: Math.round(data.reduce((sum, d) => sum + d.visitors, 0) / data.length),
      avgSessions: Math.round(data.reduce((sum, d) => sum + d.sessions, 0) / data.length),
      maxPageviews: Math.max(...data.map(d => d.pageviews)),
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/15 text-center text-sm text-muted-foreground">
        No traffic data captured yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend with stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {Object.entries(chartConfig).map(([key, config]) => (
          <div
            key={key}
            onMouseEnter={() => setHoveredMetric(key)}
            onMouseLeave={() => setHoveredMetric(null)}
            className={cn(
              'rounded-lg border border-border/50 bg-muted/30 p-3 transition-all cursor-pointer',
              hoveredMetric === key && 'border-foreground/30 bg-muted/60 shadow-md'
            )}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{config.label}</p>
            <p className="mt-1 text-xl font-bold" style={{ color: config.color }}>
              {key === 'pageviews' ? stats.avgPageviews.toLocaleString() : key === 'visitors' ? stats.avgVisitors.toLocaleString() : stats.avgSessions.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Average</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <AreaChart data={data} margin={{ left: 4, right: 8, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="trafficPageviews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-pageviews)" stopOpacity={hoveredMetric === 'pageviews' ? 0.5 : 0.3} />
              <stop offset="100%" stopColor="var(--color-pageviews)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="trafficVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-visitors)" stopOpacity={hoveredMetric === 'visitors' ? 0.5 : 0.26} />
              <stop offset="100%" stopColor="var(--color-visitors)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} tickMargin={10} />
          <YAxis hide />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Area
            type="monotone"
            dataKey="pageviews"
            stroke="var(--color-pageviews)"
            fill="url(#trafficPageviews)"
            strokeWidth={hoveredMetric === 'pageviews' ? 3 : 2}
            isAnimationActive={true}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke="var(--color-visitors)"
            fill="url(#trafficVisitors)"
            strokeWidth={hoveredMetric === 'visitors' ? 3 : 2}
            isAnimationActive={true}
          />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="var(--color-sessions)"
            fill="transparent"
            strokeWidth={hoveredMetric === 'sessions' ? 3 : 2}
            isAnimationActive={true}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

interface EnhancedRankedBarChartProps {
  rows: AnalyticsRow[];
  emptyLabel: string;
  className?: string;
  maxItems?: number;
}

export function EnhancedRankedBarChart({
  rows,
  emptyLabel,
  className,
  maxItems = 10,
}: EnhancedRankedBarChartProps) {
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  function parseMetricValue(value: string | number | undefined): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const numeric = Number.parseFloat(value.replace(/,/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  }

  const data = useMemo(() => {
    return rows.slice(0, maxItems).map((row, index) => ({
      label: row.label.length > 32 ? `${row.label.slice(0, 32)}...` : row.label,
      fullLabel: row.label,
      value: parseMetricValue(row.value),
      fill: chartColors[index % chartColors.length],
    }));
  }, [rows, maxItems]);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  const average = useMemo(() => (data.length > 0 ? Math.round(total / data.length) : 0), [data, total]);

  if (data.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/15 px-4 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="mt-1 text-xl font-bold text-foreground">{total.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average</p>
          <p className="mt-1 text-xl font-bold text-foreground">{average.toLocaleString()}</p>
        </div>
      </div>

      {/* Chart */}
      <ChartContainer config={{ value: { label: 'Value', color: 'hsl(var(--chart-1))' } }} className={cn('h-80 w-full', className)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" vertical={true} />
          <XAxis type="number" hide />
          <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={140} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Bar
            dataKey="value"
            radius={[0, 8, 8, 0]}
            onMouseEnter={(_, index) => setSelectedBar(index)}
            onMouseLeave={() => setSelectedBar(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.fullLabel}
                fill={entry.fill}
                opacity={selectedBar === null || selectedBar === index ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

interface EnhancedDonutBreakdownProps {
  rows: AnalyticsRow[];
  emptyLabel: string;
  centerLabel?: string;
}

export function EnhancedDonutBreakdown({
  rows,
  emptyLabel,
  centerLabel = 'Total',
}: EnhancedDonutBreakdownProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function parseMetricValue(value: string | number | undefined): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const numeric = Number.parseFloat(value.replace(/,/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  }

  const data = useMemo(() => {
    return rows
      .slice(0, 8)
      .map((row, index) => ({
        name: row.label,
        value: parseMetricValue(row.value),
        fill: chartColors[index % chartColors.length],
      }))
      .filter((row) => row.value > 0);
  }, [rows]);

  const total = useMemo(() => data.reduce((sum, row) => sum + row.value, 0), [data]);

  if (data.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/15 px-4 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend with breakdown */}
      <div className="grid gap-2 sm:grid-cols-2">
        {data.map((entry, index) => {
          const percentage = ((entry.value / total) * 100).toFixed(1);
          return (
            <button
              key={entry.name}
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              className={cn(
                'rounded-lg border border-border/50 bg-muted/30 p-2 text-left transition-all hover:bg-muted/60',
                activeIndex === index && 'border-foreground/30 bg-muted/60'
              )}
            >
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.value.toLocaleString()} ({percentage}%)</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <ChartContainer config={{ value: { label: centerLabel, color: 'hsl(var(--chart-1))' } }} className="h-72 w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={56}
            outerRadius={92}
            paddingAngle={2}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={entry.fill}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
              />
            ))}
          </Pie>
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan x="50%" y="45%" className="fill-foreground text-2xl font-bold">
              {total.toLocaleString()}
            </tspan>
            <tspan x="50%" y="62%" className="fill-muted-foreground text-xs uppercase tracking-wider">
              {centerLabel}
            </tspan>
          </text>
        </PieChart>
      </ChartContainer>
    </div>
  );
}

interface EnhancedScoreRadialsProps {
  metrics: AnalyticsMetric[];
}

export function EnhancedScoreRadials({ metrics }: EnhancedScoreRadialsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  function parseMetricValue(value: string | number | undefined): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const numeric = Number.parseFloat(value.replace(/,/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  }

  const data = useMemo(() => {
    return metrics.slice(0, 4).map((metric, index) => ({
      ...metric,
      score: Math.max(0, Math.min(100, parseMetricValue(metric.value))),
      fill: chartColors[index % chartColors.length],
    }));
  }, [metrics]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((metric, index) => (
        <div
          key={metric.label}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={cn(
            'rounded-lg border border-border/80 bg-background/55 p-4 transition-all',
            hoveredIndex === index && 'border-foreground/30 bg-background/85 shadow-lg'
          )}
        >
          <ChartContainer config={{ score: { label: metric.label, color: metric.fill } }} className="mx-auto aspect-square h-40">
            <RadialBarChart data={[metric]} startAngle={90} endAngle={-270} innerRadius={52} outerRadius={72}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="score" background cornerRadius={12} fill={metric.fill} isAnimationActive={true} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                <tspan x="50%" y="45%" className="fill-foreground text-2xl font-bold">
                  {metric.score}
                </tspan>
                <tspan x="50%" y="62%" className="fill-muted-foreground text-xs uppercase tracking-wider">
                  {metric.label}
                </tspan>
              </text>
            </RadialBarChart>
          </ChartContainer>
          <div className="mt-3 space-y-1 text-center">
            <p className="text-xs leading-5 text-muted-foreground">{metric.description}</p>
            <p className="text-xs font-semibold text-foreground">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
