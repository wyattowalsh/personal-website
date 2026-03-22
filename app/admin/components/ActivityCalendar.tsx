'use client';

import { useMemo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, formatDate } from '@/lib/utils';

interface ActivityCalendarProps {
  posts: Array<{ created: string; title: string }>;
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function startOfDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function ActivityCalendar({ posts }: ActivityCalendarProps) {
  const { weeks, monthLabels, postMap } = useMemo(() => {
    // Build a map of date string -> post titles
    const map = new Map<string, string[]>();
    for (const post of posts) {
      const key = post.created.slice(0, 10);
      const existing = map.get(key) ?? [];
      existing.push(post.title);
      map.set(key, existing);
    }

    // Start from ~365 days ago, aligned to Sunday
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    // Align to Sunday (start of week)
    start.setDate(start.getDate() - start.getDay());

    const allWeeks: Date[][] = [];
    const labels: Array<{ label: string; col: number }> = [];
    let currentDate = new Date(start);
    let lastMonth = -1;

    while (currentDate <= today || allWeeks.length < 53) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(currentDate));
        // Track month boundaries for labels
        if (currentDate.getMonth() !== lastMonth && d === 0) {
          lastMonth = currentDate.getMonth();
          labels.push({ label: MONTH_NAMES[lastMonth], col: allWeeks.length });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      allWeeks.push(week);
      if (allWeeks.length >= 53) break;
    }

    return { weeks: allWeeks, monthLabels: labels, postMap: map };
  }, [posts]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="relative flex ml-8 mb-1 text-xs text-muted-foreground">
          {monthLabels.map(({ label, col }, i) => (
            <span
              key={`${label}-${i}`}
              className="absolute"
              style={{ marginLeft: `${col * 14}px` }}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="flex mt-5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-2 text-xs text-muted-foreground">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="h-3 flex items-center text-[10px] leading-none">
                {label}
              </div>
            ))}
          </div>
          {/* Grid */}
          <div className="flex gap-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => {
                  const key = startOfDay(day);
                  const titles = postMap.get(key);
                  const count = titles?.length ?? 0;
                  const isAfterToday = day > new Date();

                  return (
                    <Tooltip key={di}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'w-3 h-3 rounded-sm',
                            isAfterToday
                              ? 'bg-transparent'
                              : count === 0
                                ? 'bg-muted/20'
                                : 'bg-primary',
                            count === 1 && 'opacity-40',
                            count === 2 && 'opacity-70',
                            count >= 3 && 'opacity-100',
                          )}
                        />
                      </TooltipTrigger>
                      {!isAfterToday && (
                        <TooltipContent side="top" className="text-xs max-w-60">
                          <p className="font-medium">{formatDate(key)}</p>
                          {titles ? (
                            <ul className="mt-1">
                              {titles.map((t, i) => (
                                <li key={i} className="text-muted-foreground">{t}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground">No posts</p>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
