'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { StudioPageContainer } from '@/components/studio/StudioShell'
import { Button } from '@/components/ui/button'

export default function StudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Studio error:', error)
    Sentry.captureException(error)
  }, [error])

  return (
    <StudioPageContainer
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <AlertTriangle className="h-12 w-12 text-destructive/60" />
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground">
        {error.message || 'Failed to load studio content.'}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/studio">Back to Studio</Link>
        </Button>
      </div>
    </StudioPageContainer>
  )
}
