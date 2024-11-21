import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatDate = (
  date: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    // Parse the date string as UTC
    const utcDate = new Date(date + 'T00:00:00Z');
    return new Intl.DateTimeFormat(locale, options).format(utcDate);
  } catch {
    return "Invalid Date";
  }
};

// Add CoreContent type
export type CoreContent<T> = Omit<T, '_id' | '_raw' | 'body'>;

