import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/studio/auth'
import { redirect } from 'next/navigation'
import { getOwnedSketches } from '@/lib/studio/db'
import { MySketchesList } from '@/components/studio/MySketchesList'
import { StudioPageContainer, StudioPageHeader } from '@/components/studio/StudioShell'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createStudioMetadata, studioNoIndexRobots } from '@/lib/studio/metadata'

export const metadata: Metadata = createStudioMetadata({
  title: 'My Sketches',
  description: 'Manage your sketches',
  path: '/studio/my-sketches',
  robots: studioNoIndexRobots,
})

async function SketchesContent({ userId }: { userId: string }) {
  const sketches = await getOwnedSketches(userId, 50, 0)
  return <MySketchesList initialSketches={sketches} />
}

export default async function MySketchesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/studio')

  return (
    <StudioPageContainer className="py-6">
      <StudioPageHeader
        heading="My Sketches"
        description="Manage your creations"
        actions={(
          <Button asChild>
            <Link href="/studio/new" className="gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </Link>
          </Button>
        )}
      />

      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        }
      >
        <SketchesContent userId={session.user.id} />
      </Suspense>
    </StudioPageContainer>
  )
}
