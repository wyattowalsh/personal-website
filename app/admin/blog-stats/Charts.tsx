'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

interface ChartsProps {
  postsByYear: Array<{ year: string; count: number }>;
  tagData: Array<{ tag: string; count: number }>;
  wordData: Array<{ name: string; words: number }>;
  readingTimeDist: Array<{ bucket: string; count: number }>;
  wordTimeline: Array<{ date: string; words: number; title: string }>;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs text-muted-foreground">
          {entry.name ?? entry.dataKey}:{' '}
          <span className="font-semibold text-foreground">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function WordTimelineTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { title: string; date: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg max-w-[200px]">
      <p className="mb-1 text-xs font-medium text-foreground truncate">{item.payload.title}</p>
      <p className="text-xs text-muted-foreground">
        {item.payload.date}
      </p>
      <p className="text-xs text-muted-foreground">
        Words: <span className="font-semibold text-foreground">{item.value.toLocaleString()}</span>
      </p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-sm font-medium text-muted-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}

export function Charts({ postsByYear, tagData, wordData, readingTimeDist, wordTimeline }: ChartsProps) {
  return (
    <div className="grid gap-6">
      {/* Row 1: Posts per Year + Tag Frequency */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Posts per Year">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={postsByYear}>
                <defs>
                  <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="year" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis allowDecimals={false} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="url(#yearGradient)" animationDuration={800}>
                  {postsByYear.map((_, index) => (
                    <Cell key={`year-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Tag Frequency">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagData} layout="vertical">
                <defs>
                  <linearGradient id="tagGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" allowDecimals={false} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  type="category"
                  dataKey="tag"
                  className="text-xs"
                  width={100}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} animationDuration={800}>
                  {tagData.map((_, index) => (
                    <Cell key={`tag-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: Word Count by Post */}
      <ChartCard title="Word Count by Post">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wordData}>
              <defs>
                <linearGradient id="wordGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="words" radius={[4, 4, 0, 0]} animationDuration={800}>
                {wordData.map((_, index) => (
                  <Cell key={`word-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Row 3: Reading Time Distribution + Word Count Timeline */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Reading Time Distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readingTimeDist} layout="vertical">
                <defs>
                  <linearGradient id="readingGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" allowDecimals={false} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  type="category"
                  dataKey="bucket"
                  className="text-xs"
                  width={80}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="url(#readingGradient)" animationDuration={800}>
                  {readingTimeDist.map((_, index) => (
                    <Cell key={`rt-${index}`} fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Word Count Timeline">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wordTimeline}>
                <defs>
                  <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<WordTimelineTooltip />} />
                <Area
                  type="monotone"
                  dataKey="words"
                  stroke="hsl(var(--chart-5))"
                  strokeWidth={2}
                  fill="url(#timelineGradient)"
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
