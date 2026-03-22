"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Maximize2, Minimize2, ExternalLink } from 'lucide-react';

interface PlaygroundProps {
  src: string;
  type?: 'stackblitz' | 'codesandbox' | 'generic';
  title?: string;
  height?: string;
}

// Auto-detect type from URL
function detectType(src: string): 'stackblitz' | 'codesandbox' | 'generic' {
  if (src.includes('stackblitz.com')) return 'stackblitz';
  if (src.includes('codesandbox.io')) return 'codesandbox';
  return 'generic';
}

export default function Playground({
  src,
  type,
  title = 'Interactive Playground',
  height = '500px',
}: PlaygroundProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const resolvedType = type || detectType(src);

  useEffect(() => {
    if (!isFullscreen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullscreen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [isFullscreen]);

  // Service icons/labels
  const serviceLabel = {
    stackblitz: 'StackBlitz',
    codesandbox: 'CodeSandbox',
    generic: 'Playground',
  }[resolvedType];

  return (
    <div className={cn(
      "my-8 rounded-xl overflow-hidden",
      "border border-border/50",
      "bg-card/30",
      isFullscreen && "fixed inset-4 z-50 my-0 rounded-2xl shadow-2xl"
    )}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border/30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{serviceLabel}</span>
          <span className="text-xs text-muted-foreground/60">·</span>
          <span className="text-sm font-medium truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <a href={src} target="_blank" rel="noopener noreferrer"
             className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="flex items-center justify-center bg-muted/20" style={{ height }}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary" />
            <span className="text-sm">Loading {serviceLabel}...</span>
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        src={src}
        title={title}
        className={cn("w-full border-0", !isLoaded && "hidden")}
        style={{ height: isFullscreen ? 'calc(100vh - 8rem)' : height }}
        loading="lazy"
        sandbox="allow-scripts allow-popups allow-forms"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
