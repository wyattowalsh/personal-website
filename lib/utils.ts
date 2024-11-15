import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(
  dateString: string,
  locale = 'en-US',
  options?: Intl.DateTimeFormatOptions
) {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, options);
}

// Add CoreContent type
export type CoreContent<T> = Omit<T, '_id' | '_raw' | 'body'>;

