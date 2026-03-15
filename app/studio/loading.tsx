import { SketchCardSkeleton } from '@/components/studio/SketchCardSkeleton'
import { StudioPageContainer } from '@/components/studio/StudioShell'

export default function StudioLoading() {
  return (
    <StudioPageContainer
      className="py-8"
      role="status"
      aria-live="polite"
      aria-label="Loading studio content"
    >
      <div className="mb-8">
        <div className="h-9 w-32 rounded bg-muted" />
        <div className="mt-1 h-5 w-48 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SketchCardSkeleton key={i} />
        ))}
      </div>
    </StudioPageContainer>
  )
}
