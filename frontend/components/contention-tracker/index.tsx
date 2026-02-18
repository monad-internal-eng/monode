'use client'

import { SectionHeader } from '@/components/ui/section-header'
import { useContentionTracker } from '@/hooks/use-contention-tracker'
import { ContendedSlotsMap } from './contended-slots-map'
import { ContentionDisclaimer } from './contention-disclaimer'
import { ContentionStats } from './contention-stats'
import { ContentionTrendChart } from './contention-trend-chart'
import { ContractGraph } from './contract-graph'

/**
 * Main contention analytics dashboard.
 * Displays real-time state contention intelligence derived from
 * Monad's Execution Events SDK.
 */
export function ContentionTracker() {
  const {
    latestSnapshot,
    avgContentionRatio,
    avgParallelEfficiency,
    aggregatedContendedSlots,
    aggregatedContracts,
    aggregatedEdges,
    trendData,
  } = useContentionTracker()

  return (
    <div className="w-full flex flex-col gap-12">
      {/* Stats */}
      <div className="flex flex-col gap-2">
        <SectionHeader
          title="Contention Overview"
          description="Real-time state contention metrics inferred from storage access patterns."
        />
        <ContentionStats
          avgContentionRatio={avgContentionRatio}
          avgParallelEfficiency={avgParallelEfficiency}
          contendedSlotCount={
            latestSnapshot?.contended_slot_count ?? 0
          }
          totalTxnCount={latestSnapshot?.total_txn_count ?? 0}
        />
      </div>

      {/* Trend Chart */}
      <div className="flex flex-col gap-2">
        <SectionHeader
          title="Contention Trend"
          description="Storage contention ratio and parallel execution efficiency over time."
        />
        <div className="w-full py-3 px-5 md:py-6 md:px-10">
          <div className="rounded-xl border border-zinc-700 bg-black p-6 sm:p-10 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-xs text-zinc-400">
                  Contention Ratio
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                <span className="text-xs text-zinc-400">
                  Parallel Efficiency
                </span>
              </div>
            </div>
            <ContentionTrendChart data={trendData} />
          </div>
        </div>
      </div>

      {/* Contract Dependency Graph + Contended Slots */}
      <div className="flex flex-col lg:flex-row gap-0">
        {/* Contended Slots Map */}
        <div className="flex-1 lg:border-r lg:border-zinc-800">
          <ContendedSlotsMap slots={aggregatedContendedSlots} />
        </div>

        {/* Contract Dependency Graph */}
        <div className="flex-1 lg:border-l lg:border-zinc-800">
          <div className="flex flex-col">
            <div className="flex flex-col gap-4 p-6 lg:p-10 border-t border-b border-zinc-800">
              <h2 className="text-2xl lg:text-4xl font-medium font-britti-sans leading-8 lg:leading-10 text-white">
                Contract Dependencies
              </h2>
              <p className="text-sm lg:text-base font-normal leading-5 lg:leading-6 text-gray-400">
                Contracts co-accessed within the same transactions, revealing
                execution dependencies.
              </p>
            </div>
            <div className="px-4 py-4 lg:px-10 lg:py-6">
              <ContractGraph
                contracts={aggregatedContracts}
                edges={aggregatedEdges}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 md:px-10">
        <ContentionDisclaimer />
      </div>
    </div>
  )
}
