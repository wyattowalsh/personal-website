import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, CheckCircle2, CircleAlert, CircleDot, CircleMinus, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AdminProviderSnapshot, AdminProviderStatus } from '../lib/free-admin-dashboard';
import { AnimatedContainer } from './AnimatedContainer';

/* ------------------------------------------------------------------ */
/*  AdminSurface                                                       */
/* ------------------------------------------------------------------ */
export function AdminSurface({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative min-h-full overflow-hidden rounded-none',
        /* grid background */
        'before:pointer-events-none before:absolute before:inset-0',
        'before:bg-[linear-gradient(to_right,hsl(var(--border)/0.22)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.18)_1px,transparent_1px)]',
        'before:bg-[size:32px_32px] before:opacity-20',
        /* ambient glow orbs */
        'after:pointer-events-none after:absolute after:inset-0',
        'after:bg-[radial-gradient(circle_at_15%_0%,hsl(var(--chart-1)/0.10),transparent_40%),radial-gradient(circle_at_85%_10%,hsl(var(--chart-5)/0.08),transparent_35%),radial-gradient(circle_at_50%_100%,hsl(var(--chart-3)/0.06),transparent_50%)]',
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AdminHero                                                          */
/* ------------------------------------------------------------------ */
export function AdminHero({
  eyebrow,
  title,
  description,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-sm md:p-7">
      {/* top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--chart-1)/0.6)] to-transparent" />

      {/* subtle ambient glow behind title */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[hsl(var(--chart-1)/0.06)] blur-3xl" />

      <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border border-[hsl(var(--chart-1)/0.35)] bg-[hsl(var(--chart-1)/0.10)] font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[hsl(var(--chart-1))] hover:bg-[hsl(var(--chart-1)/0.14)] transition-colors">
              {eyebrow}
            </Badge>
            {meta}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground text-pretty">
              {description}
            </p>
          </div>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CyberPanel                                                         */
/* ------------------------------------------------------------------ */
export function CyberPanel({
  title,
  description,
  icon: Icon,
  className,
  headerAction,
  children,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        'group/card relative overflow-hidden rounded-xl border border-border/50 bg-card/70 shadow-sm backdrop-blur-sm transition-all duration-500',
        'hover:border-border/70 hover:shadow-md hover:shadow-foreground/[0.03]',
        className
      )}
    >
      {/* hover ambient glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[hsl(var(--chart-1)/0.04)] opacity-0 blur-2xl transition-opacity duration-700 group-hover/card:opacity-100" />

      <CardHeader className="relative z-10 border-b border-border/40 bg-muted/[0.08] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {Icon ? (
              <div className="rounded-lg border border-[hsl(var(--chart-1)/0.22)] bg-[hsl(var(--chart-1)/0.08)] p-2 text-[hsl(var(--chart-1))] shadow-sm transition-all duration-300 group-hover/card:shadow-[0_0_12px_hsl(var(--chart-1)/0.15)] group-hover/card:scale-105">
                <Icon className="size-4" />
              </div>
            ) : null}
            <div className="min-w-0 space-y-1">
              <CardTitle className="truncate text-sm font-semibold tracking-wide">{title}</CardTitle>
              {description ? (
                <p className="text-xs leading-5 text-muted-foreground text-pretty">{description}</p>
              ) : null}
            </div>
          </div>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent className="relative z-10 p-5">{children}</CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  SignalCard                                                         */
/* ------------------------------------------------------------------ */
export function SignalCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone?: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose';
}) {
  const toneClasses = {
    blue: 'bg-[hsl(var(--chart-1)/0.10)] text-[hsl(var(--chart-1))] border-[hsl(var(--chart-1)/0.20)] shadow-[hsl(var(--chart-1)/0.08)]',
    violet: 'bg-[hsl(var(--chart-2)/0.10)] text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2)/0.20)] shadow-[hsl(var(--chart-2)/0.08)]',
    emerald: 'bg-[hsl(var(--chart-3)/0.10)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.20)] shadow-[hsl(var(--chart-3)/0.08)]',
    amber: 'bg-[hsl(var(--chart-4)/0.10)] text-[hsl(var(--chart-4))] border-[hsl(var(--chart-4)/0.20)] shadow-[hsl(var(--chart-4)/0.08)]',
    rose: 'bg-[hsl(var(--chart-5)/0.10)] text-[hsl(var(--chart-5))] border-[hsl(var(--chart-5)/0.20)] shadow-[hsl(var(--chart-5)/0.08)]',
  } as const;

  return (
    <div className="group/signal relative overflow-hidden rounded-xl border border-border/50 bg-background/50 p-5 shadow-sm backdrop-blur-sm transition-all duration-500 hover:border-border/70 hover:shadow-md hover:shadow-foreground/[0.03]">
      {/* ambient glow on hover */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover/signal:opacity-100"
        style={{ backgroundColor: `hsl(var(--chart-${tone === 'blue' ? 1 : tone === 'violet' ? 2 : tone === 'emerald' ? 3 : tone === 'amber' ? 4 : 5})) / 0.12)` }}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
          <p className="text-xs leading-5 text-muted-foreground text-pretty">{description}</p>
        </div>
        <div className={cn('rounded-lg border p-2.5 shadow-sm transition-all duration-300 group-hover/signal:scale-110', toneClasses[tone])}>
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StatusPill                                                         */
/* ------------------------------------------------------------------ */
export function StatusPill({ status }: { status: AdminProviderStatus }) {
  const config = {
    configured: {
      label: 'Live',
      icon: CheckCircle2,
      className: 'border-[hsl(var(--chart-3)/0.40)] bg-[hsl(var(--chart-3)/0.12)] text-[hsl(var(--chart-3))]',
      pulse: true,
    },
    partial: {
      label: 'Partial',
      icon: CircleMinus,
      className: 'border-[hsl(var(--chart-4)/0.40)] bg-[hsl(var(--chart-4)/0.12)] text-[hsl(var(--chart-4))]',
      pulse: false,
    },
    missing_config: {
      label: 'Setup',
      icon: CircleDot,
      className: 'border-border/60 bg-muted/30 text-muted-foreground',
      pulse: false,
    },
    error: {
      label: 'Error',
      icon: CircleAlert,
      className: 'border-destructive/40 bg-destructive/12 text-destructive',
      pulse: false,
    },
  } satisfies Record<AdminProviderStatus, { label: string; icon: LucideIcon; className: string; pulse: boolean }>;

  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] transition-all duration-300',
        item.className
      )}
    >
      {item.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--chart-3))] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--chart-3))]" />
        </span>
      )}
      {!item.pulse && <Icon className="size-3" />}
      {item.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  ProviderSignalStrip                                                */
/* ------------------------------------------------------------------ */
export function ProviderSignalStrip({ providers }: { providers: AdminProviderSnapshot[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {providers.map((provider, index) => (
        <AnimatedContainer key={provider.id} delay={index * 60} animation="fade-slide">
          <div className="group/strip flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/50 px-3.5 py-2.5 backdrop-blur-sm transition-all duration-300 hover:border-border/70 hover:shadow-sm hover:shadow-foreground/[0.02]">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{provider.title}</p>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                {provider.cards[0]?.label ?? 'Signal'}
              </p>
            </div>
            <StatusPill status={provider.status} />
          </div>
        </AnimatedContainer>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SourceLink                                                         */
/* ------------------------------------------------------------------ */
export function SourceLink({ href }: { href: string }) {
  if (!href.startsWith('http')) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group/link inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground no-underline transition-all duration-300 hover:border-[hsl(var(--chart-1)/0.45)] hover:text-[hsl(var(--chart-1))] hover:shadow-sm"
    >
      Source
      <ArrowUpRight className="size-3 transition-transform duration-300 group-hover/link:translate-x-[1px] group-hover/link:-translate-y-[1px]" />
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  LiveIndicator                                                      */
/* ------------------------------------------------------------------ */
export function LiveIndicator({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex h-2.5 w-2.5', className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  EmptyState                                                         */
/* ------------------------------------------------------------------ */
export function EmptyState({
  label,
  icon: Icon = Zap,
  className,
}: {
  label: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/[0.04] px-6 py-10 text-center',
        className
      )}
    >
      <div className="rounded-full border border-border/40 bg-muted/20 p-3">
        <Icon className="size-5 text-muted-foreground/60" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
