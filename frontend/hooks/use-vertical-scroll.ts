'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import type { ListImperativeAPI } from 'react-window'

interface UseTransfersScrollOptions<T> {
  items: T[]
  isFollowing: boolean
}

export function useVerticalScroll<T>({
  items,
  isFollowing,
}: UseTransfersScrollOptions<T>) {
  const listRef = useRef<ListImperativeAPI>(null)
  const prevItemsLengthRef = useRef<number>(0)
  const wasHiddenRef = useRef(false)

  // Handle new items being added
  useLayoutEffect(() => {
    if (!listRef.current || items.length === 0) return

    const prevLength = prevItemsLengthRef.current
    const hasNewItems = prevLength === 0 || items.length > prevLength

    if (hasNewItems && isFollowing) {
      // When following, auto-scroll to the bottom (newest items)
      requestAnimationFrame(() => {
        listRef.current?.scrollToRow({
          index: items.length - 1,
          align: 'end',
          behavior: 'smooth',
        })
      })
    }

    prevItemsLengthRef.current = items.length
  }, [items.length, isFollowing])

  // Handle tab visibility changes - scroll to top when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        wasHiddenRef.current = true
      } else if (
        document.visibilityState === 'visible' &&
        wasHiddenRef.current &&
        isFollowing &&
        items.length > 0
      ) {
        // Tab became visible after being hidden - scroll to bottom immediately
        listRef.current?.scrollToRow({
          index: items.length - 1,
          align: 'end',
          behavior: 'auto',
        })
        wasHiddenRef.current = false
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isFollowing, items.length])

  return { listRef }
}
