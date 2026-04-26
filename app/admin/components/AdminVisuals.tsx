import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, CheckCircle2, CircleAlert, CircleDot, CircleMinus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AdminProviderSnapshot, AdminProviderStatus } from '../lib/free-admin-dashboard';

export function AdminSurface({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative min-h-full overflow-hidden rounded-none',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(to_right,hsl(var(--border)/0.32)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.28)_1px,transparent_1px)] before:bg-[size:28px_28px] before:opacity-25',
        'after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-48 after:bg-[radial-gradient(circle_at_20%_0%,hsl(var(--chart-1)/0.16),transparent_36%),radial-gradient(circle_at_80%_10%,hsl(var(--chart-5)/0.12),transparent_30%)]',
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

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
    <section className="relative overflow-hidden rounded-lg border border-border/80 bg-card/80 p-5 shadow-sm md:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--chart-1))] to-transparent" />
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border border-[hsl(var(--chart-1)/0.35)] bg-[hsl(var(--chart-1)/0.12)] font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[hsl(var(--chart-1))] hover:bg-[hsl(var(--chart-1)/0.16)]">
              {eyebrow}
            </Badge>
            {meta}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground text-pretty">{description}</p>
          </div>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </section>
  );
}

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
    <Card className={cn('overflow-hidden border-border/80 bg-card/80 shadow-sm', className)}>
      <CardHeader className="border-b border-border/70 bg-muted/20 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {Icon ? (
              <div className="rounded-md border border-[hsl(var(--chart-1)/0.25)] bg-[hsl(var(--chart-1)/0.1)] p-2 text-[hsl(var(--chart-1))]">
                <Icon className="size-4" />
              </div>
            ) : null}
            <div className="min-w-0 space-y-1">
              <CardTitle className="truncate text-sm font-semibold tracking-wide">{title}</CardTitle>
              {description ? <p className="text-xs leading-5 text-muted-foreground text-pretty">{description}</p> : null}
            </div>
          </div>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

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
    blue: 'bg-[hsl(var(--chart-1)/0.12)] text-[hsl(var(--chart-1))] border-[hsl(var(--chart-1)/0.22)]',
    violet: 'bg-[hsl(var(--chart-2)/0.12)] text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2)/0.22)]',
    emerald: 'bg-[hsl(var(--chart-3)/0.12)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.22)]',
    amber: 'bg-[hsl(var(--chart-4)/0.12)] text-[hsl(var(--chart-4))] border-[hsl(var(--chart-4)/0.22)]',
    rose: 'bg-[hsl(var(--chart-5)/0.12)] text-[hsl(var(--chart-5))] border-[hsl(var(--chart-5)/0.22)]',
  } as const;

  return (
    <div className="rounded-lg border border-border/80 bg-background/55 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
          <p className="text-xs leading-5 text-muted-foreground text-pretty">{description}</p>
        </div>
        <div className={cn('rounded-md border p-2', toneClasses[tone])}>
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: AdminProviderStatus }) {
  const config = {
    configured: { label: 'Live', icon: CheckCircle2, className: 'border-[hsl(var(--chart-3)/0.35)] bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))]' },
    partial: { label: 'Partial', icon: CircleMinus, className: 'border-[hsl(var(--chart-4)/0.35)] bg-[hsl(var(--chart-4)/0.1)] text-[hsl(var(--chart-4))]' },
    missing_config: { label: 'Setup', icon: CircleDot, className: 'border-border bg-muted/40 text-muted-foreground' },
    error: { label: 'Error', icon: CircleAlert, className: 'border-destructive/35 bg-destructive/10 text-destructive' },
  } satisfies Record<AdminProviderStatus, { label: string; icon: LucideIcon; className: string }>;
  const item = config[status];
  const Icon = item.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em]', item.className)}>
      <Icon className="size-3" />
      {item.label}
    </span>
  );
}

export function ProviderSignalStrip({ providers }: { providers: AdminProviderSnapshot[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {providers.map((provider) => (
        <div key={provider.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-background/55 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{provider.title}</p>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
              {provider.cards[0]?.label ?? 'Signal'}
            </p>
          </div>
          <StatusPill status={provider.status} />
        </div>
      ))}
    </div>
  );
}

export function SourceLink({ href }: { href: string }) {
  if (!href.startsWith('http')) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-border/80 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground no-underline transition-colors hover:border-[hsl(var(--chart-1)/0.45)] hover:text-[hsl(var(--chart-1))]"
    >
      Source
      <ArrowUpRight className="size-3" />
    </a>
  );
}
