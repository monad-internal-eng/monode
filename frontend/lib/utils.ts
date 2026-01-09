import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { isAddress } from 'viem'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenHex(hex: string) {
  return `${hex.slice(0, 6)}...${hex.slice(-4)}`
}

/**
 * Returns addresses that are not valid EVM addresses.
 * Accepts any valid 0x-prefixed 40-character hex string (checksum not required).
 */
export function getInvalidAddresses(addresses: string[]): string[] {
  return addresses.filter((address) => !isAddress(address, { strict: false }))
}
