'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink, User } from 'lucide-react'
import { formatUnits } from 'viem'
import { EXPLORER_URL } from '@/constants/common'
import {
  getDexConfigByProvider,
  getTokenDecimals,
} from '@/constants/dex-config'
import { cn } from '@/lib/utils'
import type { SwapData } from '@/types/swap'

interface SwapRowProps {
  swap: SwapData
  showProvider?: boolean
}

function formatTokenAmount(amount: string, token: string): string {
  const decimals = getTokenDecimals(token)
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

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function truncateAddress(address: string): string {
  if (address.length < 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function SwapRow({ swap, showProvider = false }: SwapRowProps) {
  const config = getDexConfigByProvider(swap.provider)

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'flex items-center justify-between gap-2 px-3 py-2 rounded-lg h-10',
        'bg-[#1a1a2e]/60 hover:bg-[#1a1a2e] transition-colors',
        'border border-transparent hover:border-[#2a2a4a]/50',
      )}
    >
      {showProvider && config && (
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: config.color }}
          title={config.name}
        />
      )}

      <div className="flex items-center gap-1 flex-1 min-w-0">
        <span className="text-sm font-medium text-white tabular-nums">
          {formatTokenAmount(swap.amountIn, swap.tokenIn)}
        </span>
        <span className="text-xs text-zinc-500">{swap.tokenIn}</span>
        <ArrowRight className="w-3 h-3 text-emerald-500 mx-1 shrink-0" />
        <span className="text-sm font-medium text-white tabular-nums">
          {formatTokenAmount(swap.amountOut, swap.tokenOut)}
        </span>
        <span className="text-xs text-zinc-500">{swap.tokenOut}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <a
          href={`${EXPLORER_URL}/address/${swap.sender}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors"
          title={`Sender: ${swap.sender}`}
        >
          <User className="w-3 h-3" />
          <span className="text-xs font-mono">
            {truncateAddress(swap.sender)}
          </span>
        </a>
        <span className="text-xs text-zinc-600">•</span>
        <span className="text-xs text-zinc-500 tabular-nums">
          {formatTime(swap.timestamp)}
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
