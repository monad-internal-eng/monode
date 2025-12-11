import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenHex(hex: string) {
  return `${hex.slice(0, 6)}...${hex.slice(-4)}`
}
