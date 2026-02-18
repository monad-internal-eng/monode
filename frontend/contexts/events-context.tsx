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
import type { ContentionData } from '@/types/contention'
import type { SerializableEventData } from '@/types/events'

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
  ContentionData?: ContentionData
}

interface EventsContextValue {
  accountAccesses: AccessEntry<string>[]
  storageAccesses: AccessEntry<[string, string]>[]
  events: SerializableEventData[]
  isConnected: boolean
  subscribe: (callback: (event: SerializableEventData) => void) => () => void
  subscribeToTps: (callback: (tps: number) => void) => () => void
  subscribeToContention: (
    callback: (data: ContentionData) => void,
  ) => () => void
}

interface EventsProviderProps {
  children: ReactNode
}

const EventsContext = createContext<EventsContextValue | null>(null)

const RECONNECT_DELAY = 3000
const MAX_EVENTS_STORED = 25000

/**
 * A context provider for the events context.
 * It handles the WebSocket connection and receives events from the server.
 * The server uses restricted filters to determine which events to send.
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
  const contentionSubscribersRef = useRef<
    Map<string, (data: ContentionData) => void>
  >(new Map())

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

            if (message.ContentionData) {
              const data = message.ContentionData
              contentionSubscribersRef.current.forEach((callback) => {
                callback(data)
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

  const subscribe = useCallback(
    (callback: (event: SerializableEventData) => void): (() => void) => {
      const subscriberId = Math.random().toString(36).slice(2)
      subscribersRef.current.set(subscriberId, callback)

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

  const subscribeToContention = useCallback(
    (callback: (data: ContentionData) => void) => {
      const subscriberId = Math.random().toString(36).slice(2)
      contentionSubscribersRef.current.set(subscriberId, callback)

      return () => {
        contentionSubscribersRef.current.delete(subscriberId)
      }
    },
    [],
  )

  const value: EventsContextValue = {
    accountAccesses,
    storageAccesses,
    events,
    isConnected,
    subscribe,
    subscribeToTps,
    subscribeToContention,
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
