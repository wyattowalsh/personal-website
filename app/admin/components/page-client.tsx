'use client';

import type { LucideIcon } from 'lucide-react';
import { Activity, BarChart3, Eye, MousePointerClick, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from './AnimatedContainer';
import { MetricCard } from './MetricCard';
import { CyberPanel, SourceLink, StatusPill, EmptyState } from './AdminVisuals';
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
          <EmptyState label={emptyLabel} />
        ) : (
          <div className="space-y-2">
            {rows.map((row, index) => (
              <AnimatedContainer
                key={`${title}-${row.label}-${row.detail ?? ''}`}
                delay={index * 40}
                animation="fade-slide"
                duration={400}
              >
                <div className="group/row flex items-start justify-between gap-4 rounded-lg border border-border/30 bg-muted/[0.04] p-3 transition-all duration-300 hover:border-border/50 hover:bg-muted/[0.08] hover:shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium transition-colors duration-200 group-hover/row:text-foreground">
                      {row.label}
                    </p>
                    {row.detail && (
                      <p className="text-xs text-muted-foreground text-pretty transition-colors duration-200 group-hover/row:text-muted-foreground/80">
                        {row.detail}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-md bg-muted/30 px-2 py-0.5 text-sm font-semibold tabular-nums transition-all duration-200 group-hover/row:bg-muted/50">
                    {row.value}
                  </span>
                </div>
              </AnimatedContainer>
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
      <Card className="group/card relative overflow-hidden rounded-xl border-border/60 bg-card/70 shadow-sm backdrop-blur-sm transition-all duration-500 hover:shadow-md hover:shadow-foreground/[0.03] hover:border-border/80">
        {/* ambient hover glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[hsl(var(--chart-1)/0.03)] opacity-0 blur-3xl transition-opacity duration-700 group-hover/card:opacity-100" />

        <CardHeader className="relative z-10 space-y-3 border-b border-border/40 bg-muted/[0.04] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">{provider.title}</CardTitle>
                {provider.status === 'configured' && (
                  <StatPulse value="●" label="Live" trend="up" />
                )}
              </div>
              <p className="text-xs text-muted-foreground text-pretty leading-relaxed">{provider.freeTier}</p>
            </div>
            <StatusPill status={provider.status} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono uppercase tracking-[0.12em] border-border/40 transition-colors duration-200 group-hover/card:border-border/60">
              Updated {formatGeneratedAt(provider.lastCheckedAt)}
            </Badge>
            {isExternalSource && <SourceLink href={provider.sourceUrl} />}
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-5 p-5">
          {provider.error && (
            <div className="rounded-xl border border-destructive/25 bg-destructive/[0.04] px-4 py-3 text-sm text-destructive backdrop-blur-sm">
              {provider.error}
            </div>
          )}

          {provider.missingEnv.length > 0 && (
            <div className="space-y-3 rounded-xl border border-border/40 bg-muted/[0.04] p-4 backdrop-blur-sm">
              <div className="flex flex-wrap gap-2">
                {provider.missingEnv.map((name) => (
                  <Badge key={name} variant="outline" className="font-mono border-border/40">
                    {name}
                  </Badge>
                ))}
              </div>
              {provider.setupSteps.length > 0 && (
                <div className="rounded-lg border border-border/40 bg-background/60 p-3 font-mono text-xs text-foreground backdrop-blur-sm">
                  {provider.setupSteps.map((step) => (
                    <p key={step} className="font-mono text-xs">{step}</p>
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
