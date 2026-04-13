'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface ChartsProps {
  postsByYear: Array<{ year: string; count: number }>;
  tagData: Array<{ tag: string; count: number }>;
  wordData: Array<{ name: string; words: number }>;
  readingTimeDist: Array<{ bucket: string; count: number }>;
  wordTimeline: Array<{ date: string; words: number; title: string }>;
}

const C = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
const hsl = (i: number) => `hsl(${C[i % C.length]})`;
const joinKeyParts = (...parts: Array<string | number>) => parts.map(String).join('::');
const getChartDatumKey = (d: Record<string, string | number>, labelKey: string) =>
  String(d[labelKey]);
const getTimelineDatumKey = ({ date, title }: { date: string; title: string; words: number }) =>
  joinKeyParts(date, title);

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-sm font-medium text-muted-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}

function BarChart({ data, labelKey, valueKey, horizontal }: {
  data: Array<Record<string, string | number>>;
  labelKey: string; valueKey: string; horizontal?: boolean;
}) {
  const max = Math.max(...data.map(d => Number(d[valueKey])), 1);
  const bar = (d: Record<string, string | number>, i: number) => {
    const pct = (Number(d[valueKey]) / max) * 100;
    const bg = hsl(i);
    return { pct, bg, val: Number(d[valueKey]).toLocaleString(), label: String(d[labelKey]) };
  };

  if (horizontal) {
    return (
      <div className="flex flex-col gap-2.5 h-64 justify-center">
        {data.map((d, i) => { const b = bar(d, i); const key = getChartDatumKey(d, labelKey); return (
          <div key={key} className="flex items-center gap-3 group" aria-label={`${b.label}: ${b.val}`}>
            <span className="w-24 shrink-0 text-xs text-muted-foreground text-right truncate" title={b.label}>{b.label}</span>
            <div className="flex-1 relative h-6">
              <div className="absolute inset-y-0 left-0 rounded-r-md transition-all duration-500"
                style={{ width: `${b.pct}%`, backgroundColor: b.bg, minWidth: b.pct > 0 ? '4px' : '0' }} />
            </div>
            <span className="text-xs font-semibold text-foreground w-8 text-right opacity-60 group-hover:opacity-100 transition-opacity">{b.val}</span>
          </div>
        ); })}
      </div>
    );
  }

  return (
    <div className="h-64 flex flex-col">
      <div className="flex-1 flex items-end gap-1.5 px-1">
        {data.map((d, i) => { const b = bar(d, i); const key = getChartDatumKey(d, labelKey); return (
          <div key={key} className="flex-1 flex flex-col items-center gap-1 group" aria-label={`${b.label}: ${b.val}`}>
            <span className="text-xs font-semibold text-foreground opacity-60 group-hover:opacity-100 transition-opacity">{b.val}</span>
            <div className="w-full rounded-t-md transition-all duration-500"
              style={{ height: `${b.pct}%`, backgroundColor: b.bg, minHeight: b.pct > 0 ? '4px' : '0' }} />
          </div>
        ); })}
      </div>
      <div className="flex gap-1.5 px-1 mt-2 border-t border-border pt-2">
        {data.map(d => (
          <span key={getChartDatumKey(d, labelKey)} className="flex-1 text-[10px] text-muted-foreground text-center truncate">{String(d[labelKey])}</span>
        ))}
      </div>
    </div>
  );
}

function AreaChart({ data }: { data: Array<{ date: string; words: number; title: string }> }) {
  const gradId = useId();
  if (data.length === 0) return null;
  const max = Math.max(...data.map(d => d.words), 1);
  const [W, H, pad] = [400, 200, 8];
  const pts = data.map((d, i) => ({
    x: pad + (i / Math.max(data.length - 1, 1)) * (W - 2 * pad),
    y: pad + (1 - d.words / max) * (H - 2 * pad),
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts.at(-1)!.x},${H} L${pts[0].x},${H} Z`;
  const color = hsl(4);

  return (
    <div className="h-64 flex flex-col">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full flex-1" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {pts.map((p, i) => (
          <circle key={getTimelineDatumKey(data[i])} cx={p.x} cy={p.y} r="3" fill={color} vectorEffect="non-scaling-stroke">
            <title>{`${data[i].title}\n${data[i].date} — ${data[i].words.toLocaleString()} words`}</title>
          </circle>
        ))}
      </svg>
      <div className={cn('flex justify-between mt-2 border-t border-border pt-2')}>
        {(data.length <= 8 ? data : [data[0], data.at(-1)!]).map(d => (
          <span key={getTimelineDatumKey(d)} className="text-[10px] text-muted-foreground truncate">{d.date}</span>
        ))}
      </div>
    </div>
  );
}

export function Charts({ postsByYear, tagData, wordData, readingTimeDist, wordTimeline }: ChartsProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Posts per Year">
          <BarChart data={postsByYear} labelKey="year" valueKey="count" />
        </ChartCard>
        <ChartCard title="Tag Frequency">
          <BarChart data={tagData} labelKey="tag" valueKey="count" horizontal />
        </ChartCard>
      </div>
      <ChartCard title="Word Count by Post">
        <BarChart data={wordData} labelKey="name" valueKey="words" />
      </ChartCard>
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Reading Time Distribution">
          <BarChart data={readingTimeDist} labelKey="bucket" valueKey="count" horizontal />
        </ChartCard>
        <ChartCard title="Word Count Timeline">
          <AreaChart data={wordTimeline} />
        </ChartCard>
      </div>
    </div>
  );
}
