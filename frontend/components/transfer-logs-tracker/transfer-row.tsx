'use client'

import { motion } from 'framer-motion'
import { TokenBadge } from '@/components/ui/token-badge'
import { EXPLORER_URL } from '@/constants/common'
import { formatTokenAmount } from '@/lib/amount'
import { formatTimeDisplay } from '@/lib/timestamp'
import { shortenHex } from '@/lib/utils'
import type { TransferData } from '@/types/transfer'

interface TransferRowProps {
  transfer: TransferData
}

export function TransferRow({ transfer }: TransferRowProps) {
  const tokenSymbol = transfer.type === 'native' ? 'MON' : 'WMON'

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className="grid grid-cols-[1fr_1fr_1fr_100px_120px] gap-4 px-4 py-3 items-center border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
    >
      {/* From */}
      <a
        href={`${EXPLORER_URL}/address/${transfer.from}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-mono text-zinc-300 hover:text-white transition-colors truncate"
        title={transfer.from}
      >
        {shortenHex(transfer.from)}
      </a>

      {/* To */}
      <a
        href={`${EXPLORER_URL}/address/${transfer.to}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-mono text-zinc-300 hover:text-white transition-colors truncate"
        title={transfer.to}
      >
        {shortenHex(transfer.to)}
      </a>

      {/* Amount */}
      <span className="text-sm font-medium text-white tabular-nums">
        {formatTokenAmount(transfer.value, tokenSymbol)}
      </span>

      {/* Token */}
      <div>
        <TokenBadge symbol={tokenSymbol} />
      </div>

      {/* Time */}
      <span className="text-sm text-zinc-500 tabular-nums">
        {formatTimeDisplay(transfer.timestamp)}
      </span>
    </motion.div>
  )
}
