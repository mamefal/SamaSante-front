import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Toujours logger en développement
export const devLog = (...args: any[]) => console.log(...args)
export const devError = (...args: any[]) => console.error(...args)
