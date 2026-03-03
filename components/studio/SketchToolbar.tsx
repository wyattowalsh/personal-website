'use client'

import { Play, Square, Camera, Download, Layers, Image, FileCode, Save, Upload, Loader2, Check, Sparkles, Wrench, Maximize2, Keyboard } from 'lucide-react'
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

interface SketchToolbarProps {
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
  onEngineChange: (engine: EngineType) => void
  onSave?: () => void
  onPublish?: () => void
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  onToggleFullscreen?: () => void
  onOpenShortcuts?: () => void
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  variant,
  className,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant ?? 'ghost'}
          size="icon"
          className={cn('h-9 w-9 rounded-lg active:scale-95 transition-all duration-150', className)}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function SketchToolbar({
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
}: SketchToolbarProps) {
  const svgAvailable = engine === 'p5js'

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1.5 border-b border-border/60 bg-background/40 px-3 py-1.5 backdrop-blur-sm">
        {isRunning ? (
          <ToolbarButton
            icon={Square}
            label="Stop (Cmd+Enter)"
            onClick={onStop}
            className="text-red-500 hover:text-red-400"
          />
        ) : (
          <ToolbarButton
            icon={Play}
            label="Run (Cmd+Enter)"
            onClick={onRun}
            className="text-green-500 hover:text-green-400"
          />
        )}

        <div className="mx-1.5 h-5 w-px bg-border/50" />

        {onSave && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg active:scale-95 transition-all duration-150"
                onClick={onSave}
                disabled={saveStatus === 'saving'}
                aria-label="Save"
              >
                {saveStatus === 'saving' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saveStatus === 'saved' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {saveStatus === 'saving'
                ? 'Saving...'
                : saveStatus === 'saved'
                  ? 'Saved'
                  : saveStatus === 'error'
                    ? 'Save failed — click to retry'
                    : 'Save (Cmd+S)'}
            </TooltipContent>
          </Tooltip>
        )}

        {onPublish && (
          <ToolbarButton
            icon={Upload}
            label="Publish"
            onClick={onPublish}
            disabled={saveStatus === 'saving'}
          />
        )}

        <div className="mx-1.5 h-5 w-px bg-border/50" />

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg active:scale-95 transition-all duration-150"
                  disabled={!isRunning}
                  aria-label="Export"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
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
              title={!svgAvailable ? 'SVG export is only available for p5.js sketches' : undefined}
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

        <div className="flex-1" />

        {onOpenFix && (
          <ToolbarButton
            icon={Wrench}
            label="Fix with AI"
            onClick={onOpenFix}
            className={hasErrors ? 'text-amber-500 hover:text-amber-400' : undefined}
          />
        )}
        {onOpenGenerate && (
          <ToolbarButton
            icon={Sparkles}
            label="Generate with AI"
            onClick={onOpenGenerate}
          />
        )}
        <ToolbarButton
          icon={Layers}
          label="Templates"
          onClick={onOpenTemplates}
        />
        {onToggleFullscreen && (
          <ToolbarButton
            icon={Maximize2}
            label="Fullscreen Preview (Cmd+Shift+F)"
            onClick={onToggleFullscreen}
          />
        )}
        {onOpenShortcuts && (
          <ToolbarButton
            icon={Keyboard}
            label="Keyboard Shortcuts (Cmd+?)"
            onClick={onOpenShortcuts}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
