"use client";

import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { EquationContext } from "@/components/PostLayout";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathProps {
  children: string;
}

export default function Math({ children }: MathProps) {
  const [copied, setCopied] = useState(false);
  const hasInitialized = useRef(false);
  const [equationNumber, setEquationNumber] = useState<number>();
  
  // Detect display mode based on content with more robust checks
  const display = useMemo(() => {
    const content = children.trim();
    // Check for all possible display mode delimiters with proper matching
    return (
      (content.startsWith('\\[') && content.endsWith('\\]')) ||
      (content.startsWith('$$') && content.endsWith('$$')) ||
      (content.startsWith('\\begin{equation}') && content.endsWith('\\end{equation}'))
    );
  }, [children]);

  // Clean math content with proper delimiter handling
  const cleanMathContent = useMemo(() => {
    let content = children.trim();
    if (display) {
      if (content.startsWith('$$') && content.endsWith('$$')) {
        content = content.slice(2, -2);
      } else if (content.startsWith('\\[') && content.endsWith('\\]')) {
        content = content.slice(2, -2);
      } else if (content.startsWith('\\begin{equation}') && content.endsWith('\\end{equation}')) {
        content = content.slice(16, -14);
      }
    }
    return content.trim();
  }, [children, display]);

  // Render LaTeX
  const renderedMath = useMemo(() => {
    try {
      return katex.renderToString(cleanMathContent, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        trust: true,
        globalGroup: true,
      });
    } catch (error) {
      console.error("KaTeX rendering error:", error);
      return `<span class="text-red-500">Error rendering equation</span>`;
    }
  }, [cleanMathContent, display]);

  const { increment } = useContext(EquationContext);

  useEffect(() => {
    if (!hasInitialized.current && display) {
      const num = increment();
      setEquationNumber(num);
      hasInitialized.current = true;
    }
  }, [display, increment]);

  const equationId = equationNumber ? `equation-${equationNumber}` : undefined;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy equation:", error);
    }
  };

  return (
    <div
      id={equationId}
      className={cn(
        "group relative",
        display ? [
          "my-8 w-full",
          "flex items-center justify-center gap-4", // Center the display math
          "p-6 rounded-xl overflow-visible",
          "bg-math-bg border border-math-border",
          "shadow-math hover:shadow-math-hover",
          "transition-all duration-300",
        ] : [
          "inline-flex items-center",
          "px-2 py-1 mx-0.5",
          "bg-math-inline rounded-md",
        ],
        "print:!bg-transparent print:!border-none print:!shadow-none"
      )}
    >
      {display && equationNumber && (
        <div className="flex-none w-12 text-left">
          <a
            href={`#${equationId}`}
            className="text-sm font-mono text-math-controls-text hover:text-math-controls-text-hover transition-colors"
            title={`Equation ${equationNumber}`}
          >
            ({equationNumber})
          </a>
        </div>
      )}

      <div 
        className={cn(
          "katex-container",
          display ? [
            "flex-grow",
            "flex justify-center items-center",
            "mx-auto",
            "text-center"
          ] : "inline-flex"
        )}
        dangerouslySetInnerHTML={{ __html: renderedMath }}
      />

      {display && (
        <div className="flex-none w-12 text-right">
          <button
            onClick={handleCopy}
            className={cn(
              "p-2 rounded-lg",
              "bg-math-controls-bg hover:bg-math-controls-hover",
              "text-math-controls-text hover:text-math-controls-text-hover",
              "transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
            )}
            title={copied ? "Copied!" : "Copy equation"}
            aria-label="Copy equation"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
