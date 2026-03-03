'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { SketchTemplate } from '@/lib/studio/types'
import { ParametricGenerator } from './ParametricGenerator'

interface TemplateSelectorProps {
  templates: SketchTemplate[]
  onSelect: (template: SketchTemplate) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORIES = ['basic', 'animation', 'interactive', 'generative', 'parametric'] as const

const categoryLabels: Record<(typeof CATEGORIES)[number], string> = {
  basic: 'Basic',
  animation: 'Animation',
  interactive: 'Interactive',
  generative: 'Generative',
  parametric: 'Parametric',
}

export function TemplateSelector({
  templates,
  onSelect,
  open,
  onOpenChange,
}: TemplateSelectorProps) {
  const grouped = React.useMemo(() => {
    const map = new Map<string, SketchTemplate[]>()
    for (const cat of CATEGORIES) map.set(cat, [])
    for (const t of templates) {
      const list = map.get(t.category)
      if (list) list.push(t)
    }
    return map
  }, [templates])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start from a template to get up and running quickly.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="basic">
          <TabsList>
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {categoryLabels[cat]}
              </TabsTrigger>
            ))}
          </TabsList>
          {CATEGORIES.map((cat) => (
            <TabsContent key={cat} value={cat}>
              {cat === 'parametric' ? (
                <ParametricGenerator
                  onGenerate={(code) => {
                    onSelect({
                      id: `parametric-${Date.now()}`,
                      name: 'Parametric',
                      category: 'parametric',
                      description: 'Generated parametric art',
                      code,
                      engine: 'p5js',
                    })
                    onOpenChange(false)
                  }}
                />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(grouped.get(cat) ?? []).map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        onSelect(template)
                        onOpenChange(false)
                      }}
                      className={cn(
                        'group rounded-lg border border-border p-3 text-left transition-colors',
                        'hover:border-primary/50 hover:bg-accent/50',
                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
                      )}
                    >
                      <h4 className="text-sm font-medium">{template.name}</h4>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {template.description}
                      </p>
                      <span className="mt-2 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                        {template.engine}
                      </span>
                    </button>
                  ))}
                  {(grouped.get(cat) ?? []).length === 0 && (
                    <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                      No templates in this category yet.
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
