'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEvents } from '@/hooks/use-events'
import type { SerializableEventData } from '@/types/events'

const TPS_INTERVAL_MS = 1000

interface TpsData {
  currentTps: number
  peakTps: number
  totalTransactions: number
}

/**
 * Hook to calculate and track TPS (Transactions Per Second) from execution events.
 * Subscribes to TxnHeaderStart events and calculates TPS every second.
 */
export function useTps() {
  const [tpsData, setTpsData] = useState<TpsData>({
    currentTps: 0,
    peakTps: 0,
    totalTransactions: 0,
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

      setTpsData((prev) => ({
        currentTps: count,
        peakTps: Math.max(prev.peakTps, count),
        totalTransactions: prev.totalTransactions + count,
      }))
    }, TPS_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return tpsData
}
