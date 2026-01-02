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
