'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface MermaidProps {
  chart: string
  className?: string
  title?: string
}

export function Mermaid({ chart, className, title }: MermaidProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()
  const mermaidId = useId().replace(/:/g, '')
  const lastThemeRef = useRef<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initTheme = async () => {
      if (lastThemeRef.current === resolvedTheme) return
      const mermaid = (await import('mermaid')).default

      mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
        securityLevel: 'strict',
        fontFamily: 'inherit',
        flowchart: { htmlLabels: true, curve: 'basis' },
        themeVariables:
          resolvedTheme === 'dark'
            ? {
                primaryColor: '#6366f1',
                primaryTextColor: '#f8fafc',
                primaryBorderColor: '#4f46e5',
                lineColor: '#64748b',
                secondaryColor: '#1e293b',
                tertiaryColor: '#0f172a',
                background: '#020617',
                mainBkg: '#1e293b',
                nodeBorder: '#4f46e5',
                clusterBkg: '#1e293b',
                clusterBorder: '#334155',
                titleColor: '#f8fafc',
                edgeLabelBackground: '#1e293b',
                noteTextColor: '#f8fafc',
                noteBkgColor: '#1e293b',
                noteBorderColor: '#4f46e5',
              }
            : {
                primaryColor: '#6366f1',
                primaryTextColor: '#1e293b',
                primaryBorderColor: '#4f46e5',
                lineColor: '#64748b',
                secondaryColor: '#f1f5f9',
                tertiaryColor: '#e2e8f0',
                background: '#ffffff',
                mainBkg: '#f8fafc',
                nodeBorder: '#6366f1',
                clusterBkg: '#f1f5f9',
                clusterBorder: '#cbd5e1',
                titleColor: '#1e293b',
                edgeLabelBackground: '#f8fafc',
                noteTextColor: '#1e293b',
                noteBkgColor: '#f1f5f9',
                noteBorderColor: '#6366f1',
              },
      })

      lastThemeRef.current = resolvedTheme ?? null
    }

    initTheme()
  }, [resolvedTheme, mounted])

  useEffect(() => {
    if (!mounted || !chart) return

    const renderChart = async () => {
      try {
        const mermaid = (await import('mermaid')).default
        const id = `mermaid-${mermaidId}`
        const { svg: renderedSvg } = await mermaid.render(id, chart)
        setSvg(renderedSvg)
        setError(null)
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
      }
    }

    renderChart()
  }, [chart, resolvedTheme, mounted, mermaidId])

  if (!mounted) {
    return (
      <div
        role="status"
        aria-label="Loading diagram"
        className={cn(
          'my-6 rounded-xl overflow-hidden',
          'bg-muted/50 animate-pulse',
          'flex items-center justify-center',
          'min-h-[300px]',
          className
        )}
      >
        <span className="text-muted-foreground">Loading diagram...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className={cn(
          'my-6 p-4 rounded-xl',
          'bg-destructive/10 border border-destructive/20',
          'text-destructive',
          className
        )}
      >
        <p className="font-medium">Failed to render diagram</p>
        <pre className="mt-2 text-sm opacity-70 overflow-auto">{error}</pre>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'my-6 rounded-xl overflow-hidden',
        'bg-card/50 border border-border/50',
        'transition-all duration-300',
        className
      )}
    >
      {title && (
        <div className="px-4 py-2 border-b border-border/50 bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
      )}

      <div
        role="img"
        aria-label={title ?? 'Diagram'}
        className="min-h-[300px] p-4 overflow-auto flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}
