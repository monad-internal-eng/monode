'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEvents } from '@/hooks/use-events'
import type { SerializableEventData } from '@/types/events'

const PUBLISH_INTERVAL_MS = 1000

/**
 * Counts total transactions by observing `TxnHeaderStart`, but only publishes
 * the total into React state on a fixed interval to reduce UI churn.
 */
export function useTotalTransactions(): number {
  const totalTransactionsRef = useRef(0)
  const [publishedTotalTransactions, setPublishedTotalTransactions] =
    useState(0)

  const handleTxnEvent = useCallback((event: SerializableEventData) => {
    if (event.payload.type === 'TxnHeaderStart') {
      totalTransactionsRef.current += 1
    }
  }, [])

  useEvents({
    onEvent: handleTxnEvent,
  })

  useEffect(() => {
    const intervalId = setInterval(() => {
      const next = totalTransactionsRef.current
      setPublishedTotalTransactions((prev) => Math.max(prev, next))
    }, PUBLISH_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [PUBLISH_INTERVAL_MS])

  return publishedTotalTransactions
}
