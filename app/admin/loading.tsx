export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <div className="h-6 w-32 rounded bg-muted animate-pulse" />
        <div className="h-9 w-56 rounded bg-muted animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded bg-muted animate-pulse" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="h-6 w-40 rounded bg-muted animate-pulse" />
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border p-4 space-y-2">
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                <div className="h-7 w-20 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <div className="h-6 w-32 rounded bg-muted animate-pulse" />
          <div className="h-20 rounded-lg bg-muted animate-pulse" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="h-20 rounded-lg bg-muted animate-pulse" />
            <div className="h-20 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-6 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-8 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="h-64 rounded bg-muted animate-pulse" />
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="h-72 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="h-72 rounded bg-muted animate-pulse" />
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="h-64 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="h-64 rounded bg-muted animate-pulse" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="h-64 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
