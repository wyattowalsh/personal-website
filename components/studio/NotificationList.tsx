'use client'

import * as React from 'react'
import Link from 'next/link'
import { Heart, GitFork, UserPlus, MessageSquare, AtSign, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from './UserAvatar'
import { Button } from '@/components/ui/button'
import type { Notification, NotificationType } from '@/lib/studio/types'

interface NotificationListProps {
  className?: string
}

const ICON_MAP: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  like: Heart,
  fork: GitFork,
  follow: UserPlus,
  comment: MessageSquare,
  mention: AtSign,
}

const ACTION_MAP: Record<NotificationType, string> = {
  like: 'liked your sketch',
  fork: 'forked your sketch',
  follow: 'started following you',
  comment: 'commented on your sketch',
  mention: 'mentioned you in a comment',
}

export function NotificationList({ className }: NotificationListProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [loading, setLoading] = React.useState(true)
  const [markingRead, setMarkingRead] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/studio/notifications?limit=50')
        if (res.ok && !cancelled) {
          const data = await res.json()
          setNotifications(data.notifications)
        }
      } catch {
        // swallow
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const markAllRead = async () => {
    setMarkingRead(true)
    try {
      const res = await fetch('/api/studio/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      }
    } catch {
      // swallow
    } finally {
      setMarkingRead(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            disabled={markingRead}
          >
            {markingRead ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            Mark all read
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No notifications yet
        </p>
      ) : (
        <div className="divide-y divide-border">
          {notifications.map(notification => {
            const Icon = ICON_MAP[notification.type]
            const action = ACTION_MAP[notification.type]

            const href = notification.type === 'follow'
              ? `/studio/profile/${notification.actorId}`
              : notification.sketchId
                ? `/studio/${notification.sketchId}`
                : '#'

            return (
              <Link
                key={notification.id}
                href={href}
                className={cn(
                  'flex items-start gap-3 px-2 py-3 transition-colors hover:bg-muted/50',
                  !notification.read && 'bg-muted/30'
                )}
              >
                <UserAvatar
                  name={notification.actorName}
                  image={notification.actorImage}
                  size="sm"
                />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm">
                    <span className="font-medium">{notification.actorName}</span>{' '}
                    {action}
                    {notification.sketchTitle && (
                      <> &ldquo;<span className="font-medium">{notification.sketchTitle}</span>&rdquo;</>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
                <Icon className={cn(
                  'mt-0.5 h-4 w-4 shrink-0',
                  notification.type === 'like' && 'text-red-500',
                  notification.type === 'follow' && 'text-blue-500',
                  notification.type === 'comment' && 'text-green-500',
                  notification.type === 'fork' && 'text-purple-500',
                  notification.type === 'mention' && 'text-amber-500',
                )} />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}
