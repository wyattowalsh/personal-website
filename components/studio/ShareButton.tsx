'use client'

import * as React from 'react'
import { Share2, Check, Twitter, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ShareButtonProps {
  sketchId: string
  title: string
}

export function ShareButton({ sketchId, title }: ShareButtonProps) {
  const [copied, setCopied] = React.useState(false)

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/studio/${sketchId}`
    : `/studio/${sketchId}`

  const copyUrl = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareTwitter = () => {
    const text = encodeURIComponent(`Check out "${title}" on Studio`)
    const shareUrl = encodeURIComponent(url)
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const shareLinkedIn = () => {
    const shareUrl = encodeURIComponent(url)
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="end">
        <div className="grid gap-1">
          <button
            type="button"
            onClick={copyUrl}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button
            type="button"
            onClick={shareTwitter}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <Twitter className="h-3.5 w-3.5" />
            Share on Twitter
          </button>
          <button
            type="button"
            onClick={shareLinkedIn}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <Linkedin className="h-3.5 w-3.5" />
            Share on LinkedIn
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
