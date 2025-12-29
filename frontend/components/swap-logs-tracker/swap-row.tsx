'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink, User } from 'lucide-react'
import { EXPLORER_URL } from '@/constants/common'
import { getSwapProviderConfig } from '@/constants/swap-provider-config'
import { formatTokenAmount } from '@/lib/amount'
import { formatTimeDisplay } from '@/lib/timestamp'
import { cn, shortenHex } from '@/lib/utils'
import type { SwapData } from '@/types/swap'

interface SwapRowProps {
  swap: SwapData
  showProvider?: boolean
}

export function SwapRow({ swap }: SwapRowProps) {
  const config = getSwapProviderConfig(swap.provider)

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 rounded-lg min-h-10',
        'bg-[#1a1a2e]/60 hover:bg-[#1a1a2e] transition-colors',
        'border border-transparent hover:border-[#2a2a4a]/50',
      )}
    >
      <div className="flex items-center gap-1 flex-1 min-w-0 flex-wrap sm:flex-nowrap">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-medium text-white tabular-nums">
            {formatTokenAmount(
              swap.amountIn,
              swap.tokenIn,
              swap.tokenInAddress,
            )}
          </span>
          <span className="text-xs text-zinc-500">{swap.tokenIn}</span>
        </div>
        <ArrowRight className="w-3 h-3 text-emerald-500 mx-1 shrink-0" />
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-medium text-white tabular-nums">
            {formatTokenAmount(
              swap.amountOut,
              swap.tokenOut,
              swap.tokenOutAddress,
            )}
          </span>
          <span className="text-xs text-zinc-500">{swap.tokenOut}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
        {config && (
          <div
            className="px-2.5 py-0.5 flex items-center justify-center rounded-full text-xs text-neutral-800 font-medium"
            style={{ backgroundColor: config.color }}
          >
            {config.name}
          </div>
        )}
        <span className="text-xs text-zinc-600">•</span>
        <a
          href={`${EXPLORER_URL}/address/${swap.sender}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors"
          title={`Sender: ${swap.sender}`}
        >
          <User className="w-3 h-3" />
          <span className="text-xs font-mono">{shortenHex(swap.sender)}</span>
        </a>
        <span className="text-xs text-zinc-600">•</span>
        <span className="text-xs text-zinc-500 tabular-nums">
          {formatTimeDisplay(swap.timestamp)}
        </span>
        <a
          href={`${EXPLORER_URL}/tx/${swap.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
          title="View transaction"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  )
}
