"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import katex from 'katex';
import { cn } from "@/lib/utils";
import { Link, Copy, Check } from "lucide-react";
import { useMathContext } from "./MathContext";

export interface MathProps {  // Add export here
  children?: string;
  display?: boolean;
  options?: any;
  label?: string;
  number?: number;
}

export default function Math({ children = '', display = false, options = {}, label, number }: MathProps) {
  const [copied, setCopied] = useState(false);
  const [copiedEquation, setCopiedEquation] = useState(false);
  const mathRef = useRef<HTMLDivElement>(null);
  const { getNextNumber } = useMathContext();

  // Add logging for debugging
  useEffect(() => {
    console.debug('[Math] Rendering equation:', { display, label, number });
  }, [display, label, number]);

  // Get equation number only once using lazy initializer
  const [equationNumber] = useState(() => {
    if (!display) return undefined;
    if (label) return label;
    if (typeof number === 'number') return number;
    return getNextNumber();
  });

  const equationId = equationNumber;

  // Handle clicking equation number
  const handleEquationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const id = `eq-${equationId}`;
    
    // Update URL hash
    window.history.pushState({}, '', `#${id}`);
    
    // Scroll to equation
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.href.split('#')[0]}#eq-${equationId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEquation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(children);
    setCopiedEquation(true);
    setTimeout(() => setCopiedEquation(false), 2000);
  };

  const renderedKatex = useMemo(() => {
    // Ensure children is a string (remark-math may pass React children)
    const mathString = typeof children === 'string'
      ? children
      : String(children ?? '');

    if (!mathString) return '';

    try {
      return katex.renderToString(mathString, {
        displayMode: display,
        throwOnError: true,
        globalGroup: true,
        trust: true,
        strict: false,
        fleqn: false,
        ...options
      });
    } catch (error) {
      console.error('KaTeX error:', error);
      return katex.renderToString(mathString, {
        displayMode: display,
        throwOnError: false,
        strict: 'ignore',
        ...options
      });
    }
  }, [children, display, options]);

  useEffect(() => {
    if (mathRef.current && window.location.hash === `#eq-${equationId}`) {
      mathRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [equationId]);

  if (!display) {
    return (
      <span 
        className="math-inline"
        dangerouslySetInnerHTML={{ __html: renderedKatex }}
      />
    );
  }

  return (
    <div 
      ref={mathRef}
      id={`eq-${equationId}`}
      className={cn(
        "math-display group", // Add group here instead of in SCSS
        "relative my-8 px-8 py-6",
        "rounded-xl border border-math-border",
        "bg-math-bg/95 dark:bg-math-bg/80",
        "shadow-math hover:shadow-math-hover",
        "transition-all duration-300"
      )}
    >
      <div
        className="math-content"
        dangerouslySetInnerHTML={{ __html: renderedKatex }}
      />
      <div className="equation-controls">
        <button
          onClick={handleCopyEquation}
          className="copy-button"
          title="Copy equation"
          aria-label="Copy equation"
        >
          {copiedEquation ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={handleCopy}
          className="link-button"
          title="Copy link to equation"
          aria-label="Copy link to equation"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Link className="h-4 w-4" />
          )}
        </button>
      </div>
      {equationId && (
        <div 
          onClick={handleEquationClick}
          className="equation-number"
          title="Click to link to this equation"
          role="button"
          tabIndex={0}
        >
          ({equationId})
        </div>
      )}
    </div>
  );
}