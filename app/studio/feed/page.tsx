import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/studio/auth'
import { redirect } from 'next/navigation'
import { FeedView } from '@/components/studio/FeedView'
import { Loader2 } from 'lucide-react'
import { createStudioMetadata, studioNoIndexRobots } from '@/lib/studio/metadata'

export const metadata: Metadata = createStudioMetadata({
  title: 'Feed',
  description: 'Sketches from artists you follow',
  path: '/studio/feed',
  robots: studioNoIndexRobots,
})

export default async function FeedPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/studio')
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your Feed
        </h1>
        <p className="mt-1 text-muted-foreground">
          Latest sketches from artists you follow
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <FeedView />
      </Suspense>
    </div>
  )
}
