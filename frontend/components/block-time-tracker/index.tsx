'use client'

import { motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { useEvents } from '@/hooks/use-events'
import { cn } from '@/lib/utils'
import type { Block, BlockState } from '@/types/block'
import type { SerializableEventData } from '@/types/events'

// =============================================================================
// Utils
// =============================================================================

/**
 * Convert nanoseconds to milliseconds
 * @param ns - Time in nanoseconds
 * @returns Time in milliseconds
 */
function fromNsToMs(ns: string | number): number {
  return Number(BigInt(ns) / BigInt(1_000_000))
}

/**
 * Safely calculate the difference between two nanosecond timestamps
 * Uses BigInt to avoid precision loss with large numbers
 * @param endNs - End timestamp in nanoseconds
 * @param startNs - Start timestamp in nanoseconds
 * @returns Difference in nanoseconds as a regular number (safe for display)
 */
function calculateNsDifference(
  endNs: string | number,
  startNs: string | number,
): number {
  return Number(BigInt(endNs) - BigInt(startNs))
}

/**
 * Calculate bar metrics for a block visualization
 * @param block - The block to calculate metrics for
 * @param maxBlockExecutionTime - The maximum block execution time in the dataset for normalization
 * @returns Object containing bar height percentage and fill percentage
 */
function calculateBarMetrics(block: Block, maxBlockExecutionTime: string) {
  const blockExecutionTime = block.executionTime ?? 0
  const maxExecTime = Math.max(Number(maxBlockExecutionTime), 1) // Ensure minimum to avoid division by zero

  // Calculate total transaction execution time
  const totalTransactionTime = block.transactions.reduce(
    (sum, tx) => sum + (tx.transactionTime ?? 0),
    0,
  )

  // Normalize bar height based on block time (container represents block execution time)
  // If no execution time, show minimal height for blocks that exist
  let barHeightPercentage =
    blockExecutionTime > 0
      ? (fromNsToMs(blockExecutionTime) / maxExecTime) * 100
      : 20 // Show something for blocks without execution time yet

  // Guard against NaN
  if (
    Number.isNaN(barHeightPercentage) ||
    !Number.isFinite(barHeightPercentage)
  ) {
    barHeightPercentage = 20
  }

  // Calculate fill percentage (transaction time relative to block time)
  // If transactions run in parallel, total transaction time can be > block time
  // But the fill can't exceed 100% of the container
  let fillPercentage =
    blockExecutionTime > 0
      ? Math.min(
          (totalTransactionTime / fromNsToMs(blockExecutionTime)) * 100,
          100,
        )
      : totalTransactionTime > 0
        ? 50
        : 0 // Show some fill if we have transactions

  // Guard against NaN
  if (Number.isNaN(fillPercentage) || !Number.isFinite(fillPercentage)) {
    fillPercentage = 0
  }

  // Calculate efficiency metrics
  const parallelizationRatio =
    blockExecutionTime > 0
      ? totalTransactionTime / fromNsToMs(blockExecutionTime)
      : 0
  const isHighlyParallel =
    parallelizationRatio > 1 && Number.isFinite(parallelizationRatio)

  return {
    barHeightPercentage: Math.max(barHeightPercentage * 0.8, 15), // Ensure minimum height
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
 * Block Time Tracker visualizes block and transaction execution times in real-time.
 *
 * Uses the Execution Events SDK to receive real-time block lifecycle events
 * and calculates execution timing metrics for visualization.
 */
export default function BlockTimeExecutionTracker() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const maxBlock = 20

  // Handle real-time events from the backend
  const handleEvent = useCallback((event: SerializableEventData) => {
    // console.log('🔍 Received event:', event)

    // Helper function to ensure a block exists, creating it if necessary
    const ensureBlockExists = (
      blockNumber: number,
      currentBlocks: Block[],
    ): Block[] => {
      const existingBlock = currentBlocks.find((b) => b.id === blockNumber)
      if (existingBlock) {
        return currentBlocks
      }

      // NOTE: this can be triggered also because when we start receiving events
      // we can receive the end of the block x before receiving the block x + 1
      // TODO: Should we just ignore these blocks to avoid having 3 or 4 empty blocks at the beginning?
      console.log(
        'WARNING: Race condition detected!\n📦 Creating missing block:',
        blockNumber,
      )

      // Create a new block with minimal default values
      const newBlock: Block = {
        id: blockNumber,
        state: 'proposed',
        startTimestamp: event.timestamp_ns, // Use current event timestamp as fallback
        transactions: [],
      }

      return [...currentBlocks, newBlock].sort((a, b) => a.id - b.id) // Keep blocks sorted - shouldn't be too expensive as amount of blocks is small
    }

    switch (event.payload.type) {
      case 'BlockStart': {
        if (event.payload.type !== 'BlockStart') {
          break
        }
        const payload = event.payload
        const blockNumber = event.block_number || payload.block_number
        if (blockNumber === undefined) {
          break
        }
        setBlocks((prev) => {
          const existingBlock = prev.find((b) => b.id === payload.block_number)
          let newBlocks: Block[]

          // Should never happen
          if (existingBlock) {
            console.warn(
              '2 BlockStart events received on block:',
              payload.block_number,
            )
            // Update existing block with new BlockStart data
            newBlocks = prev.map((block) =>
              block.id === payload.block_number
                ? {
                    ...block,
                    state: 'proposed',
                    startTimestamp: event.timestamp_ns,
                  }
                : block,
            )
          } else {
            // Create new block
            newBlocks = [
              ...prev,
              {
                id: blockNumber,
                state: 'proposed',
                startTimestamp: event.timestamp_ns,
                transactions: [],
              },
            ] //.sort((a, b) => a.id - b.id) // Should not be necessary as we always add the newest block
          }

          // Keep only the latest maxBlock blocks
          if (newBlocks.length > maxBlock) {
            newBlocks = newBlocks.slice(-maxBlock)
          }

          return newBlocks
        })
        break
      }

      case 'TxnHeaderStart': {
        if (
          event.block_number !== undefined &&
          event.payload.type === 'TxnHeaderStart'
        ) {
          const payload = event.payload

          setBlocks((prev) => {
            // Ensure the block exists first - TODO Remove if we are sure it exists
            const blocksWithBlock = ensureBlockExists(event.block_number!, prev)

            return blocksWithBlock.map((block) =>
              block.id === event.block_number
                ? {
                    ...block,
                    transactions: [
                      ...block.transactions,
                      {
                        id: payload.txn_index,
                        txnIndex: payload.txn_index,
                        txnHash: payload.txn_hash,
                        startTimestamp: event.timestamp_ns,
                        transactionTime: 0, // Will be calculated when TxnEnd is received
                        gasLimit: payload.gas_limit,
                        sender: payload.sender,
                        to: payload.to,
                      },
                    ],
                  }
                : block,
            )
          })
        }
        break
      }

      // TODO: confirm with Jake that it is the correct way to index the end of a transaction
      case 'TxnEnd': {
        if (event.block_number !== undefined && event.txn_idx !== undefined) {
          setBlocks((prev) => {
            // Ensure the block exists first - TODO Remove if we are sure it exists
            const blocksWithBlock = ensureBlockExists(event.block_number!, prev)

            return blocksWithBlock.map((block) =>
              block.id === event.block_number
                ? {
                    ...block,
                    transactions: block.transactions.map((tx) =>
                      tx.txnIndex === event.txn_idx && tx.startTimestamp
                        ? {
                            ...tx,
                            endTimestamp: event.timestamp_ns,
                            transactionTime: fromNsToMs(
                              calculateNsDifference(
                                event.timestamp_ns,
                                tx.startTimestamp,
                              ),
                            ),
                          }
                        : tx,
                    ),
                  }
                : block,
            )
          })
        }
        break
      }

      case 'TxnEvmOutput': {
        if (
          event.block_number !== undefined &&
          event.payload.type === 'TxnEvmOutput'
        ) {
          const payload = event.payload

          setBlocks((prev) => {
            // Ensure the block exists first - TODO Remove if we are sure it exists
            const blocksWithBlock = ensureBlockExists(event.block_number!, prev)

            return blocksWithBlock.map((block) =>
              block.id === event.block_number
                ? {
                    ...block,
                    transactions: block.transactions.map((tx) =>
                      tx.txnIndex === payload.txn_index
                        ? {
                            ...tx,
                            status: payload.status,
                            gasUsed: payload.gas_used,
                          }
                        : tx,
                    ),
                  }
                : block,
            )
          })
        }
        break
      }

      case 'BlockQC': {
        if (event.event_name !== 'BlockQC') {
          break
        }
        const payload = event.payload
        const blockNumber = event.block_number || payload.block_number
        if (blockNumber === undefined) {
          break
        }
        setBlocks((prev) => {
          // Ensure the block exists first - TODO Remove if we are sure it exists
          const blocksWithBlock = ensureBlockExists(blockNumber, prev)

          return blocksWithBlock.map((block) =>
            block.id === blockNumber
              ? { ...block, state: 'voted' as BlockState }
              : block,
          )
        })
        break
      }

      case 'BlockFinalized': {
        if (event.event_name !== 'BlockFinalized') {
          break
        }
        const payload = event.payload
        const blockNumber = event.block_number || payload.block_number
        if (blockNumber === undefined) {
          break
        }
        setBlocks((prev) => {
          // Ensure the block exists first - TODO Remove if we are sure it exists
          const blocksWithBlock = ensureBlockExists(blockNumber, prev)

          return blocksWithBlock.map((block) =>
            block.id === blockNumber
              ? { ...block, state: 'finalized' as BlockState }
              : block,
          )
        })
        break
      }

      case 'BlockVerified': {
        if (event.event_name !== 'BlockVerified') {
          break
        }
        const payload = event.payload
        const blockNumber = event.block_number || payload.block_number
        if (blockNumber === undefined) {
          break
        }
        setBlocks((prev) => {
          // Ensure the block exists first - TODO Remove if we are sure it exists
          const blocksWithBlock = ensureBlockExists(blockNumber, prev)

          return blocksWithBlock.map((block) =>
            block.id === blockNumber
              ? { ...block, state: 'verified' as BlockState }
              : block,
          )
        })
        break
      }

      case 'BlockEnd': {
        if (event.block_number !== undefined) {
          setBlocks((prev) => {
            // Ensure the block exists first - TODO Remove if we are sure it exists
            const blocksWithBlock = ensureBlockExists(event.block_number!, prev)

            return blocksWithBlock.map((block) =>
              block.id === event.block_number
                ? {
                    ...block,
                    endTimestamp: event.timestamp_ns,
                    executionTime: calculateNsDifference(
                      event.timestamp_ns,
                      block.startTimestamp,
                    ),
                  }
                : block,
            )
          })
        }
        break
      }

      default:
        break
    }
  }, [])

  // Subscribe to real-time events
  useEvents({
    subscribeToEvents: [
      'BlockStart',
      'BlockQC',
      'BlockFinalized',
      'BlockVerified',
      'BlockEnd',
      'TxnHeaderStart',
      'TxnEnd',
      'TxnEvmOutput',
    ],
    onEvent: handleEvent,
  })

  const finalizedBlocks = blocks.filter(
    (b) => b.state === 'finalized' || b.state === 'verified',
  )
  const maxBlockExecutionTimeMs = fromNsToMs(
    Math.max(...finalizedBlocks.map((block) => block.executionTime ?? 0), 1),
  )
  const maxBlockExecutionTime = Math.max(maxBlockExecutionTimeMs, 1).toFixed(0)

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
              Live Events (only last {maxBlock} blocks are shown)
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
                    (sum, b) => sum + fromNsToMs(b?.executionTime ?? 0),
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
              <span>Block execution time</span>
              <span>Total transactions execution time</span>
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
                  {/* Block ID Label */}
                  <div className="text-xs font-medium text-[#8888a0]">
                    #{block.id}
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
                      title={`Block ${block.id}: ${fromNsToMs(block.executionTime ?? 0).toFixed(2)}ms execution time, ${totalTransactionTime.toFixed(2)}ms total tx time, ${block.transactions.length} transactions`}
                    >
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
                    <div className="font-medium">
                      {fromNsToMs(block.executionTime ?? 0).toFixed(1)}ms
                    </div>
                    <div className="text-xs text-gray-400">
                      {totalTransactionTime.toFixed(1)}ms
                    </div>
                    <div>{block.transactions.length} tx</div>
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
