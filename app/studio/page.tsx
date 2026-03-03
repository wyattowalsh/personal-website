import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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

const authErrorMessages: Record<string, string> = {
  Configuration: 'Sign-in is temporarily unavailable due to a setup issue. Please try again later.',
}

function getAuthErrorMessage(error: string | undefined): string | null {
  if (typeof error === 'undefined') {
    return null
  }

  return authErrorMessages[error] ?? 'Sign-in failed. Please try again.'
}

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

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const [session, params] = await Promise.all([auth(), searchParams])
  const errorParam = Array.isArray(params.error) ? params.error[0] : params.error
  const authErrorMessage = getAuthErrorMessage(errorParam)

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

      {authErrorMessage ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Sign-in error</AlertTitle>
          <AlertDescription>{authErrorMessage}</AlertDescription>
        </Alert>
      ) : null}

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
