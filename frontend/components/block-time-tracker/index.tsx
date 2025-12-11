'use client'

import { motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Block, BlockState } from '@/types/block'

/**
 * Calculate bar metrics for a block visualization
 * @param block - The block to calculate metrics for
 * @param maxBlockTime - The maximum block time in the dataset for normalization
 * @returns Object containing bar height percentage and fill percentage
 */
function calculateBarMetrics(block: Block, maxBlockTime: number) {
  // Calculate total transaction execution time
  const totalTransactionTime = block.transactions.reduce(
    (sum, tx) => sum + tx.transactionTime,
    0,
  )

  // Normalize bar height based on block time (container represents block execution time)
  const barHeightPercentage = (block.blockTime / maxBlockTime) * 100

  // Calculate fill percentage (transaction time relative to block time)
  // If transactions run in parallel, total transaction time can be > block time
  // But the fill can't exceed 100% of the container
  const fillPercentage = Math.min(
    (totalTransactionTime / block.blockTime) * 100,
    100,
  )

  // Calculate efficiency metrics
  const parallelizationRatio =
    block.blockTime > 0 ? totalTransactionTime / block.blockTime : 0
  const isHighlyParallel = parallelizationRatio > 1

  return {
    barHeightPercentage: Math.max(barHeightPercentage * 0.8, 10), // Ensure minimum height
    fillPercentage,
    totalTransactionTime,
    parallelizationRatio,
    isHighlyParallel,
  }
}

// =============================================================================
// Main Component
// =============================================================================

/**
 *
 * @note Currently uses local state for demonstration. In production, block state
 * updates will come from the backend via the Execution Events SDK.
 */
export default function BlockTimeTracker() {
  const [blocks, setBlocks] = useState<Block[]>([])

  // Generate some sample blocks for demonstration
  const generateSampleBlocks = useCallback(() => {
    const sampleBlocks: Block[] = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      state: ['proposed', 'voted', 'finalized', 'verified'][
        Math.floor(Math.random() * 4)
      ] as BlockState,
      blockTime: Math.floor(Math.random() * 1000) + 100, // 100-1100ms
      transactions: Array.from(
        { length: Math.floor(Math.random() * 10) + 1 },
        (_, j) => ({
          id: j + 1,
          transactionTime: Math.floor(Math.random() * 200) + 10, // 10-210ms
        }),
      ),
    }))
    setBlocks(sampleBlocks)
  }, [])

  // Generate sample data on mount
  useState(() => {
    generateSampleBlocks()
  })

  const maxBlockTime = Math.max(...blocks.map((block) => block.blockTime), 1)

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Block Time Tracker
        </h2>
        <button
          type="button"
          onClick={generateSampleBlocks}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Generate New Blocks
        </button>
      </div>

      {/* Block Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-100 p-3 rounded-lg text-center">
          <div className="font-semibold text-gray-600">Total Blocks</div>
          <div className="text-xl font-bold text-gray-600">{blocks.length}</div>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg text-center">
          <div className="font-semibold text-gray-600">Avg Block Time</div>
          <div className="text-xl font-bold text-gray-600">
            {blocks.length > 0
              ? Math.round(
                  blocks.reduce((sum, b) => sum + b.blockTime, 0) /
                    blocks.length,
                )
              : 0}
            ms
          </div>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg text-center">
          <div className="font-semibold text-gray-600">Max Block Time</div>
          <div className="text-xl font-bold text-gray-600">
            {maxBlockTime}ms
          </div>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg text-center">
          <div className="font-semibold text-gray-600">Total Transactions</div>
          <div className="text-xl font-bold text-gray-600">
            {blocks.reduce((sum, b) => sum + b.transactions.length, 0)}
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

        <div className="relative overflow-x-auto pb-4">
          <div className="flex gap-2 min-w-max p-4 bg-gray-50 rounded-lg">
            {blocks.map((block) => {
              const {
                barHeightPercentage,
                fillPercentage,
                totalTransactionTime,
                parallelizationRatio,
                isHighlyParallel,
              } = calculateBarMetrics(block, maxBlockTime)

              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: block.id * 0.05 }}
                  className="flex flex-col items-center gap-2 min-w-[80px]"
                >
                  {/* Block ID Label */}
                  <div className="text-xs font-medium text-gray-600">
                    Block {block.id}
                  </div>

                  {/* Block Bar Container */}
                  <div className="relative w-full h-32 flex flex-col justify-end">
                    {/* Block Time Container (represents total block execution time) */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeightPercentage}%` }}
                      transition={{ duration: 0.8, delay: block.id * 0.05 }}
                      className={cn(
                        'w-full rounded-t-md border-2 border-gray-300 relative overflow-hidden',
                        'bg-gradient-to-t from-gray-200 to-gray-100',
                        'hover:shadow-lg transition-all duration-200 cursor-pointer',
                      )}
                      title={`Block ${block.id}: ${block.blockTime}ms block time, ${totalTransactionTime}ms total tx time`}
                    >
                      {/* Transaction Time Fill */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${fillPercentage}%` }}
                        transition={{
                          duration: 1.2,
                          delay: block.id * 0.05 + 0.3,
                        }}
                        className={cn(
                          'absolute bottom-0 left-0 w-full rounded-t-md',
                          isHighlyParallel
                            ? 'bg-gradient-to-t from-purple-500 to-purple-300'
                            : 'bg-gradient-to-t from-blue-500 to-blue-300',
                        )}
                        title={`${totalTransactionTime}ms total transaction execution time`}
                      />

                      {/* Parallelization Badge */}
                      {isHighlyParallel && (
                        <div className="absolute top-1 right-1 text-[8px] bg-purple-600 text-white px-1 rounded z-10">
                          {parallelizationRatio.toFixed(1)}x
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Block Stats */}
                  <div className="text-center text-xs text-gray-500 space-y-1">
                    <div className="font-medium">{block.blockTime}ms</div>
                    <div className="text-[10px] text-gray-400">
                      {totalTransactionTime}ms tx
                    </div>
                    <div>{block.transactions.length} tx</div>
                    <div className="capitalize text-[10px]">{block.state}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-t from-gray-200 to-gray-100 border border-gray-300 rounded" />
            <span>Block execution time (container)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-blue-300 rounded" />
            <span>Transaction execution time (fill)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-t from-purple-500 to-purple-300 rounded" />
            <span>High parallelization (&gt;1x ratio)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
