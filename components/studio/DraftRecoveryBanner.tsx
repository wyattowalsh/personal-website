'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Clock, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface DraftRecoveryBannerProps {
  visible: boolean
  draftTimestamp?: number
  onRestore: () => void
  onDiscard: () => void
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export function DraftRecoveryBanner({
  visible,
  draftTimestamp,
  onRestore,
  onDiscard,
}: DraftRecoveryBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'flex items-center gap-3 border-b border-amber-500/20 px-4 py-2.5',
              'bg-amber-500/10 backdrop-blur-md dark:bg-amber-400/10',
            )}
          >
            <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />

            <p className="flex-1 text-sm text-amber-900 dark:text-amber-200">
              You have an unsaved draft
              {draftTimestamp != null && (
                <span className="ml-1 text-amber-700/70 dark:text-amber-300/60">
                  &middot; {formatTimeAgo(draftTimestamp)}
                </span>
              )}
            </p>

            <Button
              size="sm"
              className="h-7 gap-1.5 bg-amber-600 px-3 text-xs text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
              onClick={onRestore}
            >
              <RotateCcw className="h-3 w-3" />
              Restore
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-amber-700 hover:bg-amber-500/20 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-400/20 dark:hover:text-amber-200"
              onClick={onDiscard}
              aria-label="Discard draft"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
