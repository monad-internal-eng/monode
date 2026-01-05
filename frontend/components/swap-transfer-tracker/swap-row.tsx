'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from '@/components/ui/external-link'
import { EXPLORER_URL } from '@/constants/common'
import { getSwapProviderConfig } from '@/constants/swap-provider-config'
import { formatTokenAmount } from '@/lib/amount'
import { formatTimeDisplay } from '@/lib/timestamp'
import { cn, shortenHex } from '@/lib/utils'
import type { SwapData } from '@/types/swap'
import { TokenBadge } from './token-badge'

interface SwapRowProps {
  swap: SwapData
  gridClass: string
}

export function SwapRow({ swap, gridClass }: SwapRowProps) {
  const config = getSwapProviderConfig(swap.provider)

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'py-3 items-center border-b border-zinc-800/50 hover:bg-tracker-row-hover transition-colors',
        gridClass,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-white tabular-nums">
          {formatTokenAmount(swap.amountIn, swap.tokenIn, swap.tokenInAddress)}
        </span>
        <TokenBadge symbol={swap.tokenIn} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-white tabular-nums">
          {formatTokenAmount(
            swap.amountOut,
            swap.tokenOut,
            swap.tokenOutAddress,
          )}
        </span>
        <TokenBadge symbol={swap.tokenOut} />
      </div>

      {config && (
        <span
          className="w-fit inline-flex items-center px-2 py-0.5 rounded text-xs font-mono"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
          {config.name}
        </span>
      )}
      {!config && <span />}

      <ExternalLink
        href={`${EXPLORER_URL}/address/${swap.sender}`}
        className="text-sm font-mono text-zinc-400 hover:text-white transition-colors truncate"
        title={swap.sender}
      >
        {shortenHex(swap.sender)}
      </ExternalLink>

      <span className="text-sm font-mono text-zinc-400 tabular-nums">
        {formatTimeDisplay(swap.timestamp)}
      </span>
    </motion.div>
  )
}
