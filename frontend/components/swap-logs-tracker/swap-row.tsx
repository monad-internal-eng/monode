'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { TokenBadge } from '@/components/ui/token-badge'
import { EXPLORER_URL } from '@/constants/common'
import { getSwapProviderConfig } from '@/constants/swap-provider-config'
import { formatTokenAmount } from '@/lib/amount'
import { formatTimeDisplay } from '@/lib/timestamp'
import { shortenHex } from '@/lib/utils'
import type { SwapData } from '@/types/swap'

interface SwapRowProps {
  swap: SwapData
}

export function SwapRow({ swap }: SwapRowProps) {
  const config = getSwapProviderConfig(swap.provider)

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className="grid grid-cols-[1fr_1fr_100px_100px_120px] gap-4 px-4 py-3 items-center border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
    >
      {/* From Token */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white tabular-nums">
          {formatTokenAmount(swap.amountIn, swap.tokenIn, swap.tokenInAddress)}
        </span>
        <TokenBadge symbol={swap.tokenIn} />
        <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
      </div>

      {/* To Token */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white tabular-nums">
          {formatTokenAmount(
            swap.amountOut,
            swap.tokenOut,
            swap.tokenOutAddress,
          )}
        </span>
        <TokenBadge symbol={swap.tokenOut} />
      </div>

      {/* Provider */}
      <div>
        {config && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: `${config.color}20`,
              color: config.color,
            }}
          >
            {config.name}
          </span>
        )}
      </div>

      {/* Sender */}
      <a
        href={`${EXPLORER_URL}/address/${swap.sender}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-mono text-zinc-400 hover:text-white transition-colors truncate"
        title={swap.sender}
      >
        {shortenHex(swap.sender)}
      </a>

      {/* Time */}
      <span className="text-sm text-zinc-500 tabular-nums">
        {formatTimeDisplay(swap.timestamp)}
      </span>
    </motion.div>
  )
}
