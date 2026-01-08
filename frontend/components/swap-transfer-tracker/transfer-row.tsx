'use client'

import { ExternalLink } from '@/components/ui/external-link'
import { EXPLORER_URL } from '@/constants/common'
import { formatTimeDisplay } from '@/lib/timestamp'
import { formatTokenAmount } from '@/lib/ui'
import { cn, shortenHex } from '@/lib/utils'
import type { TransferData } from '@/types/transfer'
import { TokenBadge } from './token-badge'

interface TransferRowProps {
  transfer: TransferData
  gridClass: string
}

export default function TransferRow({ transfer, gridClass }: TransferRowProps) {
  const tokenSymbol = transfer.type === 'native' ? 'MON' : 'WMON'

  return (
    <div
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
    </div>
  )
}
