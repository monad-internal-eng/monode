export function formatBlockNumber(num: number): string {
  const str = num.toString()
  if (str.length <= 9) {
    return `#${num.toLocaleString()}`
  }
  const firstPart = str.slice(0, 4)
  const lastPart = str.slice(-4)
  return `#${Number(firstPart).toLocaleString()}...${lastPart}`
}
