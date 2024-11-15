import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Add formatDate function
export function formatDate(date: string, locale: string = "en-US", options?: Intl.DateTimeFormatOptions): string {
    try {
        return new Date(date).toLocaleDateString(locale, options);
    } catch {
        return "Invalid date";
    }
}

// Add CoreContent type
export type CoreContent<T> = Omit<T, '_id' | '_raw' | 'body'>;

