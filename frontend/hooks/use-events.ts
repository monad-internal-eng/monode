'use client'

import { useEffect, useRef } from 'react'
import { useEventsContext } from '@/contexts/events-context'
import type { EventName, SerializableEventData } from '@/types/events'

interface UseEventsOptions {
  subscribeToEvents?: EventName[]
  onEvent?: (event: SerializableEventData) => void
}

/**
 * A hook that subscribes to events and provides the events to the component.
 */
export function useEvents(options: UseEventsOptions = {}) {
  const { subscribeToEvents = [], onEvent } = options
  const { accountAccesses, storageAccesses, events, isConnected, subscribe } =
    useEventsContext()
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (subscribeToEvents.length === 0 && !onEvent) {
      return
    }

    const unsubscribe = subscribe(subscribeToEvents, (event) => {
      onEventRef.current?.(event)
    })

    return unsubscribe
  }, [subscribeToEvents, onEvent, subscribe])

  return { accountAccesses, storageAccesses, events, isConnected }
}
