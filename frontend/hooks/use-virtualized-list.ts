'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ListImperativeAPI } from 'react-window'

interface UseVirtualizedListOptions<T> {
  data: T[]
  isFollowing: boolean
  gridClass: string
}

interface VirtualizedRowProps<T> {
  data: T[]
  gridClass: string
}

interface UseVirtualizedListReturn<T> {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  listRef: React.RefObject<ListImperativeAPI | null>
  containerHeight: number
  displayedData: T[]
  rowProps: VirtualizedRowProps<T>
}

export function useVirtualizedList<T>({
  data,
  isFollowing,
  gridClass,
}: UseVirtualizedListOptions<T>): UseVirtualizedListReturn<T> {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<ListImperativeAPI>(null)
  const [containerHeight, setContainerHeight] = useState(384)

  // Freeze data when paused - this prevents re-renders while paused
  const [displayedData, setDisplayedData] = useState<T[]>(data)

  // Update displayed data only when following
  useEffect(() => {
    if (!isFollowing) return

    setDisplayedData((prev) => (Object.is(prev, data) ? prev : data))
  }, [data, isFollowing])

  // Auto-scroll to top when following and new data arrives
  useEffect(() => {
    if (!isFollowing || displayedData.length === 0 || !listRef.current) return

    // Use requestAnimationFrame to ensure the List has updated before scrolling.
    requestAnimationFrame(() => {
      listRef.current?.scrollToRow({
        index: 0,
        align: 'start',
        behavior: 'smooth',
      })
    })
  }, [displayedData, isFollowing])

  // Reset horizontal scroll when resuming (isFollowing becomes true)
  useEffect(() => {
    if (isFollowing && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0
    }
  }, [isFollowing])

  // Memoize rowProps so react-window re-renders rows when data changes,
  // even if the list length stays constant (e.g. when capped at max items).
  const rowProps = useMemo(
    () => ({ data: displayedData, gridClass }),
    [displayedData, gridClass],
  )

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
    scrollContainerRef,
    containerRef,
    listRef,
    containerHeight,
    displayedData,
    rowProps,
  }
}
