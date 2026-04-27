'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Funnel,
  Lightbulb,
  Search,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CyberPanel, SignalCard } from './AdminVisuals';
import { AnimatedContainer } from './AnimatedContainer';
import type { AnomalyResult } from '../lib/anomaly-detection';
import type { ContentScore } from '../lib/content-scoring';
import type { FunnelStage } from '../lib/funnel-queries';
import type { CohortMatrix } from '../lib/cohort-analysis';
import type { SEOOpportunity } from '../lib/seo-opportunities';

interface ContentScoreItem {
  slug: string;
  title: string;
  score: ContentScore;
}

interface AnalyticsIntelligenceProps {
  trafficSeries: number[];
  anomalies: AnomalyResult[];
  contentScores: ContentScoreItem[];
  funnel: FunnelStage[];
  cohorts: CohortMatrix;
  seoOpportunities: SEOOpportunity[];
}

function SeverityBadge({ severity }: { severity: SEOOpportunity['severity'] }) {
  const config = {
    high: { className: 'bg-destructive/15 text-destructive border-destructive/30', label: 'High' },
    medium: { className: 'bg-amber-500/15 text-amber-600 border-amber-500/30', label: 'Medium' },
    low: { className: 'bg-blue-500/15 text-blue-600 border-blue-500/30', label: 'Low' },
  };
  const item = config[severity];
  return (
    <Badge variant="outline" className={item.className}>
      {item.label}
    </Badge>
  );
}

function ScoreRing({ score, label, size = 48 }: { score: number; label: string; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-destructive';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-muted/30" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[0.7rem] font-bold tabular-nums">{score}</span>
      </div>
      <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

export function AnalyticsIntelligence({
  trafficSeries,
  anomalies,
  contentScores,
  funnel,
  cohorts,
  seoOpportunities,
}: AnalyticsIntelligenceProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const anomalyCount = anomalies.filter((a) => a.isAnomaly).length;
  const avgContentScore = contentScores.length > 0
    ? Math.round(contentScores.reduce((sum, item) => sum + item.score.overall, 0) / contentScores.length)
    : 0;
  const highSeveritySEO = seoOpportunities.filter((o) => o.severity === 'high').length;

  const funnelConversion = funnel.length >= 3 && funnel[0].count > 0
    ? Number(((funnel[funnel.length - 1].count / funnel[0].count) * 100).toFixed(1))
    : 0;

  return (
    <div className="space-y-6">
      <AnimatedContainer animation="fade-slide" delay={0}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SignalCard
            label="Anomalies Detected"
            value={anomalyCount}
            description={anomalyCount > 0 ? 'Statistical outliers in traffic data' : 'Traffic patterns are within normal range'}
            icon={anomalyCount > 0 ? AlertTriangle : CheckCircle2}
            tone={anomalyCount > 0 ? 'rose' : 'emerald'}
          />
          <SignalCard
            label="Avg Content Score"
            value={`${avgContentScore}/100`}
            description="Mean quality score across all posts"
            icon={FileText}
            tone={avgContentScore >= 70 ? 'emerald' : avgContentScore >= 50 ? 'amber' : 'rose'}
          />
          <SignalCard
            label="Funnel Conversion"
            value={`${funnelConversion}%`}
            description="Visitor to CTA conversion rate"
            icon={Funnel}
            tone={funnelConversion >= 5 ? 'emerald' : funnelConversion >= 2 ? 'amber' : 'blue'}
          />
          <SignalCard
            label="SEO Issues"
            value={seoOpportunities.length}
            description={highSeveritySEO > 0 ? `${highSeveritySEO} high-priority fixes` : 'No critical SEO issues'}
            icon={highSeveritySEO > 0 ? AlertTriangle : Search}
            tone={highSeveritySEO > 0 ? 'amber' : 'emerald'}
          />
        </div>
      </AnimatedContainer>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            <AnimatedContainer animation="fade-slide" delay={100}>
              <CyberPanel title="Traffic Anomalies" description="Z-score analysis of daily traffic values." icon={TrendingUp}>
                {trafficSeries.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                    No traffic data available for anomaly detection.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {anomalies.slice(0, 10).map((anomaly) => (
                      <div
                        key={anomaly.index}
                        className="flex items-center justify-between gap-4 rounded-md border border-border/40 bg-muted/20 p-3"
                      >
                        <div className="flex items-center gap-3">
                          {anomaly.isAnomaly ? (
                            <XCircle className="size-4 shrink-0 text-destructive" />
                          ) : (
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              Day {anomaly.index + 1}: {anomaly.value.toLocaleString()} visits
                            </p>
                            <p className="text-xs text-muted-foreground">Z-score: {anomaly.zScore}</p>
                          </div>
                        </div>
                        {anomaly.isAnomaly && (
                          <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                            Outlier
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CyberPanel>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-slide" delay={150}>
              <CyberPanel title="Top Content Scores" description="Highest quality posts by composite score." icon={FileText}>
                {contentScores.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                    No posts available for scoring.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contentScores
                      .sort((a, b) => b.score.overall - a.score.overall)
                      .slice(0, 5)
                      .map((item) => (
                        <div key={item.slug} className="flex items-center justify-between gap-4 rounded-md border border-border/40 bg-muted/20 p-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{item.title}</p>
                            <div className="mt-1 flex items-center gap-3">
                              <ScoreRing score={item.score.breakdown.readability} label="Read" size={36} />
                              <ScoreRing score={item.score.breakdown.completeness} label="Comp" size={36} />
                              <ScoreRing score={item.score.breakdown.freshness} label="Fresh" size={36} />
                              <ScoreRing score={item.score.breakdown.engagement} label="Eng" size={36} />
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-lg font-bold tabular-nums">{item.score.overall}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CyberPanel>
            </AnimatedContainer>
          </div>

          <AnimatedContainer animation="fade-slide" delay={200}>
            <CyberPanel title="SEO Opportunities" description="Prioritized improvements for search visibility." icon={Search}>
              {seoOpportunities.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                  No SEO opportunities found. Great job!
                </div>
              ) : (
                <div className="space-y-3">
                  {seoOpportunities.slice(0, 6).map((opp) => (
                    <div key={`${opp.slug}-${opp.type}`} className="flex items-start justify-between gap-4 rounded-md border border-border/40 bg-muted/20 p-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{opp.title}</p>
                          <SeverityBadge severity={opp.severity} />
                        </div>
                        <p className="text-xs text-muted-foreground text-pretty">{opp.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground text-pretty">{opp.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CyberPanel>
          </AnimatedContainer>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <AnimatedContainer animation="fade-slide" delay={100}>
            <CyberPanel title="Anomaly Detection" description="Z-score statistical method with configurable sensitivity." icon={TrendingUp}>
              {trafficSeries.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                  No traffic series data available.
                </div>
              ) : (
                <div className="space-y-3">
                  {anomalies.map((anomaly) => (
                    <div
                      key={anomaly.index}
                      className="flex items-center justify-between gap-4 rounded-md border border-border/40 bg-muted/20 p-3"
                    >
                      <div className="flex items-center gap-3">
                        {anomaly.isAnomaly ? (
                          <AlertTriangle className="size-4 shrink-0 text-destructive" />
                        ) : (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            Day {anomaly.index + 1}: {anomaly.value.toLocaleString()} visits
                          </p>
                          <p className="text-xs text-muted-foreground">Z-score: {anomaly.zScore}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={anomaly.isAnomaly ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'}>
                        {anomaly.isAnomaly ? 'Anomaly' : 'Normal'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CyberPanel>
          </AnimatedContainer>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <AnimatedContainer animation="fade-slide" delay={100}>
            <CyberPanel title="Content Quality Scores" description="Breakdown by readability, completeness, freshness, and engagement." icon={FileText}>
              {contentScores.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                  No posts available for content scoring.
                </div>
              ) : (
                <div className="space-y-3">
                  {contentScores
                    .sort((a, b) => b.score.overall - a.score.overall)
                    .map((item) => (
                      <div key={item.slug} className="rounded-md border border-border/40 bg-muted/20 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-medium">{item.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold tabular-nums">{item.score.overall}</span>
                            <span className="text-xs text-muted-foreground">/100</span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4">
                          <ScoreRing score={item.score.breakdown.readability} label="Readability" />
                          <ScoreRing score={item.score.breakdown.completeness} label="Completeness" />
                          <ScoreRing score={item.score.breakdown.freshness} label="Freshness" />
                          <ScoreRing score={item.score.breakdown.engagement} label="Engagement" />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CyberPanel>
          </AnimatedContainer>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <AnimatedContainer animation="fade-slide" delay={100}>
            <CyberPanel title="Visitor Funnel" description="Visitors → Engaged (>50% scroll) → Converted (CTA click)." icon={Funnel}>
              <div className="space-y-4">
                {funnel.map((stage, index) => (
                  <div key={stage.name}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full border border-border/60 bg-muted/30 text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{stage.name}</p>
                          {stage.previousCount !== undefined && (
                            <p className="text-xs text-muted-foreground">
                              {stage.conversionRate}% of previous stage
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold tabular-nums">{stage.count.toLocaleString()}</p>
                        {stage.dropOffRate > 0 && (
                          <p className="text-xs text-destructive">-{stage.dropOffRate}% drop-off</p>
                        )}
                      </div>
                    </div>
                    {index < funnel.length - 1 && (
                      <div className="ml-4 mt-2 flex items-center gap-2">
                        <ChevronRight className="size-4 text-muted-foreground" />
                        <div className="h-px flex-1 bg-border/60" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CyberPanel>
          </AnimatedContainer>

          <AnimatedContainer animation="fade-slide" delay={150}>
            <CyberPanel title="Cohort Retention" description="Weekly cohorts showing day-0 to day-30 retention." icon={Users}>
              {cohorts.cohorts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                  No cohort data available. Configure PostHog or Turso rollups to enable cohort analysis.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Cohort</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Users</th>
                        {cohorts.days.map((day) => (
                          <th key={day} className="px-3 py-2 text-right font-medium text-muted-foreground">Day {day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cohorts.cohorts.map((cohort) => (
                        <tr key={cohort.cohortLabel} className="border-b border-border/40">
                          <td className="px-3 py-2 font-medium">{cohort.cohortLabel}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{cohort.totalUsers.toLocaleString()}</td>
                          {cohort.retention.map((rate, idx) => (
                            <td key={idx} className="px-3 py-2 text-right tabular-nums">
                              <span className={rate >= 50 ? 'text-emerald-600' : rate >= 25 ? 'text-amber-600' : 'text-muted-foreground'}>
                                {rate}%
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CyberPanel>
          </AnimatedContainer>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <AnimatedContainer animation="fade-slide" delay={100}>
            <CyberPanel title="SEO Opportunities" description="Identified issues ordered by severity." icon={Search}>
              {seoOpportunities.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                  No SEO opportunities found. All posts look well-optimized!
                </div>
              ) : (
                <div className="space-y-3">
                  {seoOpportunities.map((opp) => (
                    <div key={`${opp.slug}-${opp.type}`} className="rounded-md border border-border/40 bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium">{opp.title}</p>
                            <SeverityBadge severity={opp.severity} />
                          </div>
                          <p className="mt-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">{opp.type.replace(/_/g, ' ')}</p>
                          <p className="mt-1 text-sm text-muted-foreground text-pretty">{opp.message}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Lightbulb className="size-3 text-amber-500" />
                            <p className="text-xs text-muted-foreground text-pretty">{opp.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CyberPanel>
          </AnimatedContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}
