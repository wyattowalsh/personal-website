'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AreaChart, Area, YAxis } from 'recharts';
import { useReducedMotion } from '@/components/hooks/useReducedMotion';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
  animated?: boolean;
}

export function Sparkline({ data, color = 'hsl(var(--chart-1))', height = 24, className, animated = true }: SparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const chartData = useMemo(() => data.map((value, index) => ({ index, value })), [data]);
  const shouldAnimate = animated && !prefersReducedMotion;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateDimensions = () => {
      const rect = element.getBoundingClientRect();
      setDimensions(rect.width > 0 && rect.height > 0 ? { width: rect.width, height: rect.height } : null);
    };

    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  if (data.length < 2) {
    return <div className="h-6 w-full rounded-lg bg-muted/30 shimmer-skeleton" />;
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  return (
    <div ref={containerRef} className={className} style={{ height }}>
      {dimensions && (
        <AreaChart width={dimensions.width} height={dimensions.height} data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
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
            isAnimationActive={shouldAnimate}
            animationDuration={shouldAnimate ? 1000 : 0}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      )}
    </div>
  );
}
