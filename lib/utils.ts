import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Type guard utilities
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// Class name utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

// ISO date formatting
export function toISODate(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = isDate(date) ? date : new Date(date);
  
  if (!isDate(dateObj)) {
    console.warn('Invalid date provided to toISODate:', date);
    return '';
  }

  try {
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error converting to ISO date:', error);
    return '';
  }
}

// Relative time formatting
export function getRelativeTimeString(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = isDate(date) ? date : new Date(date);
  
  if (!isDate(dateObj)) {
    console.warn('Invalid date provided to getRelativeTimeString:', date);
    return '';
  }

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// String manipulation utilities
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();
}

export function truncate(text: string, length: number): string {
  if (!text || text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

// Type checking for common data structures
export function isNonEmptyArray<T>(arr: T[] | null | undefined): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

export function isNonEmptyString(str: unknown): str is string {
  return isString(str) && str.trim().length > 0;
}

// Error handling utility
export function handleError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(isString(error) ? error : 'An unknown error occurred');
}