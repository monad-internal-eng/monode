import { formatUnits } from 'viem'
import { getTokenDecimals } from '@/constants/swap-provider-config'

const intNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatBlockNumber(num: number): string {
  const str = num.toString()
  if (str.length <= 9) {
    return `#${num.toLocaleString()}`
  }
  const firstPart = str.slice(0, 4)
  const lastPart = str.slice(-4)
  return `#${Number(firstPart).toLocaleString()}...${lastPart}`
}

export function formatIntNumber(num: number): string {
  return intNumberFormatter.format(num)
}

export function formatAmount(amount: number) {
  if (amount === 0) return '0'
  if (amount < 0.001) return '<0.001'
  if (amount < 1) return amount.toFixed(3)
  return compactNumberFormatter.format(amount)
}

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

  return formatAmount(num)
}
