'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { ReportButton } from '@/components/studio/ReportButton'

interface ReportButtonConnectedProps {
  sketchId: string
}

export function ReportButtonConnected({ sketchId }: ReportButtonConnectedProps) {
  const { data: session } = useSession()

  const handleReport = async (reason: string) => {
    if (!session?.user?.id) return

    try {
      await fetch(`/api/studio/sketches/${sketchId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
    } catch {
      // Silently fail — the user has already submitted the report dialog
    }
  }

  if (!session?.user) return null

  return <ReportButton sketchId={sketchId} onReport={handleReport} />
}
