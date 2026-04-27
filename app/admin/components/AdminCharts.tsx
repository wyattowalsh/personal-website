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
import { EmptyState } from './AdminVisuals';
import { AnimatedContainer } from './AnimatedContainer';

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

/* ── EmptyChart ──────────────────────────────────────────────────── */
function emptyChart(label: string) {
  return <EmptyState label={label} />;
}

/* ── TrafficAreaChart ────────────────────────────────────────────── */
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
            <stop offset="0%" stopColor="var(--color-pageviews)" stopOpacity={0.35} />
            <stop offset="60%" stopColor="var(--color-pageviews)" stopOpacity={0.08} />
            <stop offset="100%" stopColor="var(--color-pageviews)" stopOpacity={0.01} />
          </linearGradient>
          <linearGradient id="trafficVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-visitors)" stopOpacity={0.28} />
            <stop offset="60%" stopColor="var(--color-visitors)" stopOpacity={0.06} />
            <stop offset="100%" stopColor="var(--color-visitors)" stopOpacity={0.01} />
          </linearGradient>
          <linearGradient id="trafficSessions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-sessions)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--color-sessions)" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} tickMargin={10} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis hide />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area type="monotone" dataKey="pageviews" stroke="var(--color-pageviews)" fill="url(#trafficPageviews)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--color-pageviews)' }} />
        <Area type="monotone" dataKey="visitors" stroke="var(--color-visitors)" fill="url(#trafficVisitors)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--color-visitors)' }} />
        <Area type="monotone" dataKey="sessions" stroke="var(--color-sessions)" fill="url(#trafficSessions)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, strokeWidth: 0, fill: 'var(--color-sessions)' }} />
      </AreaChart>
    </ChartContainer>
  );
}

/* ── RankedBarChart ──────────────────────────────────────────────── */
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
        <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={120} tickMargin={8} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: 'hsl(var(--muted) / 0.3)', radius: 4 }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((entry) => (
            <Cell key={entry.fullLabel} fill={entry.fill} className="transition-opacity duration-200 hover:opacity-80" />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

/* ── DonutBreakdown ──────────────────────────────────────────────── */
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
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={3} strokeWidth={2} stroke="hsl(var(--card))">
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} className="transition-all duration-300 hover:opacity-80" />
          ))}
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;
              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold tabular-nums tracking-tight">
                    {total.toLocaleString()}
                  </tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-[0.6rem] uppercase tracking-[0.18em]">
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

/* ── ScoreRadials ────────────────────────────────────────────────── */
export function ScoreRadials({ metrics }: { metrics: AnalyticsMetric[] }) {
  const data = metrics.slice(0, 4).map((metric, index) => ({
    ...metric,
    score: Math.max(0, Math.min(100, parseMetricValue(metric.value))),
    fill: chartColors[index % chartColors.length],
  }));

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((metric, index) => (
        <AnimatedContainer key={metric.label} delay={index * 80} animation="scale" duration={500}>
          <div className="group/radial relative overflow-hidden rounded-xl border border-border/50 bg-background/40 p-3 backdrop-blur-sm transition-all duration-300 hover:border-border/70 hover:shadow-sm">
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover/radial:opacity-100" style={{ backgroundColor: metric.fill.replace('hsl', 'hsla').replace(')', ' / 0.12)') }} />
            <ChartContainer config={{ score: { label: metric.label, color: metric.fill } }} className="mx-auto aspect-square h-36">
              <RadialBarChart data={[metric]} startAngle={90} endAngle={-270} innerRadius={46} outerRadius={64}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="score" background={{ fill: 'hsl(var(--muted) / 0.3)' }} cornerRadius={8} fill={metric.fill} className="transition-all duration-500" />
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold tabular-nums tracking-tight">
                          {metric.value}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-[0.6rem] uppercase tracking-[0.14em]">
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
        </AnimatedContainer>
      ))}
    </div>
  );
}

/* ── EngagementMatrix ────────────────────────────────────────────── */
export function EngagementMatrix({ rows }: { rows: PageEngagementRow[] }) {
  const events = Array.from(new Set(rows.flatMap((row) => Object.keys(row.interactions)))).slice(0, 6);
  const max = Math.max(1, ...rows.flatMap((row) => [row.pageviews, ...Object.values(row.interactions)]));

  if (rows.length === 0) return emptyChart('No page engagement events have been captured yet.');

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px] space-y-1.5">
        {/* Header */}
        <div className="grid grid-cols-[minmax(160px,1fr)_repeat(7,72px)] gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground/70 pb-1 border-b border-border/30">
          <span className="pl-1">Page</span>
          <span className="text-right pr-1">Views</span>
          <span className="text-right pr-1">Visitors</span>
          {events.map((event) => <span key={event} className="text-right pr-1">{event.replace(/_/g, ' ')}</span>)}
        </div>
        {/* Rows */}
        {rows.map((row, rowIndex) => (
          <AnimatedContainer key={row.page} delay={rowIndex * 40} animation="fade-slide" duration={400}>
            <div className="grid grid-cols-[minmax(160px,1fr)_repeat(7,72px)] items-center gap-1.5 rounded-lg border border-border/30 bg-background/[0.02] p-1.5 transition-all duration-200 hover:border-border/50 hover:bg-background/[0.06]">
              <span className="truncate text-sm font-medium pl-1" title={row.page}>{row.page}</span>
              <MatrixCell value={row.pageviews} max={max} tone="blue" />
              <MatrixCell value={row.visitors} max={max} tone="emerald" />
              {events.map((event, index) => (
                <MatrixCell key={event} value={row.interactions[event] ?? 0} max={max} tone={index % 2 === 0 ? 'violet' : 'rose'} />
              ))}
            </div>
          </AnimatedContainer>
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
  const opacity = value === 0 ? 0.06 : 0.12 + (value / max) * 0.52;

  return (
    <div
      className="rounded-md border border-border/40 px-2 py-1 text-right font-mono text-xs tabular-nums transition-all duration-200 hover:scale-105 hover:border-border/60"
      style={{ backgroundColor: `hsl(${color} / ${opacity})` }}
    >
      {value.toLocaleString()}
    </div>
  );
}

/* ── StatusTimeline ──────────────────────────────────────────────── */
export function StatusTimeline({ rows }: { rows: AnalyticsRow[] }) {
  if (rows.length === 0) return emptyChart('No timeline rows returned.');

  return (
    <div className="space-y-1.5">
      {rows.slice(0, 8).map((row, index) => {
        const state = row.value.toLowerCase();
        const isSuccess = state.includes('success') || state.includes('ready') || state.includes('up');
        const isError = state.includes('fail') || state.includes('down') || state.includes('error');
        const isWarning = !isSuccess && !isError;

        const color = isSuccess
          ? 'bg-[hsl(var(--chart-3))]'
          : isError
            ? 'bg-[hsl(var(--chart-5))]'
            : 'bg-[hsl(var(--chart-4))]';

        const glowColor = isSuccess
          ? 'shadow-[0_0_12px_hsl(var(--chart-3)/0.4)]'
          : isError
            ? 'shadow-[0_0_12px_hsl(var(--chart-5)/0.4)]'
            : 'shadow-[0_0_12px_hsl(var(--chart-4)/0.4)]';

        return (
          <AnimatedContainer key={`${row.label}-${row.detail ?? ''}`} delay={index * 50} animation="fade-slide" duration={400}>
            <div className="group/timeline grid grid-cols-[12px_1fr_auto] items-start gap-3 rounded-xl border border-border/40 bg-background/[0.02] p-3 transition-all duration-300 hover:border-border/60 hover:bg-background/[0.06] hover:shadow-sm">
              <span className={cn('mt-1.5 size-2.5 rounded-full transition-all duration-300', color, glowColor)} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{row.label}</p>
                {row.detail ? <p className="truncate text-xs text-muted-foreground">{row.detail}</p> : null}
              </div>
              <span className={cn(
                'rounded-md border px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] transition-colors duration-200',
                isSuccess && 'border-[hsl(var(--chart-3)/0.3)] bg-[hsl(var(--chart-3)/0.08)] text-[hsl(var(--chart-3))]',
                isError && 'border-[hsl(var(--chart-5)/0.3)] bg-[hsl(var(--chart-5)/0.08)] text-[hsl(var(--chart-5))]',
                isWarning && 'border-[hsl(var(--chart-4)/0.3)] bg-[hsl(var(--chart-4)/0.08)] text-[hsl(var(--chart-4))]'
              )}>
                {row.value}
              </span>
            </div>
          </AnimatedContainer>
        );
      })}
    </div>
  );
}
