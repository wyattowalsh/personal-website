'use client'

import * as React from 'react'
import { Loader2, MessageSquare, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserAvatar } from './UserAvatar'
import type { Comment } from '@/lib/studio/types'

interface CommentSectionProps {
  sketchId: string
  currentUserId?: string | null
  className?: string
}

export function CommentSection({ sketchId, currentUserId, className }: CommentSectionProps) {
  const [comments, setComments] = React.useState<Comment[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [body, setBody] = React.useState('')
  const [replyTo, setReplyTo] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const commentBodyId = React.useId()

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/studio/sketches/${sketchId}/comments`)
        if (!res.ok) throw new Error('Failed to load comments')
        const data = await res.json()
        if (!cancelled) {
          setComments(data.comments)
          setTotal(data.total)
        }
      } catch {
        if (!cancelled) setError('Failed to load comments')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [sketchId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || !currentUserId || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/studio/sketches/${sketchId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim(), parentId: replyTo ?? undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error?.message ?? 'Failed to post comment')
      }

      const newComment: Comment = await res.json()

      if (replyTo) {
        setComments(prev => prev.map(c => {
          if (c.id === replyTo) {
            return { ...c, replies: [...(c.replies ?? []), newComment] }
          }
          return c
        }))
      } else {
        setComments(prev => [...prev, newComment])
      }
      setTotal(prev => prev + 1)
      setBody('')
      setReplyTo(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="h-5 w-5" />
        Comments
        {total > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({total})</span>
        )}
      </h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={(id) => setReplyTo(id)}
              activeReply={replyTo}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          {replyTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Replying to comment</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-1 py-0 text-xs"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <label htmlFor={commentBodyId} className="sr-only">
              {replyTo ? 'Write a reply' : 'Write a comment'}
            </label>
            <textarea
              id={commentBodyId}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              maxLength={5000}
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!body.trim() || submitting}
              className="self-end"
              aria-label={replyTo ? 'Post reply' : 'Post comment'}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Sign in to leave a comment
        </p>
      )}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  currentUserId?: string | null
  onReply: (id: string) => void
  activeReply: string | null
  depth?: number
}

function CommentItem({ comment, currentUserId, onReply, depth = 0 }: CommentItemProps) {
  const timeAgo = React.useMemo(() => {
    const diff = Date.now() - new Date(comment.createdAt).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(comment.createdAt).toLocaleDateString()
  }, [comment.createdAt])

  return (
    <div className={cn('space-y-2', depth > 0 && 'ml-8 border-l-2 border-border pl-4')}>
      <div className="flex items-start gap-3">
        <UserAvatar name={comment.authorName} image={comment.authorImage} size="sm" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.authorName}</span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{comment.body}</p>
          {currentUserId && depth === 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-1 py-0 text-xs text-muted-foreground"
              onClick={() => onReply(comment.id)}
            >
              Reply
            </Button>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              activeReply={null}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
