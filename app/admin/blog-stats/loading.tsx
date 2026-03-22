export default function BlogStatsLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-4 w-32 rounded bg-muted animate-pulse mt-2" />
      </div>

      {/* Stat card skeletons */}
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

      {/* Two chart skeletons */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="h-4 w-32 rounded bg-muted animate-pulse mb-4" />
            <div className="h-64 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      {/* Full-width chart skeleton */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-4 w-40 rounded bg-muted animate-pulse mb-4" />
        <div className="h-64 rounded bg-muted animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 rounded bg-muted animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
