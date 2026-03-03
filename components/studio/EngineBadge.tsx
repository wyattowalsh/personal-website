'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Code2, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { getEngineColor, createEngineLabel } from '@/lib/studio/engine-adapter'
import type { EngineType } from '@/lib/studio/types'

interface EngineBadgeProps {
  engine: EngineType
  onChange: (engine: EngineType) => void
  autoDetectEnabled: boolean
  onToggleAutoDetect: () => void
  wasAutoDetected?: boolean
  className?: string
}

interface EngineOption {
  engine: EngineType
  icon: React.ElementType
  description: string
}

const ENGINE_OPTIONS: EngineOption[] = [
  { engine: 'p5js', icon: Code2, description: 'JavaScript creative coding' },
  { engine: 'glsl', icon: Sparkles, description: 'Fragment shaders' },
  { engine: 'webgpu', icon: Zap, description: 'Compute shaders' },
]

function getEngineIcon(engine: EngineType): React.ElementType {
  switch (engine) {
    case 'p5js':
      return Code2
    case 'glsl':
      return Sparkles
    case 'webgpu':
      return Zap
    default: {
      const _exhaustive: never = engine
      return _exhaustive
    }
  }
}

export function EngineBadge({
  engine,
  onChange,
  autoDetectEnabled,
  onToggleAutoDetect,
  wasAutoDetected = false,
  className,
}: EngineBadgeProps) {
  const [open, setOpen] = React.useState(false)
  const [webgpuAvailable, setWebgpuAvailable] = React.useState(true)

  React.useEffect(() => {
    setWebgpuAvailable(typeof navigator !== 'undefined' && !!navigator.gpu)
  }, [])

  const color = getEngineColor(engine)
  const label = createEngineLabel(engine)
  const Icon = getEngineIcon(engine)

  const handleSelect = React.useCallback(
    (selected: EngineType) => {
      if (selected === engine) return
      if (selected === 'webgpu' && !webgpuAvailable) return
      onChange(selected)
      setOpen(false)
    },
    [engine, onChange, webgpuAvailable],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            'border transition-colors hover:brightness-110',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            className,
          )}
          style={{
            borderColor: `${color}40`,
            backgroundColor: `${color}15`,
            color,
          }}
          animate={
            wasAutoDetected
              ? {
                  boxShadow: [
                    `0 0 0 0px ${color}00`,
                    `0 0 0 4px ${color}40`,
                    `0 0 0 0px ${color}00`,
                  ],
                }
              : undefined
          }
          transition={
            wasAutoDetected
              ? { duration: 3, ease: 'easeInOut' }
              : undefined
          }
        >
          <Icon className="h-3.5 w-3.5" />
          <AnimatePresence mode="wait">
            <motion.span
              key={engine}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className={cn(
          'w-64 rounded-xl p-0',
          'bg-background/80 backdrop-blur-xl border border-white/[0.06]',
        )}
      >
        <div className="p-1.5">
          {ENGINE_OPTIONS.map((option) => {
            const optionColor = getEngineColor(option.engine)
            const optionLabel = createEngineLabel(option.engine)
            const OptionIcon = option.icon
            const isActive = option.engine === engine
            const isDisabled = option.engine === 'webgpu' && !webgpuAvailable

            return (
              <button
                key={option.engine}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelect(option.engine)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                  isActive
                    ? 'bg-accent/50'
                    : 'hover:bg-accent/30',
                  isDisabled && 'cursor-not-allowed opacity-40',
                )}
              >
                {/* Color indicator */}
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${optionColor}20` }}
                >
                  <OptionIcon
                    className="h-4 w-4"
                    style={{ color: optionColor }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {optionLabel}
                    </span>
                    {isActive && (
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: optionColor }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                    {isDisabled && ' (not available)'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Auto-detect toggle */}
        <div className="border-t border-white/[0.06] px-3 py-2.5">
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <span className="text-sm text-foreground">Auto-detect</span>
              <p className="text-xs text-muted-foreground">
                Switch engine based on code
              </p>
            </div>
            <Switch
              checked={autoDetectEnabled}
              onCheckedChange={onToggleAutoDetect}
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}
