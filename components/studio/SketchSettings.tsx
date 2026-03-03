'use client'

import * as React from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { STUDIO_CANVAS_PRESETS } from '@/lib/constants'
import type { SketchConfig } from '@/lib/studio/types'

interface SketchSettingsProps {
  config: SketchConfig
  onChange: (config: SketchConfig) => void
  aiAutoMode?: boolean
  onToggleAiAutoMode?: () => void
}

const FPS_OPTIONS = [15, 30, 60] as const

export function SketchSettings({ config, onChange, aiAutoMode, onToggleAiAutoMode }: SketchSettingsProps) {
  const update = (partial: Partial<SketchConfig>) =>
    onChange({ ...config, ...partial })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Sketch settings">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium leading-none">Canvas Size</h4>
            <div className="flex flex-wrap gap-1">
              {STUDIO_CANVAS_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant={
                    config.width === preset.width && config.height === preset.height
                      ? 'secondary'
                      : 'outline'
                  }
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    update({ width: preset.width, height: preset.height })
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Width</Label>
                <input
                  type="number"
                  value={config.width}
                  onChange={(e) => update({ width: Number(e.target.value) || 400 })}
                  className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                  min={1}
                  max={4096}
                />
              </div>
              <div>
                <Label className="text-xs">Height</Label>
                <input
                  type="number"
                  value={config.height}
                  onChange={(e) => update({ height: Number(e.target.value) || 400 })}
                  className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                  min={1}
                  max={4096}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium leading-none">FPS</h4>
            <div className="flex gap-1">
              {FPS_OPTIONS.map((fps) => (
                <Button
                  key={fps}
                  variant={config.fps === fps ? 'secondary' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => update({ fps })}
                >
                  {fps}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Background Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="h-8 w-8 cursor-pointer rounded border border-input"
              />
              <input
                type="text"
                value={config.backgroundColor}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="h-8 flex-1 rounded-md border border-input bg-background px-2 font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">HiDPI (2x)</Label>
            <Slider
              value={[config.pixelDensity]}
              onValueChange={([v]) => update({ pixelDensity: v })}
              min={1}
              max={2}
              step={1}
              className="w-20"
            />
          </div>

          {onToggleAiAutoMode !== undefined && (
            <>
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium leading-none">AI Autocomplete</h4>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Auto-suggest</Label>
                <Switch
                  checked={aiAutoMode ?? false}
                  onCheckedChange={() => onToggleAiAutoMode?.()}
                />
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
