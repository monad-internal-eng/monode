'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from '@/components/ui/external-link'
import { EXPLORER_URL } from '@/constants/common'
import { formatTokenAmount } from '@/lib/amount'
import { formatTimeDisplay } from '@/lib/timestamp'
import { cn, shortenHex } from '@/lib/utils'
import type { TransferData } from '@/types/transfer'
import { TokenBadge } from './token-badge'

interface TransferRowProps {
  transfer: TransferData
  gridClass: string
}

export function TransferRow({ transfer, gridClass }: TransferRowProps) {
  const tokenSymbol = transfer.type === 'native' ? 'MON' : 'WMON'

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
      <ExternalLink
        href={`${EXPLORER_URL}/tx/${transfer.txHash}`}
        className="text-sm font-mono text-zinc-400 hover:text-white transition-colors truncate"
        title={transfer.txHash}
      >
        {shortenHex(transfer.txHash)}
      </ExternalLink>

      <ExternalLink
        href={`${EXPLORER_URL}/address/${transfer.from}`}
        className="text-sm font-mono text-zinc-400 hover:text-white transition-colors truncate"
        title={transfer.from}
      >
        {shortenHex(transfer.from)}
      </ExternalLink>

      <ExternalLink
        href={`${EXPLORER_URL}/address/${transfer.to}`}
        className="text-sm font-mono text-zinc-400 hover:text-white transition-colors truncate"
        title={transfer.to}
      >
        {shortenHex(transfer.to)}
      </ExternalLink>

      <span className="text-sm font-mono text-white tabular-nums">
        {formatTokenAmount(transfer.value, tokenSymbol)}
      </span>

      <TokenBadge symbol={tokenSymbol} />

      <span className="text-sm font-mono text-zinc-400 tabular-nums">
        {formatTimeDisplay(transfer.timestamp)}
      </span>
    </motion.div>
  )
}
