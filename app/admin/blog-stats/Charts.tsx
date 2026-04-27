'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { CyberPanel } from '../components/AdminVisuals';

interface EnhancedBlogChartsProps {
  postsByYear: Array<{ year: string; count: number }>;
  tagData: Array<{ tag: string; count: number }>;
  wordData: Array<{ name: string; words: number }>;
  readingTimeDist: Array<{ bucket: string; count: number }>;
  wordTimeline: Array<{ date: string; words: number; title: string }>;
}

const colors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function EmptyChart() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/15 text-sm text-muted-foreground">
      No chart data available
    </div>
  );
}

interface EnhancedVerticalBarsProps {
  data: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
  showStats?: boolean;
}

function EnhancedVerticalBars({ data, labelKey, valueKey, showStats = true }: EnhancedVerticalBarsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const stats = useMemo(() => {
    if (data.length === 0) return { total: 0, average: 0, max: 0 };
    const values = data.map(d => Number(d[valueKey]) || 0);
    return {
      total: values.reduce((sum, v) => sum + v, 0),
      average: Math.round(values.reduce((sum, v) => sum + v, 0) / values.length),
      max: Math.max(...values),
    };
  }, [data, valueKey]);

  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="space-y-4">
      {showStats && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</p>
            <p className="mt-1 text-xl font-bold text-foreground">{stats.total.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average</p>
            <p className="mt-1 text-xl font-bold text-foreground">{stats.average.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Peak</p>
            <p className="mt-1 text-xl font-bold text-foreground">{stats.max.toLocaleString()}</p>
          </div>
        </div>
      )}

      <ChartContainer config={{ [valueKey]: { label: valueKey, color: 'hsl(var(--chart-1))' } }} className="h-64 w-full">
        <BarChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
          <XAxis dataKey={labelKey} tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis hide />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey={valueKey}
            radius={[8, 8, 0, 0]}
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={String(entry[labelKey])}
                fill={colors[index % colors.length]}
                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

interface EnhancedHorizontalBarsProps {
  data: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
  maxItems?: number;
  showStats?: boolean;
}

function EnhancedHorizontalBars({
  data,
  labelKey,
  valueKey,
  maxItems = 10,
  showStats = true,
}: EnhancedHorizontalBarsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sliced = useMemo(() => data.slice(0, maxItems), [data, maxItems]);

  const stats = useMemo(() => {
    if (sliced.length === 0) return { total: 0, average: 0 };
    const values = sliced.map(d => Number(d[valueKey]) || 0);
    return {
      total: values.reduce((sum, v) => sum + v, 0),
      average: Math.round(values.reduce((sum, v) => sum + v, 0) / values.length),
    };
  }, [sliced, valueKey]);

  if (sliced.length === 0) return <EmptyChart />;

  return (
    <div className="space-y-4">
      {showStats && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</p>
            <p className="mt-1 text-xl font-bold text-foreground">{stats.total.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average</p>
            <p className="mt-1 text-xl font-bold text-foreground">{stats.average.toLocaleString()}</p>
          </div>
        </div>
      )}

      <ChartContainer config={{ [valueKey]: { label: valueKey, color: 'hsl(var(--chart-1))' } }} className="h-64 w-full">
        <BarChart data={sliced} layout="vertical" margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" horizontal={true} />
          <XAxis type="number" hide />
          <YAxis dataKey={labelKey} type="category" tickLine={false} axisLine={false} width={120} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Bar
            dataKey={valueKey}
            radius={[0, 8, 8, 0]}
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {sliced.map((entry, index) => (
              <Cell
                key={String(entry[labelKey])}
                fill={colors[index % colors.length]}
                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

interface EnhancedTimelineAreaProps {
  data: Array<{ date: string; words: number; title: string }>;
}

function EnhancedTimelineArea({ data }: EnhancedTimelineAreaProps) {
  const stats = useMemo(() => {
    if (data.length === 0) return { total: 0, average: 0, max: 0, min: 0 };
    const words = data.map(d => d.words);
    return {
      total: words.reduce((sum, w) => sum + w, 0),
      average: Math.round(words.reduce((sum, w) => sum + w, 0) / words.length),
      max: Math.max(...words),
      min: Math.min(...words),
    };
  }, [data]);

  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Words</p>
          <p className="mt-1 text-xl font-bold text-foreground">{stats.total.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average</p>
          <p className="mt-1 text-xl font-bold text-foreground">{stats.average.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Peak</p>
          <p className="mt-1 text-xl font-bold text-foreground">{stats.max.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Minimum</p>
          <p className="mt-1 text-xl font-bold text-foreground">{stats.min.toLocaleString()}</p>
        </div>
      </div>

      <ChartContainer config={{ words: { label: 'Words', color: 'hsl(var(--chart-2))' } }} className="h-72 w-full">
        <ComposedChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="wordTimelineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-words)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--color-words)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} />
          <YAxis hide />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as typeof data[0];
              return (
                <div className="rounded-lg border border-border/80 bg-background/95 p-3 shadow-lg backdrop-blur-sm">
                  <p className="text-xs font-semibold">{point.date}</p>
                  <p className="text-xs text-muted-foreground">{point.title}</p>
                  <p className="mt-1 text-sm font-bold" style={{ color: 'hsl(var(--chart-2))' }}>
                    {point.words.toLocaleString()} words
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="words"
            fill="url(#wordTimelineGradient)"
            stroke="var(--color-words)"
            strokeWidth={2}
            isAnimationActive={true}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}

export function EnhancedBlogCharts({
  postsByYear,
  tagData,
  wordData,
  readingTimeDist,
  wordTimeline,
}: EnhancedBlogChartsProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <CyberPanel title="Posts per Year" description="Publishing cadence and growth over time.">
          <EnhancedVerticalBars data={postsByYear} labelKey="year" valueKey="count" />
        </CyberPanel>
        <CyberPanel title="Tag Frequency" description="Topic distribution across published articles.">
          <EnhancedHorizontalBars data={tagData} labelKey="tag" valueKey="count" maxItems={8} />
        </CyberPanel>
      </div>

      <CyberPanel title="Word Count by Post" description="Content length for each article (top articles shown).">
        <EnhancedVerticalBars data={wordData} labelKey="name" valueKey="words" />
      </CyberPanel>

      <div className="grid gap-6 md:grid-cols-2">
        <CyberPanel title="Reading Time Distribution" description="Reader time commitment across all articles.">
          <EnhancedHorizontalBars data={readingTimeDist} labelKey="bucket" valueKey="count" maxItems={6} />
        </CyberPanel>
        <CyberPanel title="Word Count Timeline" description="Content volume growth chronologically with post titles.">
          <EnhancedTimelineArea data={wordTimeline} />
        </CyberPanel>
      </div>
    </div>
  );
}
