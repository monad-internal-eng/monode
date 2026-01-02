'use client'

import { Clock, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { SectionHeader } from '@/components/ui/section-header'
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
        <div className="bg-[#17151E] rounded-xl border border-[#201E29] p-5 w-full flex flex-col gap-4">
          <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm sm:text-base text-[#8888a0]">
                Average Execution Time
              </p>
              <p className="text-lg sm:text-xl font-medium text-[#8888a0]">
                <span className="text-3xl sm:text-5xl text-white font-bold">
                  {avgBlockExecutionTime.toFixed(0)}
                </span>{' '}
                ms
              </p>
            </div>
            <div className="bg-[#1D2727] p-2 sm:p-2 rounded-lg h-fit w-fit">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#25C373]" />
            </div>
          </div>
          <p className="text-sm sm:text-base text-[#8888a0]">
            Measured during execution, not inferred post-finalization.
          </p>
        </div>
        <div className="bg-[#17151E] rounded-xl border border-[#201E29] p-5 w-full flex flex-col gap-4">
          <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm sm:text-base text-[#8888a0]">
                Max Execution Time
              </p>
              <p className="text-lg sm:text-xl font-medium text-[#8888a0]">
                <span className="text-3xl sm:text-5xl text-white font-bold">
                  {maxBlockExecutionTime.toFixed(0)}
                </span>{' '}
                ms
              </p>
            </div>
            <div className="bg-[#2F2423] p-2 sm:p-2 rounded-lg h-fit w-fit">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#F39E26]" />
            </div>
          </div>
          <p className="text-sm sm:text-base text-[#8888a0]">
            Peak execution time observed in the current session.
          </p>
        </div>
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
