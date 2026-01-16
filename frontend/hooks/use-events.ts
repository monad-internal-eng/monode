'use client'

import { useEffect, useRef } from 'react'
import { useEventsContext } from '@/contexts/events-context'
import type { SerializableEventData } from '@/types/events'

interface UseEventsOptions {
  onEvent?: (event: SerializableEventData) => void
}

/**
 * A hook that subscribes to events from the server.
 *
 * @example Basic usage
 * ```tsx
 * const { events, isConnected } = useEvents()
 * ```
 *
 * @example With event callback
 * ```tsx
 * const { events, isConnected } = useEvents({
 *   onEvent: (event) => console.log('New event:', event)
 * })
 * ```
 */
export function useEvents(options: UseEventsOptions = {}) {
  const { onEvent } = options
  const { accountAccesses, storageAccesses, events, isConnected, subscribe } =
    useEventsContext()
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!onEvent) {
      return
    }

    const unsubscribe = subscribe((event) => {
      onEventRef.current?.(event)
    })

    return unsubscribe
  }, [onEvent, subscribe])

  return { accountAccesses, storageAccesses, events, isConnected }
}
