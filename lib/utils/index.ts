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
    const cleanDate = date.endsWith('Z') ? date : date + 'Z';
    const utcDate = new Date(cleanDate);
    if (isNaN(utcDate.getTime())) return "Invalid Date";
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    };

    return new Intl.DateTimeFormat(
      locale, 
      options || defaultOptions
    ).format(utcDate);
  } catch {
    return "Invalid Date";
  }
};
