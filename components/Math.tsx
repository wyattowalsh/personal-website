"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import katex from 'katex';
import { cn } from "@/lib/utils";
import { Link, Copy } from "lucide-react";
import { useMathContext } from "./MathContext";

interface MathProps {
  children?: string;
  display?: boolean;
  options?: any;
  label?: string;
  number?: number;
}

export default function Math({ children = '', display = false, options = {}, label, number }: MathProps) {
  const [copied, setCopied] = useState(false);
  const mathRef = useRef<HTMLDivElement>(null);
  const { getNextNumber } = useMathContext();
  const numberRef = useRef<number | null>(null);
  
  // Get equation number only once and store it in ref
  const equationId = useMemo(() => {
    if (!display) return undefined;
    if (label) return label;
    if (typeof number === 'number') return number;
    if (numberRef.current === null) {
      numberRef.current = getNextNumber();
    }
    return numberRef.current;
  }, [display, label, number, getNextNumber]);

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

  const renderedKatex = useMemo(() => {
    const cleanMath = children.trim().replace(/^\$\$(.*)\$\$$/s, '$1');
    try {
      return katex.renderToString(cleanMath, {
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
      return katex.renderToString(cleanMath, {
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
      className="math-display group relative"
    >
      <div
        className="math-content"
        dangerouslySetInnerHTML={{ __html: renderedKatex }}
      />
      {equationId && (
        <>
          <button
            onClick={handleCopy}
            className="equation-link"
            title="Copy link to equation"
          >
            {copied ? <Copy className="h-4 w-4" /> : <Link className="h-4 w-4" />}
          </button>
          <button
            onClick={handleEquationClick}
            className="equation-number"
            title="Click to link to this equation"
          >
            ({equationId})
          </button>
        </>
      )}
    </div>
  );
}