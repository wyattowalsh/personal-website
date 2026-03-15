'use client'

import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import {
  Play,
  Square,
  Save,
  Upload,
  Camera,
  Image,
  FileCode,
  Layers,
  Sparkles,
  Wrench,
  Maximize2,
  Keyboard,
  Trash2,
  Search,
  Code2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EngineType } from '@/lib/studio/types'

export interface CommandAction {
  id: string
  label: string
  icon: React.ElementType
  shortcut?: string
  onAction: () => void
  category?: string
  disabled?: boolean
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actions: CommandAction[]
  engine: EngineType
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function CommandPalette({
  open,
  onOpenChange,
  actions,
  engine: _engine,
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  // Filter actions by search query
  const filtered = React.useMemo(() => {
    if (!query.trim()) return actions
    const q = query.toLowerCase()
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        (a.category && a.category.toLowerCase().includes(q))
    )
  }, [actions, query])

  // Group filtered actions by category
  const grouped = React.useMemo(() => {
    const groups: { category: string; items: CommandAction[] }[] = []
    const categoryMap = new Map<string, CommandAction[]>()

    for (const action of filtered) {
      const cat = action.category ?? 'Other'
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, [])
      }
      categoryMap.get(cat)!.push(action)
    }

    for (const [category, items] of categoryMap) {
      groups.push({ category, items })
    }

    return groups
  }, [filtered])

  // Flat list for keyboard navigation
  const flatItems = React.useMemo(() => filtered, [filtered])

  // Reset selected index when query changes
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Reset query when opening
  React.useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      // Focus the input after animation
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [open])

  // Save and restore focus around dialog lifecycle
  React.useEffect(() => {
    if (open) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      return
    }
    previousFocusRef.current?.focus()
  }, [open])

  // Scroll selected item into view
  React.useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector('[data-selected="true"]')
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const executeAction = React.useCallback(
    (action: CommandAction) => {
      if (action.disabled) return
      onOpenChange(false)
      // Slight delay so the palette closes before action executes
      requestAnimationFrame(() => {
        action.onAction()
      })
    },
    [onOpenChange]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        const root = dialogRef.current
        if (!root) return
        const focusable = Array.from(
          root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (flatItems[selectedIndex]) {
            executeAction(flatItems[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onOpenChange(false)
          break
      }
    },
    [flatItems, selectedIndex, executeAction, onOpenChange]
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.1 }}
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
            <motion.div
              ref={dialogRef}
              className="mx-4 w-full max-w-lg overflow-hidden rounded-xl border border-border/80 bg-card/95 text-card-foreground shadow-[0_32px_80px_-32px_rgba(0,0,0,0.85)] backdrop-blur-xl"
              initial={prefersReducedMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }}
              onKeyDown={handleKeyDown}
              role="dialog"
              aria-modal="true"
              aria-labelledby="command-palette-title"
              aria-describedby="command-palette-help"
            >
              <h2 id="command-palette-title" className="sr-only">
                Command palette
              </h2>
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3 transition-colors focus-within:bg-muted/20">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                <label htmlFor="command-palette-search" className="sr-only">
                  Search commands
                </label>
                <input
                  id="command-palette-search"
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command..."
                  className="flex-1 rounded-sm bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-80 overflow-y-auto py-1" role="listbox" aria-label="Commands">
                {flatItems.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground/60">
                    No matching commands
                  </div>
                ) : (
                  grouped.map((group) => (
                    <div key={group.category}>
                      <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/50">
                        {group.category}
                      </div>
                      {group.items.map((action) => {
                        const globalIndex = flatItems.indexOf(action)
                        const isSelected = globalIndex === selectedIndex
                        const Icon = action.icon

                        return (
                          <button
                            key={action.id}
                            type="button"
                            data-selected={isSelected}
                            role="option"
                            aria-selected={isSelected}
                            className={cn(
                              'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
                              isSelected
                                ? 'bg-accent text-accent-foreground'
                                : 'text-foreground hover:bg-accent/60',
                              action.disabled &&
                                'cursor-not-allowed opacity-40'
                            )}
                            onClick={() => executeAction(action)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            disabled={action.disabled}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1">{action.label}</span>
                            {action.shortcut && (
                              <span className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                {action.shortcut}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div
                id="command-palette-help"
                className="border-t border-border/60 px-4 py-2 text-[10px] text-muted-foreground/50"
              >
                <span className="select-none">
                  ↑↓ Navigate · Enter Select · Esc Close
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export function createStudioActions(handlers: {
  onRun: () => void
  onStop: () => void
  onSave?: () => void
  onPublish?: () => void
  onCapture: () => void
  onCaptureSvg?: () => void
  onDownload: () => void
  onOpenTemplates: () => void
  onOpenGenerate?: () => void
  onOpenFix?: () => void
  onToggleFullscreen?: () => void
  onOpenShortcuts?: () => void
  onClearConsole?: () => void
  onOpenSnippets?: () => void
  isRunning: boolean
  engine: EngineType
}): CommandAction[] {
  const actions: CommandAction[] = []

  // -- Playback --
  if (handlers.isRunning) {
    actions.push({
      id: 'stop',
      label: 'Stop',
      icon: Square,
      shortcut: '⌘Enter',
      onAction: handlers.onStop,
      category: 'Playback',
    })
  } else {
    actions.push({
      id: 'run',
      label: 'Run',
      icon: Play,
      shortcut: '⌘Enter',
      onAction: handlers.onRun,
      category: 'Playback',
    })
  }

  // -- File --
  if (handlers.onSave) {
    actions.push({
      id: 'save',
      label: 'Save',
      icon: Save,
      shortcut: '⌘S',
      onAction: handlers.onSave,
      category: 'File',
    })
  }

  if (handlers.onPublish) {
    actions.push({
      id: 'publish',
      label: 'Publish',
      icon: Upload,
      onAction: handlers.onPublish,
      category: 'File',
    })
  }

  actions.push({
    id: 'capture-png',
    label: 'Export PNG',
    icon: Camera,
    onAction: handlers.onCapture,
    category: 'File',
  })

  actions.push({
    id: 'capture-svg',
    label: 'Export SVG',
    icon: Image,
    onAction: handlers.onCaptureSvg ?? (() => {}),
    category: 'File',
    disabled: handlers.engine !== 'p5js',
  })

  actions.push({
    id: 'download',
    label: 'Download Code',
    icon: FileCode,
    onAction: handlers.onDownload,
    category: 'File',
  })

  // -- AI --
  if (handlers.onOpenGenerate) {
    actions.push({
      id: 'generate',
      label: 'Generate with AI',
      icon: Sparkles,
      shortcut: '⌘⇧Enter',
      onAction: handlers.onOpenGenerate,
      category: 'AI',
    })
  }

  if (handlers.onOpenFix) {
    actions.push({
      id: 'fix',
      label: 'Fix with AI',
      icon: Wrench,
      onAction: handlers.onOpenFix,
      category: 'AI',
    })
  }

  // -- View --
  actions.push({
    id: 'templates',
    label: 'Templates',
    icon: Layers,
    onAction: handlers.onOpenTemplates,
    category: 'View',
  })

  if (handlers.onToggleFullscreen) {
    actions.push({
      id: 'fullscreen',
      label: 'Toggle Fullscreen',
      icon: Maximize2,
      shortcut: '⌘⇧F',
      onAction: handlers.onToggleFullscreen,
      category: 'View',
    })
  }

  if (handlers.onOpenShortcuts) {
    actions.push({
      id: 'shortcuts',
      label: 'Keyboard Shortcuts',
      icon: Keyboard,
      shortcut: '⌘?',
      onAction: handlers.onOpenShortcuts,
      category: 'View',
    })
  }

  // -- Editor --
  if (handlers.onClearConsole) {
    actions.push({
      id: 'clear-console',
      label: 'Clear Console',
      icon: Trash2,
      onAction: handlers.onClearConsole,
      category: 'Editor',
    })
  }

  if (handlers.onOpenSnippets) {
    actions.push({
      id: 'snippets',
      label: 'Insert Snippet',
      icon: Code2,
      shortcut: '⌘⇧P',
      onAction: handlers.onOpenSnippets,
      category: 'Editor',
    })
  }

  return actions
}
