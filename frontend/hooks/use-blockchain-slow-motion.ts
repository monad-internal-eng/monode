'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  SLOW_MOTION_DURATION_SECONDS,
  SLOW_MOTION_EVENT_INTERVAL_MS,
} from '@/constants/block-state'
import type { SerializableEventData } from '@/types/events'

interface UseSlowMotionOptions {
  onProcessEvent: (event: SerializableEventData) => void
  onFlushEvents: (events: SerializableEventData[]) => void
}

interface UseSlowMotionReturnType {
  isSlowMotion: boolean
  remainingSeconds: number
  startSlowMotion: () => void
  stopSlowMotion: () => void
  queueEvent: (event: SerializableEventData) => void
}

export function useBlockchainSlowMotion({
  onProcessEvent,
  onFlushEvents,
}: UseSlowMotionOptions): UseSlowMotionReturnType {
  const [isSlowMotion, setIsSlowMotion] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  const eventQueueRef = useRef<SerializableEventData[]>([])
  const processIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isSlowMotionRef = useRef(false)
  const endTimeRef = useRef<number>(0)

  // Keep refs in sync with callbacks to avoid stale closures
  const onProcessEventRef = useRef(onProcessEvent)
  const onFlushEventsRef = useRef(onFlushEvents)

  useEffect(() => {
    onProcessEventRef.current = onProcessEvent
    onFlushEventsRef.current = onFlushEvents
  }, [onProcessEvent, onFlushEvents])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (processIntervalRef.current) {
      clearInterval(processIntervalRef.current)
      processIntervalRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

  // Stop slow motion and flush remaining events
  const stopSlowMotion = useCallback(() => {
    cleanup()

    // Flush all remaining queued events
    const remainingEvents = [...eventQueueRef.current]
    eventQueueRef.current = []

    if (remainingEvents.length > 0) {
      onFlushEventsRef.current(remainingEvents)
    }

    isSlowMotionRef.current = false
    setIsSlowMotion(false)
    setRemainingSeconds(0)
  }, [cleanup])

  // Calculate remaining seconds from end time (handles background tab throttling)
  const updateRemainingSeconds = useCallback(() => {
    const now = Date.now()
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000))
    setRemainingSeconds(remaining)

    if (remaining <= 0 && isSlowMotionRef.current) {
      stopSlowMotion()
    }
  }, [stopSlowMotion])

  // Start slow motion mode
  const startSlowMotion = useCallback(() => {
    if (isSlowMotionRef.current) return

    isSlowMotionRef.current = true
    setIsSlowMotion(true)
    endTimeRef.current = Date.now() + SLOW_MOTION_DURATION_SECONDS * 1000
    setRemainingSeconds(SLOW_MOTION_DURATION_SECONDS)
    eventQueueRef.current = []

    // Start the slow processing interval
    processIntervalRef.current = setInterval(() => {
      if (eventQueueRef.current.length > 0) {
        const event = eventQueueRef.current.shift()
        if (event) {
          onProcessEventRef.current(event)
        }
      }
    }, SLOW_MOTION_EVENT_INTERVAL_MS)

    // Start the countdown timer using timestamp-based calculation
    countdownIntervalRef.current = setInterval(updateRemainingSeconds, 1000)
  }, [updateRemainingSeconds])

  // Queue an event (called from the event handler)
  const queueEvent = useCallback((event: SerializableEventData) => {
    if (isSlowMotionRef.current) {
      eventQueueRef.current.push(event)
    } else {
      // Normal mode - process immediately
      onProcessEventRef.current(event)
    }
  }, [])

  // Handle visibility change to update timer when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isSlowMotionRef.current) {
        updateRemainingSeconds()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [updateRemainingSeconds])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
      eventQueueRef.current = []
    }
  }, [cleanup])

  return {
    isSlowMotion,
    remainingSeconds,
    startSlowMotion,
    stopSlowMotion,
    queueEvent,
  }
}
