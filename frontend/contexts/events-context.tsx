'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type {
  EventName,
  FieldFilter,
  SerializableEventData,
} from '@/types/events'

interface AccessEntry<T> {
  key: T
  count: number
}

interface TopAccessesData {
  account: AccessEntry<string>[]
  storage: AccessEntry<[string, string]>[]
}

interface ServerMessage {
  Events?: SerializableEventData[]
  TopAccesses?: TopAccessesData
  TPS?: number
}

interface EventFilter {
  event_name: EventName
  field_filters?: FieldFilter[]
}

interface ClientMessage {
  type: 'subscribe'
  event_filters: EventFilter[]
}

export interface SubscribeOptions {
  eventName: EventName
  fieldFilters?: FieldFilter[]
}

interface EventsContextValue {
  accountAccesses: AccessEntry<string>[]
  storageAccesses: AccessEntry<[string, string]>[]
  events: SerializableEventData[]
  isConnected: boolean
  subscribe: (
    filters: SubscribeOptions[],
    callback: (event: SerializableEventData) => void,
  ) => () => void
  subscribeToTps: (callback: (tps: number) => void) => () => void
}

interface EventsProviderProps {
  children: ReactNode
}

const EventsContext = createContext<EventsContextValue | null>(null)

const RECONNECT_DELAY = 3000
const MAX_EVENTS_STORED = 10000

/**
 * A context provider for the events context.
 * It handles the WebSocket connection and the subscription to events.
 */
export function EventsProvider({ children }: EventsProviderProps) {
  const [accountAccesses, setAccountAccesses] = useState<AccessEntry<string>[]>(
    [],
  )
  const [storageAccesses, setStorageAccesses] = useState<
    AccessEntry<[string, string]>[]
  >([])
  const [events, setEvents] = useState<SerializableEventData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const subscribersRef = useRef<
    Map<string, (event: SerializableEventData) => void>
  >(new Map())
  const tpsSubscribersRef = useRef<Map<string, (tps: number) => void>>(
    new Map(),
  )
  const subscribedFiltersRef = useRef<EventFilter[]>([])

  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    const connect = () => {
      try {
        const url = process.env.NEXT_PUBLIC_EVENTS_WS_URL

        if (!url) {
          throw new Error('NEXT_PUBLIC_EVENTS_WS_URL is not set')
        }

        ws = new WebSocket(url)
        wsRef.current = ws

        ws.onopen = () => {
          setIsConnected(true)

          // Subscribe to all events that components have requested
          const subscribeMsg: ClientMessage = {
            type: 'subscribe',
            event_filters: subscribedFiltersRef.current,
          }
          ws?.send(JSON.stringify(subscribeMsg))
        }

        ws.onmessage = (event) => {
          try {
            const message: ServerMessage = JSON.parse(event.data)

            if (message.TopAccesses) {
              setAccountAccesses(message.TopAccesses.account)
              setStorageAccesses(message.TopAccesses.storage)
            }

            if (typeof message.TPS === 'number') {
              const tps = message.TPS
              tpsSubscribersRef.current.forEach((callback) => {
                callback(tps)
              })
            }

            if (message.Events && message.Events.length > 0) {
              const newEvents = message.Events
              setEvents((prevEvents) =>
                [...prevEvents, ...newEvents].slice(-MAX_EVENTS_STORED),
              )

              // Notify all subscribers
              newEvents.forEach((evt) => {
                subscribersRef.current.forEach((callback) => {
                  callback(evt)
                })
              })
            }
          } catch (error) {
            console.error('Failed to parse message:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
        }

        ws.onclose = () => {
          setIsConnected(false)
          wsRef.current = null

          reconnectTimeout = setTimeout(() => {
            connect()
          }, RECONNECT_DELAY)
        }
      } catch (error) {
        console.error('Failed to connect:', error)
        reconnectTimeout = setTimeout(() => {
          connect()
        }, RECONNECT_DELAY)
      }
    }

    connect()

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (ws) {
        ws.close()
      }
    }
  }, [])

  const filtersEqual = (a: EventFilter, b: EventFilter): boolean => {
    if (a.event_name !== b.event_name) {
      return false
    }

    const aFilters = a.field_filters ?? []
    const bFilters = b.field_filters ?? []

    if (aFilters.length !== bFilters.length) {
      return false
    }

    return aFilters.every((aFilter) => {
      return bFilters.some((bFilter) => {
        if (aFilter.field !== bFilter.field) {
          return false
        }

        const aFilterKeys = Object.keys(aFilter.filter).sort()
        const bFilterKeys = Object.keys(bFilter.filter).sort()

        if (aFilterKeys.join(',') !== bFilterKeys.join(',')) {
          return false
        }

        return aFilterKeys.every((key) => {
          const aFilterObj = aFilter.filter as Record<string, unknown>
          const bFilterObj = bFilter.filter as Record<string, unknown>
          const aVal = aFilterObj[key]
          const bVal = bFilterObj[key]

          if (Array.isArray(aVal) && Array.isArray(bVal)) {
            return (
              aVal.length === bVal.length && aVal.every((v, i) => v === bVal[i])
            )
          }

          return aVal === bVal
        })
      })
    })
  }

  const subscribe = useCallback(
    (
      filters: SubscribeOptions[],
      callback: (event: SerializableEventData) => void,
    ): (() => void) => {
      const subscriberId = Math.random().toString(36).slice(2)
      subscribersRef.current.set(subscriberId, callback)

      const newFilters: EventFilter[] = filters.map((f) => ({
        event_name: f.eventName,
        field_filters: f.fieldFilters,
      }))

      const hasNewFilters = newFilters.some((newFilter) => {
        return !subscribedFiltersRef.current.some((existingFilter) =>
          filtersEqual(existingFilter, newFilter),
        )
      })

      if (hasNewFilters) {
        subscribedFiltersRef.current = [
          ...subscribedFiltersRef.current,
          ...newFilters.filter((newFilter) => {
            return !subscribedFiltersRef.current.some((existingFilter) =>
              filtersEqual(existingFilter, newFilter),
            )
          }),
        ]

        // If connected, update subscription
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const subscribeMsg: ClientMessage = {
            type: 'subscribe',
            event_filters: subscribedFiltersRef.current,
          }
          wsRef.current.send(JSON.stringify(subscribeMsg))
        }
      }

      // Return unsubscribe function
      return () => {
        subscribersRef.current.delete(subscriberId)
      }
    },
    [],
  )

  const subscribeToTps = useCallback((callback: (tps: number) => void) => {
    const subscriberId = Math.random().toString(36).slice(2)
    tpsSubscribersRef.current.set(subscriberId, callback)

    return () => {
      tpsSubscribersRef.current.delete(subscriberId)
    }
  }, [])

  const value: EventsContextValue = {
    accountAccesses,
    storageAccesses,
    events,
    isConnected,
    subscribe,
    subscribeToTps,
  }

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  )
}

export function useEventsContext() {
  const context = useContext(EventsContext)
  if (!context) {
    throw new Error('useEventsContext must be used within EventsProvider')
  }
  return context
}
