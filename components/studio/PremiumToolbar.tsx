'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import {
  Play,
  Square,
  Camera,
  Download,
  Save,
  Upload,
  Loader2,
  Check,
  Sparkles,
  Wrench,
  Layers,
  Maximize2,
  Keyboard,
  Image,
  FileCode,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { EngineType } from '@/lib/studio/types'

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface PremiumToolbarProps {
  isRunning: boolean
  onRun: () => void
  onStop: () => void
  onCapture: () => void
  onCaptureSvg?: () => void
  onDownload: () => void
  onOpenTemplates: () => void
  onOpenGenerate?: () => void
  onOpenFix?: () => void
  hasErrors?: boolean
  engine: EngineType
  onSave?: () => void
  onPublish?: () => void
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  onToggleFullscreen?: () => void
  onOpenShortcuts?: () => void
  onOpenSettings?: () => void
  children?: React.ReactNode
}

/* -------------------------------------------------------------------------- */
/*                             Internal Components                            */
/* -------------------------------------------------------------------------- */

function ToolbarSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-lg bg-muted/30 px-1 py-0.5 dark:bg-white/[0.04]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function GradientDivider() {
  return (
    <div className="mx-1 h-6 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent" />
  )
}

const springTransition = { type: 'spring', stiffness: 400, damping: 25 } as const

function PremiumToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  className,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          whileHover={disabled ? undefined : { scale: 1.08, y: -1 }}
          whileTap={disabled ? undefined : { scale: 0.92 }}
          transition={springTransition}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg transition-colors duration-150',
              className,
            )}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Save Button                                   */
/* -------------------------------------------------------------------------- */

function SaveButton({
  onClick,
  saveStatus,
}: {
  onClick: () => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}) {
  const label =
    saveStatus === 'saving'
      ? 'Saving...'
      : saveStatus === 'saved'
        ? 'Saved'
        : saveStatus === 'error'
          ? 'Save failed \u2014 click to retry'
          : 'Save (Cmd+S)'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          whileHover={saveStatus === 'saving' ? undefined : { scale: 1.08, y: -1 }}
          whileTap={saveStatus === 'saving' ? undefined : { scale: 0.92 }}
          transition={springTransition}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg transition-colors duration-150"
            onClick={onClick}
            disabled={saveStatus === 'saving'}
            aria-label={label}
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveStatus === 'saved' ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Playback Button                                 */
/* -------------------------------------------------------------------------- */

function PlaybackButton({
  isRunning,
  onRun,
  onStop,
}: {
  isRunning: boolean
  onRun: () => void
  onStop: () => void
}) {
  if (isRunning) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(239,68,68,0.4)',
                '0 0 0 8px rgba(239,68,68,0)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="rounded-lg"
          >
            <motion.div
              whileHover={{ scale: 1.08, y: -1 }}
              whileTap={{ scale: 0.92 }}
              transition={springTransition}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-red-500 transition-colors duration-150 hover:text-red-400"
                onClick={onStop}
                aria-label="Stop (Cmd+Enter)"
              >
                <Square className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>Stop (Cmd+Enter)</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.08, y: -1 }}
          whileTap={{ scale: 0.92 }}
          transition={springTransition}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-green-500 transition-colors duration-150 hover:text-green-400 hover:shadow-[0_0_8px_rgba(34,197,94,0.2)]"
            onClick={onRun}
            aria-label="Run (Cmd+Enter)"
          >
            <Play className="h-4 w-4" />
          </Button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>Run (Cmd+Enter)</TooltipContent>
    </Tooltip>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Export Dropdown                                  */
/* -------------------------------------------------------------------------- */

function ExportDropdown({
  isRunning,
  svgAvailable,
  onCapture,
  onCaptureSvg,
  onDownload,
}: {
  isRunning: boolean
  svgAvailable: boolean
  onCapture: () => void
  onCaptureSvg?: () => void
  onDownload: () => void
}) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={!isRunning ? undefined : { scale: 1.08, y: -1 }}
            whileTap={!isRunning ? undefined : { scale: 0.92 }}
            transition={springTransition}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg transition-colors duration-150"
                disabled={!isRunning}
                aria-label="Export"
              >
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>Export</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onCapture}>
          <Camera className="mr-2 h-4 w-4" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={svgAvailable ? onCaptureSvg : undefined}
          disabled={!svgAvailable}
          title={
            !svgAvailable
              ? 'SVG export is only available for p5.js sketches'
              : undefined
          }
        >
          <Image className="mr-2 h-4 w-4" />
          Export as SVG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownload}>
          <FileCode className="mr-2 h-4 w-4" />
          Download code
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export function PremiumToolbar({
  isRunning,
  onRun,
  onStop,
  onCapture,
  onCaptureSvg,
  onDownload,
  onOpenTemplates,
  onOpenGenerate,
  onOpenFix,
  hasErrors,
  engine,
  onSave,
  onPublish,
  saveStatus = 'idle',
  onToggleFullscreen,
  onOpenShortcuts,
  onOpenSettings,
  children,
}: PremiumToolbarProps) {
  const svgAvailable = engine === 'p5js'

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 border-b border-white/[0.06] bg-background/60 px-3 py-1.5 backdrop-blur-xl dark:border-white/[0.04]">
        {/* Playback */}
        <ToolbarSection>
          <PlaybackButton isRunning={isRunning} onRun={onRun} onStop={onStop} />
        </ToolbarSection>

        <GradientDivider />

        {/* Save */}
        <ToolbarSection>
          {onSave && (
            <SaveButton onClick={onSave} saveStatus={saveStatus} />
          )}
          {onPublish && (
            <PremiumToolbarButton
              icon={Upload}
              label="Publish"
              onClick={onPublish}
              disabled={saveStatus === 'saving'}
            />
          )}
        </ToolbarSection>

        <GradientDivider />

        {/* Export */}
        <ToolbarSection>
          <ExportDropdown
            isRunning={isRunning}
            svgAvailable={svgAvailable}
            onCapture={onCapture}
            onCaptureSvg={onCaptureSvg}
            onDownload={onDownload}
          />
        </ToolbarSection>

        {/* Spacer */}
        <div className="flex-1" />

        {/* AI */}
        <ToolbarSection>
          {onOpenFix && (
            <PremiumToolbarButton
              icon={Wrench}
              label="Fix with AI"
              onClick={onOpenFix}
              className={cn(
                hasErrors &&
                  'text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)] hover:text-amber-400',
              )}
            />
          )}
          {onOpenGenerate && (
            <PremiumToolbarButton
              icon={Sparkles}
              label="Generate with AI"
              onClick={onOpenGenerate}
              className="hover:text-primary/80"
            />
          )}
        </ToolbarSection>

        <GradientDivider />

        {/* View */}
        <ToolbarSection>
          <PremiumToolbarButton
            icon={Layers}
            label="Templates"
            onClick={onOpenTemplates}
          />
          {onToggleFullscreen && (
            <PremiumToolbarButton
              icon={Maximize2}
              label="Fullscreen Preview (Cmd+Shift+F)"
              onClick={onToggleFullscreen}
            />
          )}
          {onOpenShortcuts && (
            <PremiumToolbarButton
              icon={Keyboard}
              label="Keyboard Shortcuts (Cmd+?)"
              onClick={onOpenShortcuts}
            />
          )}
        </ToolbarSection>

        <GradientDivider />

        {/* Settings */}
        {onOpenSettings && (
          <PremiumToolbarButton
            icon={Settings}
            label="Settings"
            onClick={onOpenSettings}
          />
        )}

        {children}
      </div>
    </TooltipProvider>
  )
}
