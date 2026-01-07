'use client'

import { Activity, Hash, TrendingUp } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { StatCard } from '@/components/ui/stat-card'
import { useTps } from '@/hooks/use-tps'
import { formatIntNumber } from '@/utils/ui'

/**
 * TPS Tracker component displaying real-time transactions per second on Monad
 */
export default function TpsTracker() {
  const { currentTps, peakTps, totalTransactions } = useTps()

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <SectionHeader
        title="Network Activity"
        description="Live throughput and transaction count from execution events."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Current TPS"
          value={formatIntNumber(currentTps)}
          description="Transactions per second right now"
          icon={Activity}
        />
        <StatCard
          label="Peak TPS"
          value={formatIntNumber(peakTps)}
          description="Highest TPS observed since page load"
          icon={TrendingUp}
          iconClassName="text-amber-400"
          iconBgClassName="bg-amber-400/10"
        />
        <StatCard
          label="Total Transactions"
          value={formatIntNumber(totalTransactions)}
          description="Transactions since page load"
          icon={Hash}
          iconClassName="text-blue-400"
          iconBgClassName="bg-blue-400/10"
        />
      </div>
    </div>
  )
}
