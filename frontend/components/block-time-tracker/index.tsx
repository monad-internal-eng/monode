'use client'

import { motion } from 'framer-motion'
import { useBlockTracker } from '@/hooks/use-block-tracker'
import { calculateBarMetrics, fromNsToMsPrecise } from '@/lib/block-metrics'
import { cn } from '@/lib/utils'

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
            {finalizedBlocks.length > 0
              ? Math.round(
                  finalizedBlocks.reduce(
                    (sum, b) => sum + fromNsToMsPrecise(b?.executionTime ?? 0),
                    0,
                  ) / finalizedBlocks.length,
                )
              : 0}
            ms
          </div>
        </div>
        <div className="bg-[#16162a]/80 p-3 rounded-lg text-center border border-[#2a2a4a]/50">
          <div className="font-semibold text-[#8888a0]">
            Max Execution Block Time
          </div>
          <div className="text-xl font-bold text-[#8888a0]">
            {maxBlockExecutionTime}ms
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
            {finalizedBlocks.map((block) => {
              const {
                barHeightPercentage,
                fillPercentage,
                totalTransactionTime,
                parallelizationRatio,
                isHighlyParallel,
              } = calculateBarMetrics(block, maxBlockExecutionTime)

              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex flex-col items-center gap-2 min-w-20"
                >
                  {/* Block number Label */}
                  <div className="text-xs font-medium text-[#8888a0]">
                    #{block.number}
                  </div>

                  {/* Block Bar Container */}
                  <div className="relative w-full h-32 flex flex-col justify-end p-1">
                    {/* Block Time Container (represents total block execution time) */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeightPercentage}%` }}
                      transition={{ duration: 0.8, delay: 0.05 }}
                      className={cn(
                        'w-full rounded-t-md border-2 border-gray-400 relative',
                        'bg-linear-to-t from-gray-300 to-gray-200',
                        'hover:shadow-lg transition-all duration-200 cursor-pointer',
                      )}
                      title={`Block ${block.number}: ${fromNsToMsPrecise(block.executionTime ?? 0).toFixed(6)}ms execution time, ${totalTransactionTime.toFixed(6)}ms total tx time, ${(block.transactions ?? []).length} transactions`}
                    >
                      {/* Parallelization Badge */}
                      {isHighlyParallel && (
                        <div className="absolute -top-4 right-1 text-[8px] bg-purple-600 text-white px-1 rounded z-10">
                          {parallelizationRatio.toFixed(1)}x
                        </div>
                      )}
                      {/* Transaction Time Fill */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${fillPercentage}%` }}
                        transition={{
                          duration: 1.2,
                          delay: 0.05,
                        }}
                        className={cn(
                          'absolute bottom-0 left-0 w-full rounded-t-md bg-linear-to-t from-purple-500 to-purple-300',
                          isHighlyParallel && 'animate-pulse',
                        )}
                        style={{
                          boxShadow: isHighlyParallel
                            ? '0 0 15px #ffd700, 0 0 30px #ffd700, 0 0 20px #a855f7, 0 0 40px #a855f7, 0 0 60px #a855f7, inset 0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 10px rgba(168, 85, 247, 0.3)'
                            : undefined,
                        }}
                        title={`${totalTransactionTime.toFixed(6)}ms total transaction execution time`}
                      />
                    </motion.div>
                  </div>

                  {/* Block Stats */}
                  <div className="text-center text-xs text-gray-500 space-y-1">
                    <div className="font-medium">
                      {fromNsToMsPrecise(block.executionTime ?? 0).toFixed(6)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {totalTransactionTime.toFixed(6)}
                    </div>
                    <div>{(block.transactions ?? []).length} tx</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-[#8888a0]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-linear-to-t from-gray-200 to-gray-100 border border-gray-300 rounded" />
            <span>Block execution time (container)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-linear-to-t from-purple-500 to-purple-300 rounded" />
            <span>Transaction execution time</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 bg-linear-to-t from-purple-500 to-purple-300 rounded animate-pulse"
              style={{
                boxShadow:
                  '0 0 6px #ffd700, 0 0 12px #ffd700, 0 0 8px #a855f7, 0 0 16px #a855f7, 0 0 24px #a855f7',
              }}
            />
            <span>High parallelization (&gt;1x ratio)</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-sm text-[#8888a0] bg-[#16162a]/80 rounded-lg border border-[#2a2a4a]/50 p-4">
        <p className="mb-2">
          <strong>Real-time block execution visualization:</strong> Each bar
          represents a block with its container height showing total block
          execution time. The fill shows cumulative transaction execution time -
          if transactions run in parallel, it will be visible as a glowing fill
          and multiplier.
        </p>
        <p className="text-xs text-gray-500">
          Data updates live from blockchain events. Glowing fill indicates high
          parallelization (block execution would take longer if the transactions
          run sequentially).
        </p>
      </div>
    </div>
  )
}
