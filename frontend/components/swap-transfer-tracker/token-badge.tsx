export function TokenBadge({ symbol }: { symbol: string }) {
  return (
    <span className="w-fit inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-mono text-white bg-tracker-badge-bg">
      {symbol}
    </span>
  )
}
