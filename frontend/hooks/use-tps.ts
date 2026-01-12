'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEventsContext } from '@/contexts/events-context'
import { useEvents } from '@/hooks/use-events'
import type { SerializableEventData } from '@/types/events'

/** Bucket size for TPS charting */
const TPS_BUCKET_MS = 1000

/** Duration of TPS history to keep */
const TPS_HISTORY_DURATION_MS = 5 * 60 * 1000

/** Maximum number of points to keep in history */
const MAX_HISTORY_LENGTH = TPS_HISTORY_DURATION_MS / TPS_BUCKET_MS

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
      const bucketTimestamp = Math.floor(now / TPS_BUCKET_MS) * TPS_BUCKET_MS

      setTpsData((prev) => {
        // Keep only the last 5 minutes of data
        const cutoffTime = bucketTimestamp - TPS_HISTORY_DURATION_MS
        const filteredHistory = prev.history.filter((point) => {
          return point.timestamp > cutoffTime
        })

        const lastPoint = filteredHistory[filteredHistory.length - 1]
        const nextHistory =
          lastPoint?.timestamp === bucketTimestamp
            ? [
                ...filteredHistory.slice(0, -1),
                { timestamp: bucketTimestamp, tps },
              ]
            : [...filteredHistory, { timestamp: bucketTimestamp, tps }]

        return {
          currentTps: tps,
          peakTps: Math.max(prev.peakTps, tps),
          totalTransactions: Math.max(
            prev.totalTransactions,
            totalTransactionsRef.current,
          ),
          history: nextHistory.slice(-MAX_HISTORY_LENGTH),
        }
      })
    })

    return unsubscribe
  }, [subscribeToTps])

  return tpsData
}
