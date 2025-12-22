import { formatUnits } from 'viem'
import { getTokenDecimals } from '@/constants/swap-provider-config'

export function formatTokenAmount(
  amount: string,
  tokenSymbol: string,
  tokenAddress?: string,
): string {
  // Use address for decimals lookup if available, fallback to symbol
  const decimals = getTokenDecimals(tokenAddress ?? tokenSymbol)
  const absAmount = amount.startsWith('-') ? amount.slice(1) : amount
  const formatted = formatUnits(BigInt(absAmount), decimals)
  const num = Number(formatted)

  if (num === 0) return '0'
  if (num < 0.001) return '<0.001'
  if (num < 1) return num.toFixed(3)
  if (num < 1000) return num.toFixed(2)
  if (num < 1_000_000) return `${(num / 1000).toFixed(2)}K`
  if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(2)}M`
  return `${(num / 1_000_000_000).toFixed(2)}B`
}
