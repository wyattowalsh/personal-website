import { SketchCardSkeleton } from '@/components/studio/SketchCardSkeleton'

export default function StudioLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <div className="h-9 w-32 rounded bg-muted" />
        <div className="mt-1 h-5 w-48 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SketchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
