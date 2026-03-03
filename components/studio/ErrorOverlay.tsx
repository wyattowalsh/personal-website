'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle, Wrench, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ErrorOverlayProps {
  error: string | null
  errorLine?: number | null
  crashed?: boolean
  onGoToLine?: (line: number) => void
  onFix?: () => void
  onDismiss?: () => void
  className?: string
}

export function ErrorOverlay({
  error,
  errorLine,
  crashed,
  onGoToLine,
  onFix,
  onDismiss,
  className,
}: ErrorOverlayProps) {
  const visible = error != null && !crashed

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'absolute bottom-0 left-0 right-0 z-20 border-t border-destructive/20 bg-destructive/10 backdrop-blur-md',
            className,
          )}
        >
          <div className="flex items-center gap-2 px-3 py-2">
            {/* Icon */}
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />

            {/* Error message */}
            <span className="min-w-0 flex-1 line-clamp-2 font-mono text-xs text-destructive">
              {error}
            </span>

            {/* Line number badge */}
            {errorLine != null && (
              <button
                type="button"
                onClick={() => onGoToLine?.(errorLine)}
                className="shrink-0 cursor-pointer rounded-full bg-destructive/20 px-2 py-0.5 font-mono text-[10px] text-destructive transition-colors hover:bg-destructive/30"
              >
                L{errorLine}
              </button>
            )}

            {/* Fix with AI */}
            {onFix && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onFix}
                className="h-6 shrink-0 gap-1 px-2 text-[10px] text-destructive hover:text-destructive"
              >
                <Wrench className="h-3 w-3" />
                Fix with AI
              </Button>
            )}

            {/* Dismiss */}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="shrink-0 rounded-sm p-0.5 text-destructive/60 transition-colors hover:text-destructive"
                aria-label="Dismiss error"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
