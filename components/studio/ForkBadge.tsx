import { GitFork } from 'lucide-react'
import Link from 'next/link'

interface ForkBadgeProps {
  parentTitle: string
  parentId: string
  parentAuthorName: string
}

export function ForkBadge({
  parentTitle,
  parentId,
  parentAuthorName,
}: ForkBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <GitFork className="h-3 w-3" />
      <span>
        Forked from{' '}
        <Link
          href={`/studio/${parentId}`}
          className="font-medium text-foreground hover:underline"
        >
          {parentTitle}
        </Link>{' '}
        by {parentAuthorName}
      </span>
    </div>
  )
}
