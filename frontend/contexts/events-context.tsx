'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { EventName, SerializableEventData } from '@/types/events'

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
}

interface ClientMessage {
  type: 'subscribe'
  events: EventName[]
}

interface EventsContextValue {
  accountAccesses: AccessEntry<string>[]
  storageAccesses: AccessEntry<[string, string]>[]
  events: SerializableEventData[]
  isConnected: boolean
  subscribe: (
    events: EventName[],
    callback: (event: SerializableEventData) => void,
  ) => () => void
}

interface EventsProviderProps {
  children: ReactNode
}

const EventsContext = createContext<EventsContextValue | null>(null)

const RECONNECT_DELAY = 3000

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
  const subscribedEventsRef = useRef<Set<EventName>>(new Set())

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
            events: Array.from(subscribedEventsRef.current),
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

            if (message.Events && message.Events.length > 0) {
              const newEvents = message.Events
              setEvents((prevEvents) => [...prevEvents, ...newEvents])

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

  const subscribe = (
    eventNames: EventName[],
    callback: (event: SerializableEventData) => void,
  ): (() => void) => {
    const subscriberId = Math.random().toString(36).slice(2)
    subscribersRef.current.set(subscriberId, callback)

    // Track requested event types
    const newEvents = eventNames.filter(
      (e) => !subscribedEventsRef.current.has(e),
    )
    if (newEvents.length > 0) {
      newEvents.forEach((e) => subscribedEventsRef.current.add(e))

      // If connected, update subscription
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const subscribeMsg: ClientMessage = {
          type: 'subscribe',
          events: Array.from(subscribedEventsRef.current),
        }
        wsRef.current.send(JSON.stringify(subscribeMsg))
      }
    }

    // Return unsubscribe function
    return () => {
      subscribersRef.current.delete(subscriberId)
    }
  }

  const value: EventsContextValue = {
    accountAccesses,
    storageAccesses,
    events,
    isConnected,
    subscribe,
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
