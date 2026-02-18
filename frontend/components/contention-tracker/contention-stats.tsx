'use client'

import { Activity, Layers, Zap } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'

interface ContentionStatsProps {
  avgContentionRatio: number
  avgParallelEfficiency: number
  contendedSlotCount: number
  totalTxnCount: number
}

/**
 * Displays key contention metrics as stat cards.
 */
export function ContentionStats({
  avgContentionRatio,
  avgParallelEfficiency,
  contendedSlotCount,
  totalTxnCount,
}: ContentionStatsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 px-6 md:px-10 py-6">
      <StatCard
        label="Storage Contention"
        value={(avgContentionRatio * 100).toFixed(1)}
        unit="%"
        description="Percentage of storage slots accessed by multiple transactions in the same block."
        icon={Layers}
      />
      <StatCard
        label="Parallel Efficiency"
        value={avgParallelEfficiency.toFixed(1)}
        unit="%"
        description="Time saved through parallel execution relative to sequential processing."
        icon={Zap}
      />
      <StatCard
        label="Contended Slots"
        value={contendedSlotCount}
        description="Storage slots with concurrent access in the latest block."
        icon={Activity}
      />
    </div>
  )
}
