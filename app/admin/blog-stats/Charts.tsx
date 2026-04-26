'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { CyberPanel } from '../components/AdminVisuals';

interface ChartsProps {
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

const countConfig = {
  count: { label: 'Count', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

const wordsConfig = {
  words: { label: 'Words', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

function EmptyChart() {
  return (
    <div className="flex h-60 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/15 text-sm text-muted-foreground">
      No chart data.
    </div>
  );
}

function VerticalBars({
  data,
  labelKey,
  valueKey,
}: {
  data: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
}) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <ChartContainer config={{ [valueKey]: { label: valueKey, color: 'hsl(var(--chart-1))' } }} className="h-64 w-full">
      <BarChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey={labelKey} tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey={valueKey} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={String(entry[labelKey])} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function HorizontalBars({
  data,
  labelKey,
  valueKey,
}: {
  data: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
}) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <ChartContainer config={countConfig} className="h-64 w-full">
      <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
        <XAxis type="number" hide />
        <YAxis dataKey={labelKey} type="category" tickLine={false} axisLine={false} width={104} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey={valueKey} radius={[0, 4, 4, 0]}>
          {data.slice(0, 10).map((entry, index) => (
            <Cell key={String(entry[labelKey])} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function TimelineArea({ data }: { data: Array<{ date: string; words: number; title: string }> }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <ChartContainer config={wordsConfig} className="h-64 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="wordTimelineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-words)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-words)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} />
        <YAxis hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area dataKey="words" type="monotone" fill="url(#wordTimelineGradient)" stroke="var(--color-words)" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  );
}

export function Charts({ postsByYear, tagData, wordData, readingTimeDist, wordTimeline }: ChartsProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <CyberPanel title="Posts per Year" description="Publishing cadence by year.">
          <VerticalBars data={postsByYear} labelKey="year" valueKey="count" />
        </CyberPanel>
        <CyberPanel title="Tag Frequency" description="Topic distribution across published posts.">
          <HorizontalBars data={tagData} labelKey="tag" valueKey="count" />
        </CyberPanel>
      </div>
      <CyberPanel title="Word Count by Post" description="Long-form weight by article.">
        <VerticalBars data={wordData} labelKey="name" valueKey="words" />
      </CyberPanel>
      <div className="grid gap-6 md:grid-cols-2">
        <CyberPanel title="Reading Time Distribution" description="Reader time commitment buckets.">
          <HorizontalBars data={readingTimeDist} labelKey="bucket" valueKey="count" />
        </CyberPanel>
        <CyberPanel title="Word Count Timeline" description="Chronological content mass.">
          <TimelineArea data={wordTimeline} />
        </CyberPanel>
      </div>
    </div>
  );
}
