'use client';

import type { LucideIcon } from 'lucide-react';
import { Activity, BarChart3, Eye, MousePointerClick, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from './AnimatedContainer';
import { MetricCard } from './MetricCard';
import { CyberPanel, SourceLink, StatusPill } from './AdminVisuals';
import { StatPulse } from './StatPulse';
import { ChartInteraction } from './ChartInteraction';
import { DynamicScoreRadials, DynamicStatusTimeline } from './DynamicCharts';
import type { AnalyticsRow } from '../lib/visitor-analytics';
import type { AdminProviderSnapshot } from '../lib/free-admin-dashboard';

export function DataList({
  title,
  rows,
  emptyLabel,
  icon: Icon,
  animated = false,
}: {
  title: string;
  rows: AnalyticsRow[];
  emptyLabel: string;
  icon: LucideIcon;
  animated?: boolean;
}) {
  return (
    <AnimatedContainer animation="fade-slide" delay={animated ? 100 : 0}>
      <CyberPanel title={title} icon={Icon}>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={`${title}-${row.label}-${row.detail ?? ''}`}
                className="flex items-start justify-between gap-4 rounded-md border border-border/40 bg-muted/20 p-3 transition-colors hover:border-border/60 hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.label}</p>
                  {row.detail && <p className="text-xs text-muted-foreground text-pretty">{row.detail}</p>}
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </CyberPanel>
    </AnimatedContainer>
  );
}

function formatGeneratedAt(timestamp: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function ProviderCard({ provider, animated = false }: { provider: AdminProviderSnapshot; animated?: boolean }) {
  const isExternalSource = provider.sourceUrl.startsWith('http');

  return (
    <AnimatedContainer animation="fade-slide" delay={animated ? 150 : 0}>
      <Card className="overflow-hidden border-border/80 bg-card/80 transition-all hover:shadow-md hover:border-border">
        <CardHeader className="space-y-3 border-b border-border/70 bg-muted/20 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{provider.title}</CardTitle>
                {provider.status === 'configured' && (
                  <StatPulse value="●" label="Live" trend="up" />
                )}
              </div>
              <p className="text-xs text-muted-foreground text-pretty">{provider.freeTier}</p>
            </div>
            <StatusPill status={provider.status} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono uppercase tracking-[0.12em]">Updated {formatGeneratedAt(provider.lastCheckedAt)}</Badge>
            {isExternalSource && <SourceLink href={provider.sourceUrl} />}
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-4">
          {provider.error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {provider.error}
            </div>
          )}

          {provider.missingEnv.length > 0 && (
            <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex flex-wrap gap-2">
                {provider.missingEnv.map((name) => (
                  <Badge key={name} variant="outline" className="font-mono">
                    {name}
                  </Badge>
                ))}
              </div>
              {provider.setupSteps.length > 0 && (
                <div className="rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground">
                  {provider.setupSteps.map((step) => (
                    <p key={step}>{step}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {provider.id === 'pagespeed-crux' && provider.cards.length > 0 ? (
            <ChartInteraction title={`${provider.title} Metrics`}>
              <DynamicScoreRadials metrics={provider.cards} />
            </ChartInteraction>
          ) : provider.cards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {provider.cards.map((metric, index) => {
                const icons = [BarChart3, Eye, MousePointerClick, ShieldCheck] as const;
                const Icon = icons[index % icons.length];
                const variants = ['accent', 'success', 'warning', 'default'] as const;
                return (
                  <AnimatedContainer key={metric.label} delay={animated ? index * 100 : 0} animation="fade-slide">
                    <MetricCard
                      label={metric.label}
                      value={metric.value}
                      description={metric.description}
                      icon={Icon}
                      variant={variants[index % variants.length]}
                    />
                  </AnimatedContainer>
                );
              })}
            </div>
          ) : null}

          {provider.id === 'vercel' || provider.id === 'github' || provider.id === 'uptimerobot' ? (
            <CyberPanel title={`${provider.title} Timeline`} icon={Activity}>
              <DynamicStatusTimeline rows={provider.rows} />
            </CyberPanel>
          ) : (
            <DataList
              title={`${provider.title} Details`}
              rows={provider.rows}
              emptyLabel={provider.status === 'missing_config' ? 'Add the missing free-service env vars to activate this panel.' : 'No rows returned.'}
              icon={Activity}
            />
          )}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}
