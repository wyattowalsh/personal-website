'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Minimize2, Play, Square, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const HUD_HIDE_DELAY = 2000
const HINT_DISPLAY_DURATION = 2000

interface FullscreenOverlayProps {
  visible: boolean
  isRunning: boolean
  onExit: () => void
  onRun: () => void
  onStop: () => void
  onCapture: () => void
  children: React.ReactNode
}

export function FullscreenOverlay({
  visible,
  isRunning,
  onExit,
  onRun,
  onStop,
  onCapture,
  children,
}: FullscreenOverlayProps) {
  const [hudVisible, setHudVisible] = React.useState(true)
  const [hintVisible, setHintVisible] = React.useState(true)
  const hudTimerRef = React.useRef<ReturnType<typeof setTimeout>>(null)

  // Show keyboard hint briefly on entry
  React.useEffect(() => {
    if (!visible) return
    setHintVisible(true)
    const timer = setTimeout(() => setHintVisible(false), HINT_DISPLAY_DURATION)
    return () => clearTimeout(timer)
  }, [visible])

  // Auto-hide HUD after inactivity
  const resetHudTimer = React.useCallback(() => {
    setHudVisible(true)
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current)
    hudTimerRef.current = setTimeout(() => setHudVisible(false), HUD_HIDE_DELAY)
  }, [])

  React.useEffect(() => {
    if (!visible) return
    resetHudTimer()
    return () => {
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current)
    }
  }, [visible, resetHudTimer])

  // Escape key to exit
  React.useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onExit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible, onExit])

  // Mouse movement shows HUD
  const handleMouseMove = React.useCallback(() => {
    resetHudTimer()
  }, [resetHudTimer])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            'fixed inset-0 z-50 bg-black',
            !hudVisible && 'cursor-none',
          )}
          onMouseMove={handleMouseMove}
        >
          {/* Preview content — centered, fills space */}
          <div className="flex h-full w-full items-center justify-center">
            {children}
          </div>

          {/* Escape hint */}
          <AnimatePresence>
            {hintVisible && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="absolute left-1/2 top-4 z-[52] -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/60 backdrop-blur-sm"
              >
                Press <kbd className="mx-1 rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white/80">Esc</kbd> to exit
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom HUD bar */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[51]"
            animate={{ opacity: hudVisible ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-t from-black/80 to-transparent px-6 pb-6 pt-16">
              <div className="mx-auto flex max-w-md items-center justify-center gap-3">
                {/* Run / Stop */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isRunning ? onStop : onRun}
                  className="gap-2 rounded-lg bg-white/10 text-white/80 backdrop-blur-sm hover:bg-white/20 hover:text-white"
                >
                  {isRunning ? (
                    <>
                      <Square className="h-4 w-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run
                    </>
                  )}
                </Button>

                {/* Capture */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCapture}
                  className="rounded-lg bg-white/10 text-white/80 backdrop-blur-sm hover:bg-white/20 hover:text-white"
                  aria-label="Capture screenshot"
                >
                  <Camera className="h-4 w-4" />
                </Button>

                {/* Exit fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onExit}
                  className="rounded-lg bg-white/10 text-white/80 backdrop-blur-sm hover:bg-white/20 hover:text-white"
                  aria-label="Exit fullscreen"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
