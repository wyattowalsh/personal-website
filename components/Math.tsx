"use client";

import { useMemo, useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Copy, Check, Hash } from "lucide-react";
import katex from 'katex';

let globalEquationCounter = 1;

interface MathProps {
  children: string;
  options?: katex.KatexOptions;
  className?: string;
}

export function Math({ children = '', display = false, options }) {
  const [equationNumber, setEquationNumber] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const Wrapper = display ? 'div' : 'span';

  useEffect(() => {
    if (display) {
      setEquationNumber(globalEquationCounter++);
    }
  }, [display]);

  if (typeof children !== 'string') {
    throw new Error('Children prop must be a katex string');
  }

  const renderedKatex = useMemo(() => {
    let result;
    const cleanMath = children.trim().replace(/^\$\$(.*)\$\$$/s, '$1');

    try {
      result = katex.renderToString(cleanMath, {
        ...options,
        displayMode: display,
        throwOnError: true,
        globalGroup: true,
        trust: true,
        strict: false,
      });
    } catch (error) {
      console.error(error);
      result = katex.renderToString(cleanMath, {
        ...options,
        displayMode: display,
        throwOnError: false,
        strict: 'ignore',
        globalGroup: true,
        trust: true,
      });
    }

    return result;
  }, [children, options, display]);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!display) {
    return (
      <Wrapper 
        className={cn(
          "math-inline relative group",
          "px-2 py-0.5 rounded-md",
          "bg-math-bg/40 dark:bg-math-bg/20",
          "border border-math-border/30",
          "transition-all duration-300",
          "hover:bg-math-bg/60 dark:hover:bg-math-bg/40",
          "hover:border-math-border/50",
          "hover:shadow-sm dark:hover:shadow-primary/5",
        )}
        dangerouslySetInnerHTML={{ __html: renderedKatex || '' }}
      />
    );
  }

  return (
    <div className={cn(
      "math-display not-prose group",
      "relative w-full my-8",
      "transition-all duration-300",
    )}>
      {/* Backdrop blur effect */}
      <div className={cn(
        "absolute inset-0",
        "bg-math-bg/30 dark:bg-math-bg/10",
        "backdrop-blur-[1px]",
        "rounded-xl",
        "transition-opacity duration-300",
        "opacity-0 group-hover:opacity-100"
      )} />

      {/* Main equation container */}
      <Wrapper
        id={`equation-${equationNumber}`}
        className={cn(
          "relative z-10",
          "px-8 py-6",
          "rounded-xl border border-math-border",
          "bg-math-bg/95 dark:bg-math-bg/80",
          "shadow-math hover:shadow-math-hover",
          "transition-all duration-300",
          "group-hover:border-primary/30",
          // Scrollbar styling
          "overflow-x-auto overflow-y-hidden",
          "scrollbar-thin scrollbar-track-transparent",
          "scrollbar-thumb-math-controls-text/20",
          "hover:scrollbar-thumb-math-controls-text/30"
        )}
        dangerouslySetInnerHTML={{ __html: renderedKatex || '' }}
      />

      {/* Equation number badge */}
      <a
        href={`#equation-${equationNumber}`}
        className={cn(
          "absolute -left-10 top-1/2 -translate-y-1/2",
          "flex items-center gap-1.5",
          "px-3 py-1.5 rounded-full",
          "bg-math-controls-bg/95 dark:bg-math-controls-bg/90",
          "text-math-controls-text",
          "border border-math-border",
          "text-xs font-medium",
          "shadow-sm",
          "backdrop-blur-sm",
          "transition-all duration-300",
          "opacity-100 translate-x-0"
        )}
      >
        <Hash className="h-3.5 w-3.5" />
        <span>{equationNumber}</span>
      </a>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={cn(
          "absolute -top-3 -right-3 z-20",
          "flex items-center gap-2",
          "px-3 py-1.5 rounded-full",
          "bg-math-controls-bg/95 dark:bg-math-controls-bg/90",
          "text-math-controls-text hover:text-math-controls-text-hover",
          "border border-math-border",
          "text-xs font-medium",
          "shadow-sm hover:shadow-md",
          "backdrop-blur-sm",
          "transition-all duration-300",
          "opacity-0 scale-95",
          "group-hover:opacity-100 group-hover:scale-100",
          "hover:scale-105"
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
}

export default Math;