'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STUDIO_MAX_TAGS, STUDIO_MAX_TITLE_LENGTH } from '@/lib/constants'

interface SketchMetaProps {
  title: string
  description: string
  tags: string[]
  onChange: (field: string, value: unknown) => void
  editable?: boolean
}

export function SketchMeta({
  title,
  description,
  tags,
  onChange,
  editable = true,
}: SketchMetaProps) {
  const [tagInput, setTagInput] = React.useState('')

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase()
    if (!tag || tags.includes(tag) || tags.length >= STUDIO_MAX_TAGS) return
    onChange('tags', [...tags, tag])
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    onChange(
      'tags',
      tags.filter((t) => t !== tag)
    )
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  if (!editable) {
    return (
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange('title', e.target.value)}
          onBlur={() => onChange('title', title.trim())}
          placeholder="Untitled Sketch"
          maxLength={STUDIO_MAX_TITLE_LENGTH}
          className="w-full border-0 bg-transparent text-lg font-semibold placeholder:text-muted-foreground/50 focus:outline-none"
        />
      </div>
      <div>
        <textarea
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          onBlur={() => onChange('description', description.trim())}
          placeholder="Add a description..."
          rows={2}
          className="w-full resize-none border-0 bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {tags.length < STUDIO_MAX_TAGS && (
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => {
                if (tagInput.trim()) addTag(tagInput)
              }}
              placeholder={tags.length === 0 ? 'Add tags...' : ''}
              className={cn(
                'flex-1 border-0 bg-transparent text-xs placeholder:text-muted-foreground/50 focus:outline-none',
                'min-w-[60px]'
              )}
            />
          )}
        </div>
      </div>
    </div>
  )
}
