'use client'

import { TrendingUp } from 'lucide-react'
import { formatUnits } from 'viem'
import { formatAmount } from '@/lib/ui'

interface CumulativeTransferCounterProps {
  cumulativeTransferred: bigint
}

export function CumulativeTransferCounter({
  cumulativeTransferred,
}: CumulativeTransferCounterProps) {
  const formattedAmount = formatUnits(cumulativeTransferred, 18)
  const amount = Number(formattedAmount)

  return (
    <div className="bg-[#18181B] mt-6 mb-8 mx-4 sm:mx-6 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-stretch sm:justify-between gap-4 sm:gap-14">
      <div className="flex flex-col gap-1 gap-2 lg:gap-4">
        <span className="font-inter text-sm sm:text-base font-normal leading-normal text-text-secondary">
          Live MON + WMON Transferred
        </span>
        <span className="font-britti-sans text-4xl sm:text-5xl md:text-6xl font-medium leading-none tracking-tight">
          {formatAmount(amount)}
        </span>
      </div>
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 sm:w-2/5">
        <TrendingUp className="text-secondary size-10 sm:size-12 md:size-14" />
        <span className="text-xs sm:text-sm text-muted-dark sm:text-right">
          Total value transferred since page load. Resets on refresh.
        </span>
      </div>
    </div>
  )
}
