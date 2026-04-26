'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Label,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import type { AnalyticsMetric, AnalyticsRow, PageEngagementRow, TrafficPoint } from '../lib/visitor-analytics';

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function parseMetricValue(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const numeric = Number.parseFloat(value.replace(/,/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

function emptyChart(label: string) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/15 px-4 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function TrafficAreaChart({ data }: { data: TrafficPoint[] }) {
  const chartConfig = {
    pageviews: { label: 'Pageviews', color: 'hsl(var(--chart-1))' },
    visitors: { label: 'Visitors', color: 'hsl(var(--chart-3))' },
    sessions: { label: 'Sessions', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig;

  if (data.length === 0) return emptyChart('No traffic series has been captured yet.');

  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 12, bottom: 0 }}>
        <defs>
          <linearGradient id="trafficPageviews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-pageviews)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-pageviews)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="trafficVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-visitors)" stopOpacity={0.26} />
            <stop offset="100%" stopColor="var(--color-visitors)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} tickMargin={10} />
        <YAxis hide />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area type="monotone" dataKey="pageviews" stroke="var(--color-pageviews)" fill="url(#trafficPageviews)" strokeWidth={2} />
        <Area type="monotone" dataKey="visitors" stroke="var(--color-visitors)" fill="url(#trafficVisitors)" strokeWidth={2} />
        <Area type="monotone" dataKey="sessions" stroke="var(--color-sessions)" fill="transparent" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  );
}

export function RankedBarChart({
  rows,
  emptyLabel,
  className,
}: {
  rows: AnalyticsRow[];
  emptyLabel: string;
  className?: string;
}) {
  const data = rows.slice(0, 8).map((row, index) => ({
    label: row.label.length > 28 ? `${row.label.slice(0, 28)}...` : row.label,
    fullLabel: row.label,
    value: parseMetricValue(row.value),
    fill: chartColors[index % chartColors.length],
  }));

  if (data.length === 0) return emptyChart(emptyLabel);

  return (
    <ChartContainer config={{ value: { label: 'Value', color: 'hsl(var(--chart-1))' } }} className={cn('h-72 w-full', className)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
        <XAxis type="number" hide />
        <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={120} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.fullLabel} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function DonutBreakdown({
  rows,
  emptyLabel,
  centerLabel = 'Total',
}: {
  rows: AnalyticsRow[];
  emptyLabel: string;
  centerLabel?: string;
}) {
  const data = rows.slice(0, 6).map((row, index) => ({
    name: row.label,
    value: parseMetricValue(row.value),
    fill: chartColors[index % chartColors.length],
  })).filter((row) => row.value > 0);
  const total = data.reduce((sum, row) => sum + row.value, 0);

  if (data.length === 0) return emptyChart(emptyLabel);

  return (
    <ChartContainer config={{ value: { label: centerLabel, color: 'hsl(var(--chart-1))' } }} className="h-64 w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;
              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-semibold tabular-nums">
                    {total.toLocaleString()}
                  </tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 18} className="fill-muted-foreground text-[0.65rem] uppercase tracking-[0.16em]">
                    {centerLabel}
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

export function ScoreRadials({ metrics }: { metrics: AnalyticsMetric[] }) {
  const data = metrics.slice(0, 4).map((metric, index) => ({
    ...metric,
    score: Math.max(0, Math.min(100, parseMetricValue(metric.value))),
    fill: chartColors[index % chartColors.length],
  }));

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((metric) => (
        <div key={metric.label} className="rounded-lg border border-border/80 bg-background/55 p-3">
          <ChartContainer config={{ score: { label: metric.label, color: metric.fill } }} className="mx-auto aspect-square h-36">
            <RadialBarChart data={[metric]} startAngle={90} endAngle={-270} innerRadius={48} outerRadius={66}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="score" background cornerRadius={8} fill={metric.fill} />
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-semibold tabular-nums">
                        {metric.value}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 18} className="fill-muted-foreground text-[0.6rem] uppercase tracking-[0.14em]">
                        {metric.label}
                      </tspan>
                    </text>
                  );
                }}
              />
            </RadialBarChart>
          </ChartContainer>
          <p className="mt-1 text-center text-xs leading-5 text-muted-foreground">{metric.description}</p>
        </div>
      ))}
    </div>
  );
}

export function EngagementMatrix({ rows }: { rows: PageEngagementRow[] }) {
  const events = Array.from(new Set(rows.flatMap((row) => Object.keys(row.interactions)))).slice(0, 6);
  const max = Math.max(1, ...rows.flatMap((row) => [row.pageviews, ...Object.values(row.interactions)]));

  if (rows.length === 0) return emptyChart('No page engagement events have been captured yet.');

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px] space-y-2">
        <div className="grid grid-cols-[minmax(160px,1fr)_repeat(7,72px)] gap-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
          <span>Page</span>
          <span>Views</span>
          <span>Visitors</span>
          {events.map((event) => <span key={event}>{event.replace(/_/g, ' ')}</span>)}
        </div>
        {rows.map((row) => (
          <div key={row.page} className="grid grid-cols-[minmax(160px,1fr)_repeat(7,72px)] items-center gap-1">
            <span className="truncate text-sm font-medium" title={row.page}>{row.page}</span>
            <MatrixCell value={row.pageviews} max={max} tone="blue" />
            <MatrixCell value={row.visitors} max={max} tone="emerald" />
            {events.map((event, index) => (
              <MatrixCell key={event} value={row.interactions[event] ?? 0} max={max} tone={index % 2 === 0 ? 'violet' : 'rose'} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixCell({ value, max, tone }: { value: number; max: number; tone: 'blue' | 'emerald' | 'violet' | 'rose' }) {
  const color = {
    blue: 'var(--chart-1)',
    emerald: 'var(--chart-3)',
    violet: 'var(--chart-2)',
    rose: 'var(--chart-5)',
  }[tone];
  const opacity = value === 0 ? 0.08 : 0.16 + (value / max) * 0.58;

  return (
    <div
      className="rounded-md border border-border/70 px-2 py-1 text-right font-mono text-xs tabular-nums"
      style={{ backgroundColor: `hsl(${color} / ${opacity})` }}
    >
      {value.toLocaleString()}
    </div>
  );
}

export function StatusTimeline({ rows }: { rows: AnalyticsRow[] }) {
  if (rows.length === 0) return emptyChart('No timeline rows returned.');

  return (
    <div className="space-y-2">
      {rows.slice(0, 8).map((row) => {
        const state = row.value.toLowerCase();
        const color = state.includes('success') || state.includes('ready') || state.includes('up')
          ? 'bg-[hsl(var(--chart-3))]'
          : state.includes('fail') || state.includes('down') || state.includes('error')
            ? 'bg-[hsl(var(--chart-5))]'
            : 'bg-[hsl(var(--chart-4))]';

        return (
          <div key={`${row.label}-${row.detail ?? ''}`} className="grid grid-cols-[12px_1fr_auto] items-start gap-3 rounded-lg border border-border/70 bg-background/45 p-3">
            <span className={cn('mt-1 size-2.5 rounded-full shadow-[0_0_14px_currentColor]', color)} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{row.label}</p>
              {row.detail ? <p className="truncate text-xs text-muted-foreground">{row.detail}</p> : null}
            </div>
            <span className="rounded-md border border-border/80 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
              {row.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
