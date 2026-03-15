'use client'

import * as React from 'react'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FollowButtonProps {
  userId: string
  initialFollowing: boolean
  currentUserId?: string | null
  className?: string
}

export function FollowButton({ userId, initialFollowing, currentUserId, className }: FollowButtonProps) {
  const [following, setFollowing] = React.useState(initialFollowing)
  const [loading, setLoading] = React.useState(false)

  if (!currentUserId || currentUserId === userId) return null

  const handleToggle = async () => {
    if (loading) return

    const prev = following
    setFollowing(!prev)
    setLoading(true)

    try {
      const res = await fetch(`/api/studio/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: prev ? 'unfollow' : 'follow' }),
      })

      if (!res.ok) {
        setFollowing(prev)
      }
    } catch {
      setFollowing(prev)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={following ? 'outline' : 'default'}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={cn('gap-1.5', className)}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
      ) : following ? (
        <UserMinus className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {following ? 'Unfollow' : 'Follow'}
    </Button>
  )
}
