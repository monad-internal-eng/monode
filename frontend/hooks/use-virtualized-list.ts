'use client'

import { useEffect, useRef, useState } from 'react'
import type { ListImperativeAPI } from 'react-window'

interface UseVirtualizedListOptions<T> {
  data: T[]
  isFollowing: boolean
  gridClass: string
}

interface UseVirtualizedListReturn<T> {
  containerRef: React.RefObject<HTMLDivElement | null>
  listRef: React.RefObject<ListImperativeAPI | null>
  containerHeight: number
  displayedData: T[]
  dataRef: React.RefObject<T[]>
  rowProps: { dataRef: React.RefObject<T[]>; gridClass: string }
}

export function useVirtualizedList<T>({
  data,
  isFollowing,
  gridClass,
}: UseVirtualizedListOptions<T>): UseVirtualizedListReturn<T> {
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<ListImperativeAPI>(null)
  const [containerHeight, setContainerHeight] = useState(384)

  // Freeze data when paused - this prevents ALL re-renders while paused
  const [displayedData, setDisplayedData] = useState<T[]>(data)
  const wasFollowingRef = useRef(isFollowing)

  // Update displayed data only when following, or when resuming from pause
  useEffect(() => {
    if (isFollowing) {
      setDisplayedData(data)
    }
    // If we just resumed from pause, update to latest
    if (isFollowing && !wasFollowingRef.current) {
      setDisplayedData(data)
    }
    wasFollowingRef.current = isFollowing
  }, [data, isFollowing])

  // Store displayed data in ref for stable rowProps
  const dataRef = useRef<T[]>(displayedData)
  dataRef.current = displayedData

  // Auto-scroll to top when following and new data arrives
  useEffect(() => {
    if (isFollowing && displayedData.length > 0 && listRef.current) {
      listRef.current.scrollToRow({
        index: 0,
        align: 'start',
        behavior: 'smooth',
      })
    }
  }, [displayedData.length, isFollowing])

  // Stable rowProps - dataRef never changes reference, only its .current
  const rowPropsRef = useRef({ dataRef, gridClass })
  const rowProps = rowPropsRef.current

  // Update container height on resize
  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateHeight = () => {
      setContainerHeight(node.clientHeight)
    }
    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(node)
    return () => resizeObserver.disconnect()
  }, [])

  // Prevent scroll when following
  useEffect(() => {
    const node = containerRef.current
    if (!node || !isFollowing) return

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault()
    }

    node.addEventListener('wheel', preventScroll, { passive: false })
    return () => node.removeEventListener('wheel', preventScroll)
  }, [isFollowing])

  return {
    containerRef,
    listRef,
    containerHeight,
    displayedData,
    dataRef,
    rowProps,
  }
}
