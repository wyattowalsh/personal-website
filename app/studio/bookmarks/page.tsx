import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/studio/auth'
import { redirect } from 'next/navigation'
import { getUserBookmarks } from '@/lib/studio/db'
import { SketchGallery } from '@/components/studio/SketchGallery'
import { Bookmark } from 'lucide-react'
import { createStudioMetadata, studioNoIndexRobots } from '@/lib/studio/metadata'

export const metadata: Metadata = createStudioMetadata({
  title: 'Bookmarks',
  description: 'Your bookmarked sketches',
  path: '/studio/bookmarks',
  robots: studioNoIndexRobots,
})

async function BookmarkContent({ userId }: { userId: string }) {
  const { sketches, total } = await getUserBookmarks(userId, 24, 0)

  if (sketches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bookmark className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h3 className="text-lg font-medium">No bookmarks yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Bookmark sketches to save them for later
        </p>
      </div>
    )
  }

  return <SketchGallery initialSketches={sketches} initialTotal={total} />
}

export default async function BookmarksPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/studio')

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Bookmarks
        </h1>
        <p className="mt-1 text-muted-foreground">
          Sketches you&apos;ve saved for later
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        }
      >
        <BookmarkContent userId={session.user.id} />
      </Suspense>
    </div>
  )
}
