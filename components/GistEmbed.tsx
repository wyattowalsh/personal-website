'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface GistEmbedProps {
  /** Gist ID, e.g. "wyattowalsh/abc123" or a full URL */
  id: string
  /** Optional specific file within the gist */
  file?: string
}

export function GistEmbed({ id, file }: GistEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [height, setHeight] = useState(200)
  const { resolvedTheme } = useTheme()

  // Normalize id: if a full URL is passed, extract the path portion
  const gistPath = id.startsWith('http')
    ? id.replace(/^https?:\/\/gist\.github\.com\//, '')
    : id

  const fileParam = file ? `?file=${encodeURIComponent(file)}` : ''

  const isDark = resolvedTheme === 'dark'

  // Reset loading state when theme changes so the skeleton reappears
  useEffect(() => {
    setLoading(true)
    setError(false)
  }, [resolvedTheme])

  // Build the srcdoc HTML that loads the GitHub gist embed script
  const srcdoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <base target="_blank" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      background: transparent;
    }
    .gist .gist-file {
      border: none !important;
      margin-bottom: 0 !important;
    }
    .gist .gist-data {
      border-bottom: none !important;
      ${isDark ? `
      background-color: #161b22 !important;
      color: #c9d1d9 !important;
      ` : ''}
    }
    .gist .gist-meta {
      ${isDark ? `
      background-color: #0d1117 !important;
      color: #8b949e !important;
      ` : ''}
    }
    .gist .gist-meta a {
      ${isDark ? `color: #58a6ff !important;` : ''}
    }
    ${isDark ? `
    .gist .blob-code,
    .gist .blob-num {
      background-color: #161b22 !important;
      color: #c9d1d9 !important;
    }
    .gist .blob-num {
      color: #6e7681 !important;
    }
    .gist .gist-file {
      border-color: #30363d !important;
    }
    .gist .gist-data {
      border-color: #30363d !important;
    }
    .gist table {
      color: #c9d1d9 !important;
    }
    ` : ''}
  </style>
</head>
<body>
  <script src="https://gist.github.com/${gistPath}.js${fileParam}"></script>
  <script>
    // Notify parent of content height changes
    function notifyHeight() {
      var h = document.body.scrollHeight;
      window.parent.postMessage({ type: 'gist-resize', height: h }, '*');
    }
    // Poll briefly to catch async script load
    var attempts = 0;
    var interval = setInterval(function() {
      notifyHeight();
      attempts++;
      if (attempts > 20) clearInterval(interval);
    }, 200);
    // Also notify on load
    window.addEventListener('load', function() {
      setTimeout(notifyHeight, 100);
      window.parent.postMessage({ type: 'gist-loaded' }, '*');
    });
    // Detect load failure
    window.addEventListener('error', function() {
      window.parent.postMessage({ type: 'gist-error' }, '*');
    }, true);
    // Timeout fallback for error detection
    setTimeout(function() {
      if (!document.querySelector('.gist')) {
        window.parent.postMessage({ type: 'gist-error' }, '*');
      }
    }, 10000);
  </script>
</body>
</html>`

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.source !== iframeRef.current?.contentWindow) return
    if (!event.data || typeof event.data !== 'object') return

    if (event.data.type === 'gist-resize' && typeof event.data.height === 'number') {
      setHeight(event.data.height + 16) // small padding buffer
      setLoading(false)
    }
    if (event.data.type === 'gist-loaded') {
      setLoading(false)
    }
    if (event.data.type === 'gist-error') {
      setError(true)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  // Timeout fallback: if still loading after 15s, show error
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setError(true)
        setLoading(false)
      }
    }, 15000)
    return () => clearTimeout(timeout)
  }, [loading])

  if (error) {
    return (
      <div
        className={cn(
          'my-4 rounded-xl border border-border/50 p-6 text-center',
          'bg-muted/30 text-muted-foreground'
        )}
      >
        <p className="text-sm">
          Failed to load gist.{' '}
          <a
            href={`https://gist.github.com/${gistPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            View on GitHub
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="relative my-4">
      {loading && (
        <div
          className={cn(
            'rounded-xl border border-border/50',
            'bg-muted/30',
            'animate-pulse'
          )}
          style={{ height: 200 }}
        >
          <div className="flex h-full items-center justify-center">
            <div className="space-y-3 w-3/4">
              <div className="h-3 rounded bg-muted/60" />
              <div className="h-3 rounded bg-muted/60 w-5/6" />
              <div className="h-3 rounded bg-muted/60 w-4/6" />
              <div className="h-3 rounded bg-muted/60 w-3/6" />
            </div>
          </div>
        </div>
      )}
      <iframe
        key={resolvedTheme}
        ref={iframeRef}
        srcDoc={srcdoc}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        title={`GitHub Gist: ${gistPath}`}
        className={cn(
          'w-full border-0 rounded-xl overflow-hidden',
          'transition-opacity duration-300',
          loading ? 'opacity-0 absolute inset-0' : 'opacity-100'
        )}
        style={{ height }}
      />
    </div>
  )
}
