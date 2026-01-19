'use client'

import { ExternalLink } from '@/components/ui/external-link'
import { EXPLORER_URL } from '@/constants/common'
import { getSwapProviderConfig } from '@/constants/swap-provider-config'
import { formatTimeDisplay } from '@/lib/timestamp'
import { formatTokenAmount } from '@/lib/ui'
import { cn, shortenHex } from '@/lib/utils'
import type { SwapData } from '@/types/swap'
import { TokenIcon } from './token-icon'

interface SwapRowProps {
  swap: SwapData
  gridClass: string
}

export function SwapRow({ swap, gridClass }: SwapRowProps) {
  const config = getSwapProviderConfig(swap.provider)

  return (
    <div
      className={cn(
        'h-14 border-b hover:bg-tracker-row-hover transition-colors',
        gridClass,
      )}
    >
      <ExternalLink
        href={`${EXPLORER_URL}/tx/${swap.txHash}`}
        className="w-32 text-sm transition-colors truncate"
        title={swap.txHash}
      >
        {shortenHex(swap.txHash)}
      </ExternalLink>

      <span className="w-28 flex items-center justify-end gap-1.5 text-sm tabular-nums">
        {formatTokenAmount(swap.amountIn, swap.tokenIn, swap.tokenInAddress)}
        <TokenIcon address={swap.tokenInAddress} size={16} />
      </span>

      <span className="w-28 flex items-center justify-end gap-1.5 text-sm tabular-nums">
        {formatTokenAmount(swap.amountOut, swap.tokenOut, swap.tokenOutAddress)}
        <TokenIcon address={swap.tokenOutAddress} size={16} />
      </span>

      <span className="w-32">
        {config && (
          <span
            className="inline-flex items-center text-sm"
            style={{
              backgroundColor: `${config.color}20`,
              color: config.color,
            }}
          >
            {config.name}
          </span>
        )}
      </span>

      <ExternalLink
        href={`${EXPLORER_URL}/address/${swap.sender}`}
        className="w-32 text-sm transition-colors truncate"
        title={swap.sender}
      >
        {shortenHex(swap.sender)}
      </ExternalLink>

      <span className="w-24 text-sm tabular-nums">
        {formatTimeDisplay(swap.timestamp)}
      </span>
    </div>
  )
}
