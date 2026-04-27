'use client';

import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
  animated?: boolean;
}

export function Sparkline({ data, color = 'hsl(var(--chart-1))', height = 24, className, animated = true }: SparklineProps) {
  const chartData = useMemo(() => data.map((value, index) => ({ index, value })), [data]);

  if (data.length < 2) {
    return <div className="h-6 w-full rounded-lg bg-muted/30 shimmer-skeleton" />;
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`sparkline-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[minValue - range * 0.1, maxValue + range * 0.1]} type="number" />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#sparkline-${color.replace(/[^a-z0-9]/gi, '')})`}
            dot={false}
            isAnimationActive={animated}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
