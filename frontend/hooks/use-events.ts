'use client'

import { useEffect, useRef } from 'react'
import { useEventsContext } from '@/contexts/events-context'
import type { EventName, SerializableEventData } from '@/types/events'

interface UseEventsOptions {
  subscribeToEvents?: readonly EventName[]
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

  // Stringify events array to create stable dependency (avoids re-subscribing on array reference changes)
  const eventsKey = subscribeToEvents.join(',')

  useEffect(() => {
    if (subscribeToEvents.length === 0) {
      return
    }

    const unsubscribe = subscribe([...subscribeToEvents], (event) => {
      onEventRef.current?.(event)
    })

    return unsubscribe
  }, [eventsKey, subscribe])

  return { accountAccesses, storageAccesses, events, isConnected }
}
