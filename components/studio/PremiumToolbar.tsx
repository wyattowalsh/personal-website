'use client'

import * as React from 'react'
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

type OverlayPortalContainer = HTMLElement | null

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
        'flex items-center gap-0.5 rounded-md border border-border/60 bg-muted/25 px-1.5 py-1',
        className,
      )}
    >
      {children}
    </div>
  )
}

function GradientDivider() {
  return <div className="mx-1 h-5 w-px bg-border/50" />
}

function PremiumToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  className,
  portalContainer,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
  portalContainer?: OverlayPortalContainer
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted/70 hover:text-foreground',
            className,
          )}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent container={portalContainer}>{label}</TooltipContent>
    </Tooltip>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Save Button                                   */
/* -------------------------------------------------------------------------- */

function SaveButton({
  onClick,
  saveStatus,
  portalContainer,
}: {
  onClick: () => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  portalContainer?: OverlayPortalContainer
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted/70 hover:text-foreground"
          onClick={onClick}
          disabled={saveStatus === 'saving'}
          aria-label={label}
        >
          {saveStatus === 'saving' ? (
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
          ) : saveStatus === 'saved' ? (
            <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent container={portalContainer}>{label}</TooltipContent>
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
  portalContainer,
}: {
  isRunning: boolean
  onRun: () => void
  onStop: () => void
  portalContainer?: OverlayPortalContainer
}) {
  if (isRunning) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md bg-rose-500/10 text-rose-700 transition-colors duration-150 hover:bg-rose-500/15 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
            onClick={onStop}
            aria-label="Stop (Cmd+Enter)"
          >
            <Square className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent container={portalContainer}>Stop (Cmd+Enter)</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md bg-emerald-500/10 text-emerald-700 transition-colors duration-150 hover:bg-emerald-500/15 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
          onClick={onRun}
          aria-label="Run (Cmd+Enter)"
        >
          <Play className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent container={portalContainer}>Run (Cmd+Enter)</TooltipContent>
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
  portalContainer,
}: {
  isRunning: boolean
  svgAvailable: boolean
  onCapture: () => void
  onCaptureSvg?: () => void
  onDownload: () => void
  portalContainer?: OverlayPortalContainer
}) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted/70 hover:text-foreground"
              disabled={!isRunning}
              aria-label="Export"
            >
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent container={portalContainer}>Export</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" container={portalContainer}>
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
  const [portalContainer, setPortalContainer] = React.useState<OverlayPortalContainer>(null)

  React.useEffect(() => {
    setPortalContainer(document.getElementById('studio-root'))
  }, [])

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1.5 border-b border-border/60 bg-background/80 px-3 py-2 backdrop-blur-md">
        {/* Playback */}
        <ToolbarSection>
          <PlaybackButton isRunning={isRunning} onRun={onRun} onStop={onStop} portalContainer={portalContainer} />
        </ToolbarSection>

        <GradientDivider />

        {/* Save */}
        <ToolbarSection>
          {onSave && (
            <SaveButton onClick={onSave} saveStatus={saveStatus} portalContainer={portalContainer} />
          )}
          {onPublish && (
            <PremiumToolbarButton
              icon={Upload}
              label="Publish"
              onClick={onPublish}
              disabled={saveStatus === 'saving'}
              portalContainer={portalContainer}
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
            portalContainer={portalContainer}
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
                  'text-amber-400 hover:text-amber-300',
              )}
              portalContainer={portalContainer}
            />
          )}
          {onOpenGenerate && (
            <PremiumToolbarButton
              icon={Sparkles}
              label="Generate with AI"
              onClick={onOpenGenerate}
              className="hover:text-primary/80"
              portalContainer={portalContainer}
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
            portalContainer={portalContainer}
          />
          {onToggleFullscreen && (
            <PremiumToolbarButton
              icon={Maximize2}
              label="Fullscreen Preview (Cmd+Shift+F)"
              onClick={onToggleFullscreen}
              portalContainer={portalContainer}
            />
          )}
          {onOpenShortcuts && (
            <PremiumToolbarButton
              icon={Keyboard}
              label="Keyboard Shortcuts (Cmd+?)"
              onClick={onOpenShortcuts}
              portalContainer={portalContainer}
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
            portalContainer={portalContainer}
          />
        )}

        {children}
      </div>
    </TooltipProvider>
  )
}
