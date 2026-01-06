'use client'

import { Clock, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { SectionHeader } from '@/components/ui/section-header'
import { StatCard } from '@/components/ui/stat-card'
import { useBlockTracker } from '@/hooks/use-block-tracker'
import { fromNsToMsPrecise } from '@/lib/block-metrics'
import BlockTime from './block-time'
import BlockTimeLegend from './block-time-legend'

const MAX_BLOCKS_TO_SHOW = 20

// =============================================================================
// Main Component
// =============================================================================

/**
 * Block Time Tracker visualizes block and transaction execution times in real-time.
 *
 * Uses the Execution Events SDK to receive real-time block lifecycle events
 * and calculates execution timing metrics for visualization.
 */
export default function BlockTimeExecutionTracker() {
  const { finalizedBlocks, maxBlockExecutionTime } =
    useBlockTracker(MAX_BLOCKS_TO_SHOW)

  const avgBlockExecutionTime = useMemo(() => {
    if (finalizedBlocks.length === 0) {
      return 0
    }

    const totalBlockExecutionTime = finalizedBlocks.reduce(
      (sum, block) => sum + (block.executionTime ?? BigInt(0)),
      BigInt(0),
    )

    return Math.round(
      fromNsToMsPrecise(totalBlockExecutionTime) / finalizedBlocks.length,
    )
  }, [finalizedBlocks])

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* Block Statistics */}
      <SectionHeader
        title="Execution Block Time"
        description="Execution time observed directly from execution events."
      />
      <div className="flex flex-col md:flex-row gap-4">
        <StatCard
          label="Average Execution Time"
          value={avgBlockExecutionTime.toFixed(0)}
          unit="ms"
          description="Measured during execution, not inferred post-finalization."
          icon={Clock}
          iconClassName="text-[#25C373]"
          iconBgClassName="bg-[#1D2727]"
        />
        <StatCard
          label="Max Execution Time"
          value={maxBlockExecutionTime.toFixed(0)}
          unit="ms"
          description="Peak execution time observed in the current session."
          icon={TrendingUp}
          iconClassName="text-[#F39E26]"
          iconBgClassName="bg-[#2F2423]"
        />
      </div>

      {/* Horizontal Scroll Container with Block Bars */}
      <SectionHeader
        title="Block Execution Timeline"
        description="Each bar represents a block. Height shows total execution time."
      />
      <div className="w-full flex flex-col gap-5 bg-[#17151E] rounded-xl border border-[#201E29] p-4 sm:p-6 lg:p-8">
        {/* Scrollable Blocks Container */}
        <div className="flex gap-2 sm:gap-4 p-4 sm:p-6 lg:p-8 overflow-x-auto max-w-full scrollbar-none flex-1">
          {finalizedBlocks.map((block) => (
            <BlockTime
              key={block.id}
              block={block}
              maxBlockExecutionTime={maxBlockExecutionTime}
            />
          ))}
        </div>

        {/* Seperator */}
        <div className="w-full h-0.5 bg-[#2C2735]" />

        {/* Legend */}
        <BlockTimeLegend />
      </div>
    </div>
  )
}
