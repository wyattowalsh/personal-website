import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (
  date: string | undefined,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    if (!date) return "Invalid Date";
    // Remove any trailing Z if it exists and force UTC
    const cleanDate = date.endsWith('Z') ? date : date + 'Z';
    const utcDate = new Date(cleanDate);
    if (isNaN(utcDate.getTime())) return "Invalid Date";
    
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

