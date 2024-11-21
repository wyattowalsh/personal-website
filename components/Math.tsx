import React, { useMemo } from 'react';
import katex from 'katex';

interface MathProps {
  children?: string;
  display?: boolean;
  options?: katex.KatexOptions;
}

export default function Math({ 
  children = '', 
  display = false, 
  options = {} 
}: MathProps) {
  const Wrapper = display ? 'div' : 'span';

  if (typeof children !== 'string') {
    throw new Error('Children prop must be a katex string');
  }

  const renderedKatex = useMemo(() => {
    let result: string;

    try {
      result = katex.renderToString(children, {
        ...options,
        displayMode: display,
        throwOnError: true,
        globalGroup: true,
        trust: true,
        strict: false,
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      result = katex.renderToString(children, {
        ...options,
        displayMode: display,
        throwOnError: false,
        strict: 'ignore',
        globalGroup: true,
        trust: true,
      });
    }

    return result;
  }, [children, display, options]);

  return (
    <Wrapper 
      className={display ? 'katex-display' : 'katex-inline'} 
      dangerouslySetInnerHTML={{ __html: renderedKatex || '' }} 
    />
  );
}

