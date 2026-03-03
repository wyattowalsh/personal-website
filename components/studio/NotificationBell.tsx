'use client'

import * as React from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NotificationBellProps {
  currentUserId?: string | null
  className?: string
}

export function NotificationBell({ currentUserId, className }: NotificationBellProps) {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!currentUserId) return

    let cancelled = false

    async function poll() {
      try {
        const res = await fetch('/api/studio/notifications?unreadOnly=true&countOnly=true')
        if (res.ok && !cancelled) {
          const data = await res.json()
          setCount(data.total ?? 0)
        }
      } catch {
        // Swallow -- notification polling should never break UI
      }
    }

    poll()
    let interval = setInterval(poll, 30000)

    function handleVisibilityChange() {
      if (document.hidden) {
        clearInterval(interval)
      } else {
        poll()
        interval = setInterval(poll, 30000)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentUserId])

  if (!currentUserId) return null

  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn('relative', className)}
    >
      <Link
        href="/studio/notifications"
        aria-label={count > 0 ? `Notifications (${count} unread)` : 'Notifications'}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Link>
    </Button>
  )
}
