import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Class name utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 