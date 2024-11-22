"use client";

import React, { useContext, useEffect, useRef } from "react";
import { EquationContext } from "@/components/PostLayout";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathProps {
  children: string;
}

export default function Math({ children }: MathProps) {
  const hasInitialized = useRef(false);
  const mathRef = useRef<HTMLDivElement>(null);
  const { increment } = useContext(EquationContext);

  // Detect display mode
  const content = children.trim();
  const display = content.startsWith('$$') && content.endsWith('$$');
  const mathContent = display ? content.slice(2, -2).trim() : content;

  useEffect(() => {
    if (mathRef.current) {
      try {
        katex.render(mathContent, mathRef.current, {
          displayMode: display,
          throwOnError: false,
          strict: false,
          trust: true,
        });

        // Handle equation numbering
        if (display && !hasInitialized.current) {
          const num = increment();
          const element = mathRef.current;
          element.id = `equation-${num}`;
          hasInitialized.current = true;
        }
      } catch (error) {
        console.error("KaTeX rendering error:", error);
        mathRef.current.innerHTML = `<span class="text-red-500">Error rendering equation</span>`;
      }
    }
  }, [mathContent, display, increment]);

  return (
    <div 
      ref={mathRef}
      className={display ? "my-8 overflow-x-auto not-prose" : "inline-block not-prose"}
    />
  );
}
