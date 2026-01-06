'use client'

import { TrendingUp } from 'lucide-react'
import { formatUnits } from 'viem'
import { StatCard } from '@/components/ui/stat-card'
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
    <section className="m-4">
      <StatCard
        label="Live MON + WMON Transferred"
        value={formatAmount(amount)}
        description="Total value transferred since page load. Resets on refresh."
        icon={TrendingUp}
      />
    </section>
  )
}
