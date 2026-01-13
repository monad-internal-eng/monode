import { useCallback, useMemo, useState } from 'react'
import {
  fromNsToMsPrecise,
  getBlockWallTimeMs,
  getTotalTransactionTimeMs,
} from '@/lib/block-metrics'
import type { Block } from '@/types/block'
import type { SerializableEventData } from '@/types/events'
import { useEvents } from './use-events'

const MAX_BLOCKS = 5000

// Highlight when total tx execution time exceeds block execution time.
// Keep this as a single constant so UI/copy can stay consistent.
export const PARALLEL_EXECUTION_RATIO_THRESHOLD = 1

/**
 * Custom hook to track block execution events and manage block state
 * @returns Object containing blocks state and calculated metrics
 */
export function useBlockTracker() {
  const [blocks, setBlocks] = useState<Block[]>([])

  // Handle real-time events from the backend
  const handleEvent = useCallback((event: SerializableEventData) => {
    switch (event.payload.type) {
      case 'BlockStart': {
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
            const lastBlock = prev[prev.length - 1]
            newBlocks = [
              ...prev.slice(0, -1),
              {
                ...lastBlock,
                state: 'proposed',
                startTimestamp: BigInt(event.timestamp_ns),
              },
            ]
          } else {
            // Create new block
            newBlocks = [
              ...prev,
              {
                id: payload.block_id,
                number: blockNumber,
                state: 'proposed',
                startTimestamp: BigInt(event.timestamp_ns),
                transactions: [],
              },
            ]
          }

          // Keep only the latest MAX_BLOCKS blocks
          return newBlocks.slice(-MAX_BLOCKS)
        })
        break
      }

      case 'TxnHeaderStart': {
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
          const lastBlock = prev[prev.length - 1]
          return [
            ...prev.slice(0, -1),
            {
              ...lastBlock,
              transactions: [
                ...(lastBlock.transactions ?? []),
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
            },
          ]
        })
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
            const lastBlock = prev[prev.length - 1]
            return [
              ...prev.slice(0, -1),
              {
                ...lastBlock,
                transactions: (lastBlock.transactions ?? []).map((tx) =>
                  tx.txnIndex === event.txn_idx && tx.startTimestamp
                    ? {
                        ...tx,
                        endTimestamp: BigInt(event.timestamp_ns),
                        transactionTime:
                          BigInt(event.timestamp_ns) - tx.startTimestamp,
                      }
                    : tx,
                ),
              },
            ]
          })
        }
        break
      }

      case 'TxnEvmOutput': {
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
        break
      }

      case 'BlockQC': {
        const payload = event.payload
        const blockNumber = event.block_number || payload.block_number
        if (blockNumber === undefined) {
          break
        }
        setBlocks((prev) => {
          return prev.map((block) =>
            block.number === blockNumber ? { ...block, state: 'voted' } : block,
          )
        })
        break
      }

      case 'BlockFinalized': {
        const payload = event.payload
        const blockNumber = event.block_number || payload.block_number
        if (blockNumber === undefined) {
          break
        }
        setBlocks((prev) => {
          return prev.map((block) =>
            block.number === blockNumber
              ? { ...block, state: 'finalized' }
              : block,
          )
        })
        break
      }

      case 'BlockVerified': {
        const payload = event.payload
        const blockNumber = event.block_number || payload.block_number
        if (blockNumber === undefined) {
          break
        }
        setBlocks((prev) => {
          return prev.map((block) =>
            block.number === blockNumber
              ? { ...block, state: 'verified' }
              : block,
          )
        })
        break
      }

      case 'BlockEnd':
        setBlocks((prev) => {
          return prev.map((block) =>
            block.number === event?.block_number && block.startTimestamp
              ? {
                  ...block,
                  endTimestamp: BigInt(event.timestamp_ns),
                  executionTime:
                    BigInt(event.timestamp_ns) - block.startTimestamp,
                }
              : block,
          )
        })
        break

      default:
        break
    }
  }, [])

  // Subscribe to real-time events
  useEvents({
    filters: [
      { eventName: 'BlockStart' },
      { eventName: 'BlockQC' },
      { eventName: 'BlockFinalized' },
      { eventName: 'BlockVerified' },
      { eventName: 'BlockEnd' },
      { eventName: 'TxnHeaderStart' },
      { eventName: 'TxnEnd' },
      { eventName: 'TxnEvmOutput' },
    ],
    onEvent: handleEvent,
  })
  // Memoize computed values to avoid unnecessary recalculations
  const finalizedBlocks = useMemo(
    () =>
      blocks.filter((b) => b.state === 'finalized' || b.state === 'verified'),
    [blocks],
  )

  const maxBlockExecutionTime = useMemo(() => {
    return fromNsToMsPrecise(
      finalizedBlocks.reduce(
        (max, block) =>
          block.executionTime && block.executionTime > max
            ? block.executionTime
            : max,
        BigInt(1),
      ),
    )
  }, [finalizedBlocks])

  const normalizedTimeScaleMs = useMemo(() => {
    if (finalizedBlocks.length === 0) return 1

    // Normalize against the larger of:
    // - block wall-time (BlockEnd - BlockStart)
    // - ΣTx execution time (sum of TxnHeaderEnd - TxnHeaderStart)
    // This lets the visualization show when ΣTx > block time (parallel overlap).
    const maxTimes = finalizedBlocks
      .map((block) =>
        Math.max(getBlockWallTimeMs(block), getTotalTransactionTimeMs(block)),
      )
      .filter((time) => time > 0)
      .sort((a, b) => a - b)

    if (maxTimes.length === 0) return 1

    // Use 95th percentile to be resistant to spikes
    const percentileIndex = Math.floor(maxTimes.length * 0.95)
    const percentile95 = maxTimes[percentileIndex] || maxTimes[maxTimes.length - 1]

    // Add 10% buffer to prevent clipping of high values near the percentile
    return percentile95 * 1.1
  }, [finalizedBlocks])

  return {
    blocks,
    finalizedBlocks,
    maxBlockExecutionTime,
    normalizedTimeScaleMs,
  }
}
