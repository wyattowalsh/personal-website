import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/studio/auth'
import { redirect } from 'next/navigation'
import { getOwnedSketches } from '@/lib/studio/db'
import { MySketchesList } from '@/components/studio/MySketchesList'
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
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            My Sketches
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your creations
          </p>
        </div>
        <Button asChild>
          <Link href="/studio/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        </Button>
      </div>

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
    </div>
  )
}
