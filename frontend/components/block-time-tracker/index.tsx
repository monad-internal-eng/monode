'use client'

import { useMemo } from 'react'
import { useBlockTracker } from '@/hooks/use-block-tracker'
import { fromNsToMsPrecise } from '@/lib/block-metrics'
import BlockTime from './block-time'
import BlockTimeLegend from './block-time-legend'
import BlockTimeTrackerDescription from './block-time-tracker-description'

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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Execution Block Time Tracker
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[#8888a0]">
              Live Events (only last {MAX_BLOCKS_TO_SHOW} blocks are shown)
            </span>
          </div>
        </div>
      </div>

      {/* Block Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div className="bg-[#16162a]/80 p-3 rounded-lg text-center border border-[#2a2a4a]/50">
          <div className="font-semibold text-[#8888a0]">
            Avg Execution Block Time
          </div>
          <div className="text-xl font-bold text-[#8888a0]">
            {avgBlockExecutionTime.toFixed(0)}ms
          </div>
        </div>
        <div className="bg-[#16162a]/80 p-3 rounded-lg text-center border border-[#2a2a4a]/50">
          <div className="font-semibold text-[#8888a0]">
            Max Execution Block Time
          </div>
          <div className="text-xl font-bold text-[#8888a0]">
            {maxBlockExecutionTime.toFixed(0)}ms
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Container with Block Bars */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Block Execution Timeline</h3>
          <div className="text-sm text-gray-500">
            Scroll horizontally to view all blocks
          </div>
        </div>

        <div className="relative pb-4 flex">
          {/* Fixed Legend - aligned with block stats */}
          <div className="flex flex-col justify-end bg-[#16162a]/80 rounded-l-lg border border-r-0 border-[#2a2a4a]/50 min-w-40">
            {/* Legend aligned with block stats */}
            <div className="flex flex-col gap-1 text-xs text-[#8888a0] p-4 pb-8">
              <span>Block execution time (in ms)</span>
              <span>Total transactions execution time (in ms)</span>
              <span>Amount of transactions</span>
            </div>
          </div>

          {/* Scrollable Blocks Container */}
          <div className="flex gap-2 p-8 bg-[#16162a]/80 rounded-r-lg border border-l-0 border-[#2a2a4a]/50 overflow-x-auto max-w-full scrollbar-none flex-1">
            {finalizedBlocks.map((block) => (
              <BlockTime
                key={block.id}
                block={block}
                maxBlockExecutionTime={maxBlockExecutionTime}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <BlockTimeLegend />
      </div>

      {/* Description */}
      <BlockTimeTrackerDescription />
    </div>
  )
}
