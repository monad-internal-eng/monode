'use client'

import { zeroAddress } from 'viem'
import { ExternalLink } from '@/components/ui/external-link'
import { EXPLORER_URL } from '@/constants/common'
import { WMON_ADDRESS } from '@/constants/transfer-config'
import { formatTimeDisplay } from '@/lib/timestamp'
import { formatTokenAmount } from '@/lib/ui'
import { cn, shortenHex } from '@/lib/utils'
import type { TransferData } from '@/types/transfer'
import { TokenIcon } from './token-icon'

interface TransferRowProps {
  transfer: TransferData
  gridClass: string
}

export function TransferRow({ transfer, gridClass }: TransferRowProps) {
  const tokenSymbol = transfer.type === 'native' ? 'MON' : 'WMON'
  const tokenAddress = transfer.type === 'native' ? zeroAddress : WMON_ADDRESS

  return (
    <div
      className={cn(
        'h-14 border-b hover:bg-tracker-row-hover transition-colors',
        gridClass,
      )}
    >
      <ExternalLink
        href={`${EXPLORER_URL}/tx/${transfer.txHash}`}
        className="w-32 text-sm transition-colors truncate"
        title={transfer.txHash}
      >
        {shortenHex(transfer.txHash)}
      </ExternalLink>

      <ExternalLink
        href={`${EXPLORER_URL}/address/${transfer.from}`}
        className="w-32 text-sm transition-colors truncate"
        title={transfer.from}
      >
        {shortenHex(transfer.from)}
      </ExternalLink>

      <ExternalLink
        href={`${EXPLORER_URL}/address/${transfer.to}`}
        className="w-32 text-sm transition-colors truncate"
        title={transfer.to}
      >
        {shortenHex(transfer.to)}
      </ExternalLink>

      <span className="w-24 flex items-center justify-end gap-1.5 text-sm tabular-nums">
        {formatTokenAmount(transfer.value, tokenSymbol, tokenAddress)}
        <TokenIcon address={tokenAddress} size={16} />
      </span>

      <span className="w-24 text-sm tabular-nums">
        {formatTimeDisplay(transfer.timestamp)}
      </span>
    </div>
  )
}
