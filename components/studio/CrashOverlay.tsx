'use client'

import { AlertTriangle, RefreshCw, Wrench } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'

interface CrashOverlayProps {
  error?: string
  onRestart: () => void
  onFix?: () => void
  visible: boolean
}

export function CrashOverlay({ error, onRestart, onFix, visible }: CrashOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-black/70 to-black/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground">
            Sketch stopped responding
          </h3>
          {error && (
            <p className="max-w-sm text-center font-mono text-sm text-muted-foreground">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button onClick={onRestart} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Restart
            </Button>
            {onFix && (
              <Button onClick={onFix} variant="outline" className="gap-2 text-amber-500 hover:text-amber-400">
                <Wrench className="h-4 w-4" />
                Fix with AI
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
