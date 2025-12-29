'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink, User } from 'lucide-react'
import { EXPLORER_URL } from '@/constants/common'
import { getTransferTypeConfig } from '@/constants/transfer-config'
import { formatTokenAmount } from '@/lib/amount'
import { formatTimeDisplay } from '@/lib/timestamp'
import { cn, shortenHex } from '@/lib/utils'
import type { TransferData } from '@/types/transfer'

interface TransferRowProps {
  transfer: TransferData
}

export function TransferRow({ transfer }: TransferRowProps) {
  const config = getTransferTypeConfig(transfer.type)
  const tokenSymbol = transfer.type === 'native' ? 'MON' : 'WMON'

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
        <a
          href={`${EXPLORER_URL}/address/${transfer.from}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          title={`From: ${transfer.from}`}
        >
          <User className="w-3 h-3" />
          <span className="text-xs font-mono">{shortenHex(transfer.from)}</span>
        </a>
        <ArrowRight className="w-3 h-3 text-emerald-500 mx-1 shrink-0" />
        <a
          href={`${EXPLORER_URL}/address/${transfer.to}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          title={`To: ${transfer.to}`}
        >
          <User className="w-3 h-3" />
          <span className="text-xs font-mono">{shortenHex(transfer.to)}</span>
        </a>
        <span className="text-xs text-zinc-600 mx-1">•</span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-medium text-white tabular-nums">
            {formatTokenAmount(transfer.value, tokenSymbol)}
          </span>
          <span className="text-xs text-zinc-500">{tokenSymbol}</span>
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
        <span className="text-xs text-zinc-500 tabular-nums">
          {formatTimeDisplay(transfer.timestamp)}
        </span>
        <a
          href={`${EXPLORER_URL}/tx/${transfer.txHash}`}
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
