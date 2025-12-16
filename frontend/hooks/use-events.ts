'use client'

import { useEffect, useRef } from 'react'
import {
  type SubscribeOptions as EventFilterOption,
  useEventsContext,
} from '@/contexts/events-context'
import type { SerializableEventData } from '@/types/events'

interface UseEventsOptions {
  filters?: EventFilterOption[]
  onEvent?: (event: SerializableEventData) => void
}

/**
 * A hook that subscribes to events with optional field filters.
 *
 * @example Basic usage (subscribe to all events of a type)
 * ```tsx
 * const { events, isConnected } = useEvents({
 *   filters: [
 *     { eventName: 'BlockStart' },
 *     { eventName: 'TxnHeaderStart' }
 *   ]
 * })
 * ```
 *
 * @example With field filters (topics filter)
 * ```tsx
 * const { events, isConnected } = useEvents({
 *   filters: [
 *     {
 *       eventName: 'TxnLog',
 *       fieldFilters: [
 *         { field: 'address', filter: { values: ['0x...'] } },
 *         { field: 'topics', filter: { values: ['0x...'] } }
 *       ]
 *     }
 *   ]
 * })
 * ```
 */
export function useEvents(options: UseEventsOptions = {}) {
  const { filters = [], onEvent } = options
  const { accountAccesses, storageAccesses, events, isConnected, subscribe } =
    useEventsContext()
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  // Stringify filters array to create stable dependency (avoids re-subscribing on array reference changes)
  const filtersKey = filters.map((filter) => JSON.stringify(filter)).join(',')

  useEffect(() => {
    if (filters.length === 0 && !onEvent) {
      return
    }

    const unsubscribe = subscribe([...filters], (event) => {
      onEventRef.current?.(event)
    })

    return unsubscribe
  }, [filtersKey, onEvent, subscribe])

  return { accountAccesses, storageAccesses, events, isConnected }
}
