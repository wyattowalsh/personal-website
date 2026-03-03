'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { LikeButton } from '@/components/studio/LikeButton'

interface LikeButtonConnectedProps {
  sketchId: string
  initialCount: number
}

export function LikeButtonConnected({
  sketchId,
  initialCount,
}: LikeButtonConnectedProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = React.useState(false)
  const [count, setCount] = React.useState(initialCount)

  // Check initial like status
  React.useEffect(() => {
    if (!session?.user?.id) return
    fetch(`/api/studio/sketches/${sketchId}/like`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.liked !== undefined) setLiked(data.liked)
      })
      .catch(() => {})
  }, [session?.user?.id, sketchId])

  const handleToggle = async () => {
    if (!session?.user?.id) return

    // Optimistic update
    const prevLiked = liked
    const prevCount = count
    setLiked(!liked)
    setCount(liked ? count - 1 : count + 1)

    try {
      const res = await fetch(`/api/studio/sketches/${sketchId}/like`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setCount(data.count)
      } else {
        // Revert on error
        setLiked(prevLiked)
        setCount(prevCount)
      }
    } catch {
      // Revert on network error
      setLiked(prevLiked)
      setCount(prevCount)
    }
  }

  return (
    <LikeButton
      liked={liked}
      count={count}
      onToggle={handleToggle}
      disabled={!session?.user}
    />
  )
}
