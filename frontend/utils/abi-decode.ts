/**
 * ABI decoding utilities for parsing EVM log data
 */

/**
 * Parse signed int256 from 64-char hex string (two's complement, 256 bits)
 * Used for both int256 and int128 (which are sign-extended to 256 bits in ABI)
 */
export function parseSignedInt256(hex: string): bigint {
  const value = BigInt(`0x${hex}`)
  const MAX_INT256 = BigInt(2) ** BigInt(255)
  const MAX_UINT256 = BigInt(2) ** BigInt(256)
  return value >= MAX_INT256 ? value - MAX_UINT256 : value
}

/**
 * Parse unsigned int from hex string
 */
export function parseUint(hex: string): bigint {
  return BigInt(`0x${hex}`)
}

/**
 * Parse address from 64-char hex string (last 40 chars)
 */
export function parseAddress(hex: string): string {
  return `0x${hex.slice(-40)}`
}

/**
 * Parse bytes32 packed amounts for LFJ (Trader Joe LBPair)
 * bytes32 layout: [amountY (128 bits) | amountX (128 bits)]
 * Returns [amountX, amountY] as the X is in lower bits
 */
export function parseLFJPackedAmounts(hex: string): [bigint, bigint] {
  // hex is 64 chars = 256 bits = 32 bytes
  // Upper 128 bits (first 32 hex chars) = amountY
  // Lower 128 bits (last 32 hex chars) = amountX
  const amountY = BigInt(`0x${hex.slice(0, 32)}`)
  const amountX = BigInt(`0x${hex.slice(32, 64)}`)
  return [amountX, amountY]
}

/**
 * Parse concatenated topics string into array of individual topics.
 * Topics come as a single hex string where each topic is 32 bytes (64 hex chars).
 */
export function parseTopicsString(topicsStr: string | string[]): string[] {
  if (Array.isArray(topicsStr)) return topicsStr

  const clean = topicsStr.startsWith('0x') ? topicsStr.slice(2) : topicsStr

  const topics: string[] = []
  for (let i = 0; i < clean.length; i += 64) {
    topics.push(`0x${clean.slice(i, i + 64)}`)
  }

  return topics
}

/**
 * Clean hex data string by removing 0x prefix
 */
export function cleanHexData(data: string): string {
  return data.startsWith('0x') ? data.slice(2) : data
}
