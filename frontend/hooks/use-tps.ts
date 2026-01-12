'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEventsContext } from '@/contexts/events-context'
import { useEvents } from '@/hooks/use-events'
import type { SerializableEventData } from '@/types/events'

/** Duration of TPS history to keep */
const TPS_HISTORY_DURATION_MS = 5 * 60 * 1000

export interface TpsDataPoint {
  timestamp: number
  tps: number
}

export interface TpsData {
  currentTps: number
  peakTps: number
  totalTransactions: number
  history: TpsDataPoint[]
}

/**
 * Tracks TPS from backend metrics and total txns from execution events.
 */
export function useTps(): TpsData {
  const [tpsData, setTpsData] = useState<TpsData>({
    currentTps: 0,
    peakTps: 0,
    totalTransactions: 0,
    history: [],
  })

  const { subscribeToTps } = useEventsContext()
  const totalTransactionsRef = useRef(0)

  const handleTxnEvent = useCallback((event: SerializableEventData) => {
    if (event.payload.type === 'TxnHeaderStart') {
      totalTransactionsRef.current += 1
    }
  }, [])

  useEvents({
    filters: [{ eventName: 'TxnHeaderStart' }],
    onEvent: handleTxnEvent,
  })

  useEffect(() => {
    const unsubscribe = subscribeToTps((tps) => {
      const now = Date.now()

      setTpsData((prev) => {
        const cutoffTime = now - TPS_HISTORY_DURATION_MS
        const filteredHistory = prev.history.filter((point) => {
          return point.timestamp >= cutoffTime
        })

        const nextHistory = [...filteredHistory, { timestamp: now, tps }]

        return {
          currentTps: tps,
          peakTps: Math.max(prev.peakTps, tps),
          totalTransactions: Math.max(
            prev.totalTransactions,
            totalTransactionsRef.current,
          ),
          history: nextHistory,
        }
      })
    })

    return unsubscribe
  }, [subscribeToTps])

  return tpsData
}
