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

function sumTransactionTimeNs(block: Block): bigint {
  return (block.transactions ?? []).reduce(
    (sum, tx) => sum + BigInt(tx.transactionTime ?? 0),
    BigInt(0),
  )
}

export function getBlockWallTimeMs(block: Block): number {
  return fromNsToMsPrecise(block.executionTime ?? BigInt(0))
}

export function getTotalTransactionTimeMs(block: Block): number {
  return fromNsToMsPrecise(sumTransactionTimeNs(block))
}

export function getParallelizationRatio(
  blockMs: number,
  totalTxMs: number,
): number {
  if (!(blockMs > 0)) return 0
  const ratio = totalTxMs / blockMs
  return Number.isFinite(ratio) ? ratio : 0
}

export function getTimeSavedMs(blockMs: number, totalTxMs: number): number {
  return Math.max(totalTxMs - blockMs, 0)
}

/**
 * Calculate bar metrics for a block visualization
 * @param block - The block to calculate metrics for
 * @param normalizedTimeScaleMs - Shared normalization scale for both bars (ms)
 * @returns Object containing bar height percentages and tooltip metrics
 */
export function calculateBarMetrics(
  block: Block,
  normalizedTimeScaleMs: number,
  parallelExecutionRatioThreshold: number,
) {
  const blockMs = getBlockWallTimeMs(block)
  const totalTransactionTime = getTotalTransactionTimeMs(block)
  const parallelizationRatio = getParallelizationRatio(
    blockMs,
    totalTransactionTime,
  )
  const isParallelExecution =
    parallelizationRatio > parallelExecutionRatioThreshold

  const timeSavedMs = getTimeSavedMs(blockMs, totalTransactionTime)

  const scaleMs = normalizedTimeScaleMs > 0 ? normalizedTimeScaleMs : 1

  // Normalize both bars using the same scale so that ΣTx can exceed block time.
  // If no execution time yet, show a minimal visible placeholder.
  const blockHeightPct = blockMs > 0 ? (blockMs / scaleMs) * 100 : 20
  const txHeightPct =
    totalTransactionTime > 0 ? (totalTransactionTime / scaleMs) * 100 : 0

  return {
    blockHeightPct: Math.max(Math.min(blockHeightPct, 100) * 0.9, 15), // Ensure minimum height + a little headroom
    txHeightPct: Math.min(txHeightPct, 100) * 0.9,
    blockMs,
    totalTransactionTime,
    parallelizationRatio,
    isParallelExecution,
    timeSavedMs,
  }
}
