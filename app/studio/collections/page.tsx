import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/studio/auth'
import { redirect } from 'next/navigation'
import { getUserCollections } from '@/lib/studio/db'
import { StudioPageContainer, StudioPageHeader } from '@/components/studio/StudioShell'
import { FolderOpen } from 'lucide-react'
import { createStudioMetadata, studioNoIndexRobots } from '@/lib/studio/metadata'

export const metadata: Metadata = createStudioMetadata({
  title: 'Collections',
  description: 'Your sketch collections',
  path: '/studio/collections',
  robots: studioNoIndexRobots,
})

async function CollectionsList({ userId }: { userId: string }) {
  const collections = await getUserCollections(userId)

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h3 className="text-lg font-medium">No collections yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create collections to organize your favorite sketches
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((col) => (
        <Link
          key={col.id}
          href={`/studio/collections/${col.id}`}
          className="group rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <h3 className="font-medium group-hover:text-foreground">{col.name}</h3>
          {col.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {col.description}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {col.sketchCount} {col.sketchCount === 1 ? 'sketch' : 'sketches'}
            {!col.isPublic && ' \u00b7 Private'}
          </p>
        </Link>
      ))}
    </div>
  )
}

export default async function CollectionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/studio')

  return (
    <StudioPageContainer className="py-6">
      <StudioPageHeader
        heading="Collections"
        description="Organize your favorite sketches"
      />
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        }
      >
        <CollectionsList userId={session.user.id} />
      </Suspense>
    </StudioPageContainer>
  )
}
