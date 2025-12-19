import type { Block } from '@/types/block'

/**
 * Convert nanoseconds to milliseconds with high precision
 * @param ns - Time in nanoseconds as string, number, or bigint
 * @returns Time in milliseconds with microsecond precision
 */
export function fromNsToMsPrecise(ns: bigint): number {
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
export function calculateBarMetrics(
  block: Block,
  maxBlockExecutionTime: number,
) {
  const blockExecutionTime = block.executionTime ?? BigInt(0)

  // Calculate total transaction execution time with high precision
  const totalTransactionTimeNs = (block.transactions ?? []).reduce(
    (sum, tx) => sum + BigInt(tx.transactionTime ?? 0),
    BigInt(0),
  )
  const totalTransactionTime = fromNsToMsPrecise(totalTransactionTimeNs)

  // Normalize bar height based on block time (container represents block execution time)
  // If no execution time, show minimal height for blocks that exist
  const barHeightPercentage =
    Number(blockExecutionTime) > 0
      ? (fromNsToMsPrecise(blockExecutionTime) / maxBlockExecutionTime) * 100
      : 20 // Show something for blocks without execution time yet

  // Calculate fill percentage (transaction time relative to block time)
  // If transactions run in parallel, total transaction time can be > block time
  // But the fill can't exceed 100% of the container
  const fillPercentage =
    Number(blockExecutionTime) > 0
      ? Math.min(
          (totalTransactionTime / fromNsToMsPrecise(blockExecutionTime)) * 100,
          100,
        )
      : totalTransactionTime > 0
        ? 50
        : 0 // Show some fill if we have transactions

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
