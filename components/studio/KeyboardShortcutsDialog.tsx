'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const shortcuts = [
  { keys: ['Cmd', 'Enter'], description: 'Run / Stop sketch' },
  { keys: ['Cmd', 'S'], description: 'Save sketch' },
  { keys: ['Cmd', 'K'], description: 'Command palette' },
  { keys: ['Cmd', 'Shift', 'P'], description: 'Insert snippet' },
  { keys: ['Cmd', '?'], description: 'Show keyboard shortcuts' },
  { keys: ['Escape'], description: 'Exit fullscreen preview' },
  { keys: ['Cmd', 'Shift', 'F'], description: 'Toggle fullscreen preview' },
  // AI features
  { keys: ['Ctrl', 'Shift', 'Space'], description: 'Trigger AI autocomplete' },
  { keys: ['Tab'], description: 'Accept AI suggestion' },
  { keys: ['Cmd', 'I'], description: 'Inline edit selection with AI' },
  { keys: ['Cmd', 'Shift', 'Enter'], description: 'Generate AI variations' },
  { keys: ['Alt', '[', ']'], description: 'Cycle through variations' },
]

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground shadow-sm">
      {children}
    </kbd>
  )
}

interface KeyboardShortcutsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-white/[0.06] bg-background/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.description} className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
