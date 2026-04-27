export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-muted to-transparent" />
        <div className="space-y-3 max-w-3xl">
          <div className="h-5 w-32 rounded-lg bg-muted/50 shimmer-skeleton" />
          <div className="h-10 w-72 rounded-lg bg-muted/50 shimmer-skeleton" />
          <div className="h-4 w-full max-w-[500px] rounded-lg bg-muted/50 shimmer-skeleton" />
        </div>
      </div>

      {/* Signal strip */}
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-3 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-muted/50 shimmer-skeleton" />
              <div className="h-3 w-16 rounded bg-muted/50 shimmer-skeleton" />
            </div>
            <div className="h-6 w-14 rounded-md bg-muted/50 shimmer-skeleton" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4">
          <div className="h-4 w-32 rounded-lg bg-muted/50 shimmer-skeleton" />
          <div className="h-72 rounded-xl bg-muted/50 shimmer-skeleton" />
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4">
          <div className="h-4 w-28 rounded-lg bg-muted/50 shimmer-skeleton" />
          <div className="h-72 rounded-xl bg-muted/50 shimmer-skeleton" />
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-3">
        <div className="h-4 w-40 rounded-lg bg-muted/50 shimmer-skeleton" />
        <div className="grid gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-muted/50 shimmer-skeleton" />
          ))}
        </div>
      </div>
    </div>
  );
}
