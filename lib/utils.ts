import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

// Class name utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strip JSX/MDX syntax from content for use in feeds and plain-text contexts.
 * Removes: import statements, export blocks, JSX components, JSX expressions.
 */
export function stripMdxSyntax(content: string): string {
  return content
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export\s+(const|default|function)\s+[\s\S]*?(?=\n\n|\n#|\n---)/gm, '')
    .replace(/<[A-Z][a-zA-Z0-9]*[\s\S]*?\/>/g, '')
    .replace(/<[A-Z][a-zA-Z0-9]*[\s\S]*?>[\s\S]*?<\/[A-Z][a-zA-Z0-9]*>/g, '')
    .replace(/<ArticleJsonLd[\s\S]*?\/>/g, '')
    .replace(/\{[\s\S]*?\}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Enhanced date formatting utilities
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '';

  const dateObj = isDate(date) ? date : new Date(date);

  if (!isDate(dateObj)) {
    console.warn('Invalid date provided to formatDate:', date);
    return '';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  try {
    return dateObj.toLocaleDateString('en-US', options || defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}