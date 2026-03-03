interface GenerateProgressProps {
  downloaded: number
  total: number
  stage: 'downloading' | 'loading' | 'generating'
}

const stageLabels: Record<string, string> = {
  downloading: 'Downloading model...',
  loading: 'Loading model...',
  generating: 'Generating...',
}

export function GenerateProgress({
  downloaded,
  total,
  stage,
}: GenerateProgressProps) {
  const pct = total > 0 ? Math.round((downloaded / total) * 100) : 0

  return (
    <div className="space-y-2 py-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{stageLabels[stage]}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
