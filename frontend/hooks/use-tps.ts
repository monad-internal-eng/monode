'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEvents } from '@/hooks/use-events'
import type { SerializableEventData } from '@/types/events'

/** Interval for calculating TPS (1 second) */
const TPS_INTERVAL_MS = 1000

/** Duration of TPS history to keep (5 minutes) */
const TPS_HISTORY_DURATION_MS = 5 * 60 * 1000

/** Maximum number of data points in history (5 minutes * 1 sample/second) */
const MAX_HISTORY_LENGTH = TPS_HISTORY_DURATION_MS / TPS_INTERVAL_MS

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
 * Hook to calculate and track TPS (Transactions Per Second) from execution events.
 * Subscribes to TxnHeaderStart events and calculates TPS every second.
 * Maintains a rolling 5-minute history for charting.
 */
export function useTps(): TpsData {
  const [tpsData, setTpsData] = useState<TpsData>({
    currentTps: 0,
    peakTps: 0,
    totalTransactions: 0,
    history: [],
  })

  const txCountRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleEvent = useCallback((event: SerializableEventData) => {
    if (event.payload.type === 'TxnHeaderStart') {
      txCountRef.current += 1
    }
  }, [])

  useEvents({
    filters: [{ eventName: 'TxnHeaderStart' }],
    onEvent: handleEvent,
  })

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const count = txCountRef.current
      txCountRef.current = 0
      const now = Date.now()

      setTpsData((prev) => {
        const newDataPoint: TpsDataPoint = { timestamp: now, tps: count }

        // Keep only the last 5 minutes of data
        const cutoffTime = now - TPS_HISTORY_DURATION_MS
        const filteredHistory = prev.history.filter(
          (point) => point.timestamp > cutoffTime
        )

        return {
          currentTps: count,
          peakTps: Math.max(prev.peakTps, count),
          totalTransactions: prev.totalTransactions + count,
          history: [...filteredHistory, newDataPoint].slice(-MAX_HISTORY_LENGTH),
        }
      })
    }, TPS_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return tpsData
}
