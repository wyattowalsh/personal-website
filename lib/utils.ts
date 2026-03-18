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

/** Check if a URL is external (http/https, mailto, or tel) */
export function isExternal(url: string): boolean {
  return /^(https?:\/\/|mailto:|tel:)/i.test(url);
}

/** Compare two date strings and return true if they represent different calendar dates */
export function isDifferentDate(date1: string | undefined, date2: string | undefined): boolean {
  try {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1).toISOString();
    const d2 = new Date(date2).toISOString();
    return d1.split('T')[0] !== d2.split('T')[0];
  } catch {
    return false;
  }
}

/** Extract blog post slug from pathname */
export function extractPostSlug(pathname: string): string | null {
  const match = pathname.match(/\/blog\/posts\/([^/]+)/);
  return match?.[1] || null;
}