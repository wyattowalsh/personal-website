import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
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