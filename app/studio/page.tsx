import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SketchGallery } from '@/components/studio/SketchGallery'
import { SketchCardSkeleton } from '@/components/studio/SketchCardSkeleton'
import { AuthButton } from '@/components/studio/AuthButton'
import { NotificationBell } from '@/components/studio/NotificationBell'
import { getRecentSketches } from '@/lib/studio/db'
import { auth } from '@/lib/studio/auth'
import { createStudioMetadata } from '@/lib/studio/metadata'

export const metadata: Metadata = createStudioMetadata({
  path: '/studio',
})

async function GalleryContent() {
  const { sketches, total, nextCursor } = await getRecentSketches({
    sort: 'recent',
    limit: 24,
    offset: 0,
  })

  return (
    <SketchGallery
      initialSketches={sketches}
      initialTotal={total}
      initialNextCursor={nextCursor}
    />
  )
}

export default async function StudioPage() {
  const session = await auth()

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Studio
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            Create, share, and remix generative art
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell currentUserId={session?.user?.id} />
          <AuthButton />
          <Button asChild size="sm" className="gap-2 shadow-sm">
            <Link href="/studio/new">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create New</span>
              <span className="sm:hidden">New</span>
            </Link>
          </Button>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SketchCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <GalleryContent />
      </Suspense>
    </div>
  )
}
