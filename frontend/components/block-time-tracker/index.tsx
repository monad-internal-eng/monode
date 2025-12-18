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
 * Convert nanoseconds to milliseconds with high precision
 * @param ns - Time in nanoseconds as string, number, or bigint
 * @returns Time in milliseconds with microsecond precision
 */
function fromNsToMsPrecise(ns: string | number | bigint): number {
  const nsBigInt = BigInt(ns)
  const msPart = Number(nsBigInt / BigInt(1_000_000))
  const nsPart = Number(nsBigInt % BigInt(1_000_000))
  return msPart + nsPart / 1_000_000
}

/**
 * Calculate bar metrics for a block visualization
 * @param block - The block to calculate metrics for
 * @param maxBlockExecutionTime - The maximum block execution time in the dataset for normalization
 * @returns Object containing bar height percentage and fill percentage
 */
function calculateBarMetrics(block: Block, maxBlockExecutionTime: string) {
  const blockExecutionTime = block.executionTime ?? '0'
  const maxExecTime = Math.max(Number(maxBlockExecutionTime), 1) // Ensure minimum to avoid division by zero

  // Calculate total transaction execution time with high precision
  const totalTransactionTimeNs = (block.transactions ?? []).reduce(
    (sum, tx) => sum + BigInt(tx.transactionTime ?? 0),
    BigInt(0),
  )
  const totalTransactionTime = fromNsToMsPrecise(
    totalTransactionTimeNs.toString(),
  )

  // Normalize bar height based on block time (container represents block execution time)
  // If no execution time, show minimal height for blocks that exist
  let barHeightPercentage =
    Number(blockExecutionTime) > 0
      ? (fromNsToMsPrecise(blockExecutionTime) / maxExecTime) * 100
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
    Number(blockExecutionTime) > 0
      ? Math.min(
          (totalTransactionTime / fromNsToMsPrecise(blockExecutionTime)) * 100,
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
    Number(blockExecutionTime) > 0
      ? totalTransactionTime / fromNsToMsPrecise(blockExecutionTime)
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
    switch (event.payload.type) {
      case 'BlockStart': {
        if (event.payload.type !== 'BlockStart') {
          break
        }
        const payload = event.payload
        const blockNumber = event.block_number || payload.block_number
        if (blockNumber === undefined) {
          console.warn('BlockStart event missing block_number:', event)
          break
        }
        setBlocks((prev) => {
          const existingBlock = prev.find((b) => b.id === payload.block_id)
          let newBlocks: Block[]

          // Should never happen
          if (existingBlock) {
            console.warn(
              '2 BlockStart events received on block:',
              payload.block_number,
            )
            // Update existing block with new BlockStart data
            newBlocks = prev.map((block) =>
              block.id === payload.block_id
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
                id: payload.block_id,
                number: blockNumber,
                state: 'proposed',
                startTimestamp: event.timestamp_ns,
                transactions: [],
              },
            ]
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
        if (event.payload.type === 'TxnHeaderStart') {
          const payload = event.payload
          setBlocks((prev) => {
            // check if blocks is empty
            if (prev.length === 0) {
              console.warn(
                'TxnHeaderStart event received but no blocks exist yet:',
                event,
              )
              return prev
            }
            // add a transaction to the last block
            return prev.map((block, index) =>
              index === prev.length - 1
                ? {
                    ...block,
                    transactions: [
                      ...(block.transactions ?? []),
                      {
                        id: payload.txn_index,
                        txnIndex: payload.txn_index,
                        txnHash: payload.txn_hash,
                        startTimestamp: BigInt(event.timestamp_ns),
                        transactionTime: undefined, // Will be calculated when TxnEnd is received
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

      case 'TxnEnd': {
        if (event.txn_idx === undefined) {
          console.warn('TxnEnd event missing txn_idx:', event)
          break
        }
        if (event.txn_idx !== undefined) {
          setBlocks((prev) => {
            // check if blocks is empty
            if (prev.length === 0) {
              console.warn(
                'TxnEnd event received but no blocks exist yet:',
                event,
              )
              return prev
            }
            // update the last block
            return prev.map((block, index) =>
              index === prev.length - 1
                ? {
                    ...block,
                    transactions: (block.transactions ?? []).map((tx) =>
                      tx.txnIndex === event.txn_idx && tx.startTimestamp
                        ? {
                            ...tx,
                            endTimestamp: BigInt(event.timestamp_ns),
                            transactionTime:
                              BigInt(event.timestamp_ns) - tx.startTimestamp,
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
        if (event.payload.type === 'TxnEvmOutput') {
          const payload = event.payload
          setBlocks((prev) => {
            // check if blocks is empty
            if (prev.length === 0) {
              console.warn(
                'TxnEvmOutput event received but no blocks exist yet:',
                event,
              )
              return prev
            }
            // update the last block
            return prev.map((block, index) =>
              index === prev.length - 1
                ? {
                    ...block,
                    transactions: (block.transactions ?? []).map((tx) =>
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
          return prev.map((block) =>
            block.number === blockNumber
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
          return prev.map((block) =>
            block.number === blockNumber
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
          return prev.map((block) =>
            block.number === blockNumber
              ? { ...block, state: 'verified' as BlockState }
              : block,
          )
        })
        break
      }

      case 'BlockEnd': {
        setBlocks((prev) => {
          return prev.map((block) =>
            block.number === event?.block_number
              ? {
                  ...block,
                  endTimestamp: event.timestamp_ns,
                  executionTime:
                    BigInt(event.timestamp_ns) -
                    BigInt(block.startTimestamp || 0),
                }
              : block,
          )
        })
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
  const maxBlockExecutionTimeMs = fromNsToMsPrecise(
    Math.max(
      ...finalizedBlocks.map((block) => Number(block.executionTime) ?? 0),
      1,
    ),
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
