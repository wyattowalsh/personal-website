'use client'

import * as React from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ConsoleEntry } from '@/lib/studio/types'
import { STUDIO_MAX_CONSOLE_ENTRIES } from '@/lib/constants'

const typeStyles: Record<ConsoleEntry['type'], string> = {
  log: 'text-muted-foreground border-l-2 border-transparent',
  info: 'text-blue-400 border-l-2 border-blue-400/50 bg-blue-400/5',
  warn: 'text-yellow-400 border-l-2 border-yellow-400/50 bg-yellow-400/5',
  error: 'text-red-400 border-l-2 border-red-400/50 bg-red-400/5',
}

const typeLabels: Record<ConsoleEntry['type'], string> = {
  log: '',
  info: '[info]',
  warn: '[warn]',
  error: '[error]',
}

type FilterType = ConsoleEntry['type'] | 'all'

const filterTypes: FilterType[] = ['all', 'log', 'warn', 'error']

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

interface ConsoleOutputProps {
  entries: ConsoleEntry[]
  onClear: () => void
}

export function ConsoleOutput({ entries, onClear }: ConsoleOutputProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = React.useState(false)
  const [filter, setFilter] = React.useState<FilterType>('all')

  const typeCounts = React.useMemo(() => {
    const counts: Record<string, number> = { log: 0, warn: 0, error: 0 }
    for (const e of entries) if (e.type in counts) counts[e.type]++
    return counts
  }, [entries])

  const visibleEntries = React.useMemo(() => {
    const capped = entries.slice(-STUDIO_MAX_CONSOLE_ENTRIES)
    if (filter === 'all') return capped
    return capped.filter((e) => e.type === filter)
  }, [entries, filter])

  React.useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [visibleEntries.length])

  return (
    <div
      className={cn(
        'flex shrink-0 flex-col border-t border-white/[0.06] bg-background/60 backdrop-blur-md transition-[height] duration-200',
        collapsed ? 'h-auto' : 'h-40'
      )}
    >
      <div className="flex items-center justify-between border-b border-white/[0.04] px-3 py-1.5">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none focus-visible:rounded-sm"
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            Console
            {entries.length > 0 && (
              <span className="rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
                {entries.length}
              </span>
            )}
          </button>
          <div className="ml-2 flex gap-0.5">
            {filterTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-medium transition-all duration-200',
                  filter === type
                    ? 'bg-primary/15 text-primary shadow-[0_0_6px_hsl(var(--primary)/0.2)]'
                    : 'text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
                )}
              >
                {type === 'all' ? 'All' : type}
                {type !== 'all' && (
                  <span className="ml-0.5 opacity-90">
                    ({typeCounts[type] ?? 0})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClear}
          aria-label="Clear console"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {!collapsed && (
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          className="flex-1 overflow-y-auto p-2 font-mono text-xs"
        >
          {visibleEntries.length === 0 ? (
            <p className="text-muted-foreground/80">No console output</p>
          ) : (
            visibleEntries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  'whitespace-pre-wrap rounded-sm py-1 pl-2 pr-1',
                  typeStyles[entry.type]
                )}
              >
                <span className="mr-1.5 select-none opacity-40">
                  {formatTimestamp(entry.timestamp)}
                </span>
                {typeLabels[entry.type] && (
                  <span className="mr-1 opacity-70">
                    {typeLabels[entry.type]}
                  </span>
                )}
                {entry.args.join(' ')}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
