import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (
  date: string,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    const utcDate = new Date(date + 'Z'); // Force UTC 
    
    // Default formatting options for consistent, beautiful dates
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    };

    // Merge with any custom options
    const dateFormatter = new Intl.DateTimeFormat(
      locale, 
      options || defaultOptions
    );

    return dateFormatter.format(utcDate);
  } catch {
    return "Invalid Date";
  }
};

// Add CoreContent type
export type CoreContent<T> = Omit<T, '_id' | '_raw' | 'body'>;

