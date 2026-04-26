export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border border-border/80 bg-card/80 p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--chart-1))] to-transparent" />
        <div className="space-y-4">
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
          <div className="h-10 w-72 max-w-full rounded bg-muted animate-pulse" />
          <div className="h-4 w-[38rem] max-w-full rounded bg-muted animate-pulse" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border/80 bg-card/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-3">
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                <div className="h-8 w-16 rounded bg-muted animate-pulse" />
                <div className="h-3 w-32 rounded bg-muted animate-pulse" />
              </div>
              <div className="size-9 rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="rounded-lg border border-border/80 bg-card/80 p-4">
          <div className="mb-4 h-5 w-32 rounded bg-muted animate-pulse" />
          <div className="h-72 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="rounded-lg border border-border/80 bg-card/80 p-4">
          <div className="mb-4 h-5 w-28 rounded bg-muted animate-pulse" />
          <div className="h-72 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>

      <div className="rounded-lg border border-border/80 bg-card/80 p-4">
        <div className="mb-4 h-5 w-40 rounded bg-muted animate-pulse" />
        <div className="grid gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
