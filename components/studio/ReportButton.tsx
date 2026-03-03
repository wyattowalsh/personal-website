'use client'

import * as React from 'react'
import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
// Label available from @/components/ui/label if needed

interface ReportButtonProps {
  sketchId: string
  onReport: (reason: string) => void
}

const REASONS = [
  'Inappropriate content',
  'Spam or misleading',
  'Copyright violation',
  'Malicious code',
  'Other',
] as const

export function ReportButton({ sketchId: _sketchId, onReport }: ReportButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState('')

  const handleSubmit = () => {
    if (!reason) return
    onReport(reason)
    setOpen(false)
    setReason('')
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
        aria-label="Report sketch"
      >
        <Flag className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Report Sketch</DialogTitle>
            <DialogDescription>
              Please select a reason for reporting this sketch.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {REASONS.map((r) => (
              <label
                key={r}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-primary"
                />
                {r}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={!reason}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
