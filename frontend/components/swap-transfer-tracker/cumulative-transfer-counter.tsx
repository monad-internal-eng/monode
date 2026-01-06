'use client'

import { TrendingUp } from 'lucide-react'
import { formatUnits } from 'viem'
import { formatAmount } from '@/utils/ui'

interface CumulativeTransferCounterProps {
  cumulativeTransferred: bigint
}

export function CumulativeTransferCounter({
  cumulativeTransferred,
}: CumulativeTransferCounterProps) {
  const formattedAmount = formatUnits(cumulativeTransferred, 18)
  const amount = Number(formattedAmount)

  return (
    <div className="bg-tracker-bg rounded-xl border border-zinc-800 p-4 m-4">
      <div className="flex flex-row justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-sm text-zinc-400">Live MON + WMON Transferred</p>
          </div>
          <p className="text-4xl font-bold text-white tabular-nums">
            {formatAmount(amount)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Total value transferred since page load. Resets on refresh.
          </p>
        </div>
        <div className="bg-tracker-active/10 p-2 rounded-lg h-fit w-fit">
          <TrendingUp className="w-5 h-5 text-tracker-active" />
        </div>
      </div>
    </div>
  )
}
