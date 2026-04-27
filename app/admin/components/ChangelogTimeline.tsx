'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitCommit, Rocket, Wrench, Zap } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'feature' | 'fix' | 'improvement';
    description: string;
  }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: '2026-04-27',
    changes: [
      { type: 'feature', description: 'Growth Intelligence panel with related-posts engine and archive manager' },
      { type: 'feature', description: 'Onboarding walkthrough for first-time admin visitors' },
      { type: 'feature', description: 'Changelog timeline in admin dashboard' },
      { type: 'feature', description: 'Archive suggestions: update, merge, or redirect stale posts' },
      { type: 'feature', description: 'Related posts panel with Jaccard similarity scoring' },
      { type: 'improvement', description: 'Enhanced DataGrid with search, sort, and column alignment' },
      { type: 'improvement', description: 'Expanded admin documentation and troubleshooting guides' },
      { type: 'fix', description: 'Resolved hydration mismatch in telemetry auto-refresh' },
    ],
  },
  {
    version: '1.5.0',
    date: '2026-04-15',
    changes: [
      { type: 'feature', description: 'PostHog visitor analytics integration with rollup caching' },
      { type: 'feature', description: 'Turso SQLite analytics rollup storage' },
      { type: 'improvement', description: 'Provider health signal strip with real-time status' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-03-20',
    changes: [
      { type: 'feature', description: 'Initial admin dashboard with authentication' },
      { type: 'feature', description: 'Content health and blog stats panels' },
      { type: 'feature', description: 'Series and tag management views' },
    ],
  },
];

const typeConfig = {
  feature: { label: 'Feature', icon: Rocket, color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25' },
  fix: { label: 'Fix', icon: Wrench, color: 'bg-rose-500/15 text-rose-600 border-rose-500/25' },
  improvement: { label: 'Improvement', icon: Zap, color: 'bg-amber-500/15 text-amber-600 border-amber-500/25' },
};

export function ChangelogTimeline() {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-[hsl(var(--chart-1)/0.25)] bg-[hsl(var(--chart-1)/0.1)] p-2 text-[hsl(var(--chart-1))]">
            <GitCommit className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-wide">Changelog</CardTitle>
            <p className="text-xs text-muted-foreground">Admin dashboard release history</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="relative p-5">
            {/* Vertical line */}
            <div className="absolute left-8 top-5 bottom-5 w-px bg-border/60" />

            <div className="space-y-6">
              {CHANGELOG.map((entry) => (
                <div key={entry.version} className="relative pl-14">
                  {/* Dot */}
                  <div className="absolute left-[1.85rem] top-1.5 size-2.5 rounded-full border-2 border-background bg-[hsl(var(--chart-1))]" />

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="font-mono text-[0.65rem] uppercase tracking-[0.14em]"
                      >
                        v{entry.version}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                    </div>

                    <ul className="space-y-1.5">
                      {entry.changes.map((change, idx) => {
                        const config = typeConfig[change.type];
                        const Icon = config.icon;
                        return (
                          <li
                            key={idx}
                            className="flex items-start gap-2 rounded-md border border-border/40 bg-muted/20 p-2.5 transition-colors hover:bg-muted/30"
                          >
                            <Badge
                              variant="outline"
                              className={cn(
                                'shrink-0 gap-1 px-1.5 py-0 text-[0.6rem] uppercase tracking-wider',
                                config.color
                              )}
                            >
                              <Icon className="size-3" />
                              {config.label}
                            </Badge>
                            <span className="text-xs leading-4 text-foreground text-pretty">
                              {change.description}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
