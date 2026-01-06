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
  return new Intl.NumberFormat('en-US', {
    notation: 'standard',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatAmount(amount: number) {
  if (amount === 0) return '0'
  if (amount < 0.001) return '<0.001'
  if (amount < 1) return amount.toFixed(3)
  if (amount < 1000) return amount.toFixed(2)
  if (amount < 1_000_000) return `${(amount / 1000).toFixed(2)}K`
  if (amount < 1_000_000_000) return `${(amount / 1_000_000).toFixed(2)}M`
  return `${(amount / 1_000_000_000).toFixed(2)}B`
}
