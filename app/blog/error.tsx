'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold">Blog Error</h2>
      <p className="text-muted-foreground">
        {error.message || 'Failed to load blog content.'}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/blog">Back to blog</Link>
        </Button>
      </div>
    </div>
  )
}
