import { Skeleton } from './components/Skeleton';

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-muted to-transparent" />
        <div className="space-y-3 max-w-3xl">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-10 w-72 rounded-lg" />
          <Skeleton className="h-4 w-full max-w-[500px] rounded-lg" />
        </div>
      </div>

      {/* Signal strip */}
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-3 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <Skeleton className="h-6 w-14 rounded-md" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4">
          <Skeleton className="h-4 w-28 rounded-lg" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-3">
        <Skeleton className="h-4 w-40 rounded-lg" />
        <div className="grid gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
