'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ChartInteractionProps {
  title: string;
  children: React.ReactNode;
  stats?: Array<{ label: string; value: string | number; color?: string }>;
  className?: string;
}

export function ChartInteraction({ title, children, stats, className }: ChartInteractionProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'relative space-y-4 rounded-lg border border-border/60 bg-card/50 p-5 transition-all duration-300',
        isHovered && 'border-border/80 bg-card/70 shadow-md shadow-foreground/10',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with title */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{title}</h3>
        {isHovered && stats && stats.length > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in duration-200">
            {stats.slice(0, 2).map((stat, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stat.color || 'currentColor' }} />
                <span className="text-xs text-muted-foreground">{stat.label}: {stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn('transition-opacity duration-300', isHovered && 'opacity-100', !isHovered && 'opacity-95')}>
        {children}
      </div>
    </div>
  );
}
