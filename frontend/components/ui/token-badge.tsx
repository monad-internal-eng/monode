'use client'

import { cn } from '@/lib/utils'

interface TokenBadgeProps {
  symbol: string
  className?: string
}

const TOKEN_COLORS: Record<string, { bg: string; text: string }> = {
  MON: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  WMON: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  // TODO: Remove the stablecoins if not needed
  USDC: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  AUSD: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
}

const DEFAULT_COLORS = { bg: 'bg-zinc-500/20', text: 'text-zinc-400' }

/**
 * Token badge component displaying token symbol with color coding
 */
export function TokenBadge({ symbol, className }: TokenBadgeProps) {
  const colors = TOKEN_COLORS[symbol.toUpperCase()] ?? DEFAULT_COLORS

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium',
        'border border-current/20',
        colors.bg,
        colors.text,
        className,
      )}
    >
      {symbol}
    </span>
  )
}
