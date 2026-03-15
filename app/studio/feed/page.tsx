import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/studio/auth'
import { redirect } from 'next/navigation'
import { FeedView } from '@/components/studio/FeedView'
import { StudioPageContainer, StudioPageHeader } from '@/components/studio/StudioShell'
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
    <StudioPageContainer className="py-6">
      <StudioPageHeader
        heading="Your Feed"
        description="Latest sketches from artists you follow"
      />

      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <FeedView />
      </Suspense>
    </StudioPageContainer>
  )
}
