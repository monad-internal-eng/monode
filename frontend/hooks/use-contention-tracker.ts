'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useEventsContext } from '@/contexts/events-context'
import type {
  ContendedSlotEntry,
  ContentionData,
  ContractContentionEntry,
  ContractEdge,
} from '@/types/contention'

const MAX_HISTORY = 500

/**
 * Hook that subscribes to contention data from the backend and maintains
 * a rolling history of per-block contention snapshots.
 *
 * Provides:
 * - Latest snapshot with contended slots, contract stats, and edges
 * - Rolling averages for contention ratio and parallel efficiency
 * - Historical data for trend charts
 */
export function useContentionTracker() {
  const { subscribeToContention } = useEventsContext()
  const [history, setHistory] = useState<ContentionData[]>([])

  const handleContention = useCallback((data: ContentionData) => {
    setHistory((prev) => [...prev, data].slice(-MAX_HISTORY))
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToContention(handleContention)
    return unsubscribe
  }, [subscribeToContention, handleContention])

  const latestSnapshot = useMemo<ContentionData | null>(() => {
    return history.length > 0 ? history[history.length - 1] : null
  }, [history])

  // Rolling average contention ratio (last 50 blocks)
  const avgContentionRatio = useMemo(() => {
    const recent = history.slice(-50)
    if (recent.length === 0) return 0
    const sum = recent.reduce((acc, d) => acc + d.contention_ratio, 0)
    return sum / recent.length
  }, [history])

  // Rolling average parallel efficiency (last 50 blocks)
  const avgParallelEfficiency = useMemo(() => {
    const recent = history.slice(-50)
    if (recent.length === 0) return 0
    const sum = recent.reduce((acc, d) => acc + d.parallel_efficiency_pct, 0)
    return sum / recent.length
  }, [history])

  // Aggregate contended slots across recent blocks (weighted by recency)
  const aggregatedContendedSlots = useMemo<ContendedSlotEntry[]>(() => {
    if (!latestSnapshot) return []
    return latestSnapshot.top_contended_slots
  }, [latestSnapshot])

  // Aggregate contract contention stats
  const aggregatedContracts = useMemo<ContractContentionEntry[]>(() => {
    if (!latestSnapshot) return []
    return latestSnapshot.top_contended_contracts
  }, [latestSnapshot])

  // Aggregate contract edges
  const aggregatedEdges = useMemo<ContractEdge[]>(() => {
    if (!latestSnapshot) return []
    return latestSnapshot.contract_edges
  }, [latestSnapshot])

  // Trend data for charts (block_number, contention_ratio, parallel_efficiency)
  const trendData = useMemo(() => {
    return history.map((d) => ({
      blockNumber: d.block_number,
      contentionRatio: d.contention_ratio * 100,
      parallelEfficiency: d.parallel_efficiency_pct,
      contentionSlots: d.contended_slot_count,
      txnCount: d.total_txn_count,
    }))
  }, [history])

  return {
    history,
    latestSnapshot,
    avgContentionRatio,
    avgParallelEfficiency,
    aggregatedContendedSlots,
    aggregatedContracts,
    aggregatedEdges,
    trendData,
  }
}
