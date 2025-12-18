'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { getDexConfigByProvider } from '@/constants/dex-config'
import { cn } from '@/lib/utils'
import type { SwapData } from '@/types/swap'

interface SwapRowProps {
  swap: SwapData
  showProvider?: boolean
}

function formatAmount(amount: string): string {
  const num = Number(amount) / 1e18
  if (num === 0) return '0'
  if (Math.abs(num) < 0.0001) return '<0.0001'
  if (Math.abs(num) < 1) return num.toFixed(4)
  if (Math.abs(num) < 1000) return num.toFixed(2)
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function SwapRow({ swap, showProvider = false }: SwapRowProps) {
  const config = getDexConfigByProvider(swap.provider)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg',
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

      <div className="flex items-center gap-1.5 min-w-[120px]">
        <span className="text-sm font-medium text-white">
          {formatAmount(swap.amountIn)}
        </span>
        <span className="text-xs text-zinc-400">{swap.tokenIn}</span>
        <ArrowRight className="w-3 h-3 text-zinc-500 mx-1" />
        <span className="text-sm font-medium text-white">
          {formatAmount(swap.amountOut)}
        </span>
        <span className="text-xs text-zinc-400">{swap.tokenOut}</span>
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-xs text-zinc-500 truncate block">
          {formatAddress(swap.sender)}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-zinc-500">
          {formatTime(swap.timestamp)}
        </span>
        <a
          href={`${config?.explorerUrl}/block/${swap.blockNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
          title={`View block #${swap.blockNumber}`}
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  )
}
