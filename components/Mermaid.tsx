"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Download,
  Move,
  MousePointer2
} from "lucide-react";

interface MermaidProps {
  chart: string;
  className?: string;
  title?: string;
}

interface Transform {
  scale: number;
  x: number;
  y: number;
}

export default function Mermaid({ chart, className, title }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Transform state for pan/zoom
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panMode, setPanMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Constants
  const MIN_SCALE = 0.25;
  const MAX_SCALE = 4;
  const ZOOM_STEP = 0.25;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render mermaid chart
  useEffect(() => {
    if (!mounted || !chart) return;

    const renderChart = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === "dark" ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "inherit",
          flowchart: {
            htmlLabels: true,
            curve: "basis",
          },
          themeVariables: resolvedTheme === "dark" ? {
            primaryColor: "#6366f1",
            primaryTextColor: "#f8fafc",
            primaryBorderColor: "#4f46e5",
            lineColor: "#64748b",
            secondaryColor: "#1e293b",
            tertiaryColor: "#0f172a",
            background: "#020617",
            mainBkg: "#1e293b",
            nodeBorder: "#4f46e5",
            clusterBkg: "#1e293b",
            clusterBorder: "#334155",
            titleColor: "#f8fafc",
            edgeLabelBackground: "#1e293b",
            noteTextColor: "#f8fafc",
            noteBkgColor: "#1e293b",
            noteBorderColor: "#4f46e5",
          } : {
            primaryColor: "#6366f1",
            primaryTextColor: "#1e293b",
            primaryBorderColor: "#4f46e5",
            lineColor: "#64748b",
            secondaryColor: "#f1f5f9",
            tertiaryColor: "#e2e8f0",
            background: "#ffffff",
            mainBkg: "#f8fafc",
            nodeBorder: "#6366f1",
            clusterBkg: "#f1f5f9",
            clusterBorder: "#cbd5e1",
            titleColor: "#1e293b",
            edgeLabelBackground: "#f8fafc",
            noteTextColor: "#1e293b",
            noteBkgColor: "#f1f5f9",
            noteBorderColor: "#6366f1",
          },
        });

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(err instanceof Error ? err.message : "Failed to render diagram");
      }
    };

    renderChart();
  }, [chart, resolvedTheme, mounted]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale + ZOOM_STEP, MAX_SCALE)
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(prev.scale - ZOOM_STEP, MIN_SCALE)
    }));
  }, []);

  const resetTransform = useCallback(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  const fitToContainer = useCallback(() => {
    if (!svgContainerRef.current || !containerRef.current) return;
    
    const svg = svgContainerRef.current.querySelector("svg");
    if (!svg) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    
    const scaleX = (containerRect.width - 80) / (svgRect.width / transform.scale);
    const scaleY = (containerRect.height - 80) / (svgRect.height / transform.scale);
    const newScale = Math.min(scaleX, scaleY, MAX_SCALE);
    
    setTransform({ scale: newScale, x: 0, y: 0 });
  }, [transform.scale]);

  // Mouse wheel zoom - use native event listener to properly prevent scroll
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = -e.deltaY * 0.001;

      setTransform(prev => {
        const newScale = Math.min(Math.max(prev.scale + delta, MIN_SCALE), MAX_SCALE);

        // Zoom toward mouse position
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scaleRatio = newScale / prev.scale;
        const newX = mouseX - (mouseX - prev.x) * scaleRatio;
        const newY = mouseY - (mouseY - prev.y) * scaleRatio;

        return { scale: newScale, x: newX, y: newY };
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    if (!panMode && !e.shiftKey) return; // Require pan mode or shift key
    
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [panMode, transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    
    setTransform(prev => ({
      ...prev,
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    }));
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: touch.clientX - transform.x, y: touch.clientY - transform.y });
    }
  }, [transform]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    setTransform(prev => ({
      ...prev,
      x: touch.clientX - panStart.x,
      y: touch.clientY - panStart.y
    }));
  }, [isPanning, panStart]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Download SVG
  const downloadSvg = useCallback(() => {
    if (!svg) return;
    
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "diagram"}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svg, title]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (document.fullscreenEnabled && containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      
      switch (e.key) {
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
        case "0":
          e.preventDefault();
          resetTransform();
          break;
        case "f":
          e.preventDefault();
          fitToContainer();
          break;
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen?.();
          }
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomIn, zoomOut, resetTransform, fitToContainer, isFullscreen]);

  if (!mounted) {
    return (
      <div className={cn(
        "my-6 rounded-xl overflow-hidden",
        "bg-muted/50 animate-pulse",
        "flex items-center justify-center",
        "min-h-[300px]",
        className
      )}>
        <span className="text-muted-foreground">Loading diagram...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "my-6 p-4 rounded-xl",
        "bg-destructive/10 border border-destructive/20",
        "text-destructive",
        className
      )}>
        <p className="font-medium">Failed to render diagram</p>
        <pre className="mt-2 text-sm opacity-70 overflow-auto">{error}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={cn(
        "my-6 rounded-xl overflow-hidden",
        "bg-card/50 border border-border/50",
        "transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        "group relative",
        isFullscreen && "fixed inset-0 z-50 m-0 rounded-none bg-background",
        className
      )}
    >
      {/* Title bar */}
      {title && (
        <div className="px-4 py-2 border-b border-border/50 bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className={cn(
        "absolute top-2 right-2 z-10",
        "flex items-center gap-1",
        "p-1 rounded-lg",
        "bg-background/80 backdrop-blur-sm border border-border/50",
        "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
        "transition-opacity duration-200",
        title && "top-12"
      )}>
        {/* Pan mode toggle */}
        <button
          onClick={() => setPanMode(!panMode)}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            "hover:bg-muted",
            panMode ? "bg-primary/20 text-primary" : "text-muted-foreground"
          )}
          title={panMode ? "Click to select (P)" : "Click to pan (P)"}
        >
          {panMode ? <Move className="w-4 h-4" /> : <MousePointer2 className="w-4 h-4" />}
        </button>

        <div className="w-px h-4 bg-border/50" />

        {/* Zoom controls */}
        <button
          onClick={zoomOut}
          disabled={transform.scale <= MIN_SCALE}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            "hover:bg-muted text-muted-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          title="Zoom out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <span className="text-xs font-mono text-muted-foreground min-w-[3rem] text-center">
          {Math.round(transform.scale * 100)}%
        </span>
        
        <button
          onClick={zoomIn}
          disabled={transform.scale >= MAX_SCALE}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            "hover:bg-muted text-muted-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          title="Zoom in (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border/50" />

        {/* Reset */}
        <button
          onClick={resetTransform}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            "hover:bg-muted text-muted-foreground"
          )}
          title="Reset view (0)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            "hover:bg-muted text-muted-foreground"
          )}
          title="Fullscreen (F)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Download */}
        <button
          onClick={downloadSvg}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            "hover:bg-muted text-muted-foreground"
          )}
          title="Download SVG"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom hint */}
      <div className={cn(
        "absolute bottom-2 left-2 z-10",
        "text-xs text-muted-foreground/60",
        "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-200",
        "pointer-events-none"
      )}>
        Scroll to zoom • {panMode ? "Click" : "Shift+click"} to pan
      </div>

      {/* SVG container */}
      <div
        ref={svgContainerRef}
        className={cn(
          "min-h-[300px] p-4 overflow-hidden",
          "flex items-center justify-center",
          panMode || isPanning ? "cursor-grab" : "cursor-default",
          isPanning && "cursor-grabbing",
          isFullscreen && "h-screen"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.1s ease-out",
          }}
          className="[&_svg]:max-w-none"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}
