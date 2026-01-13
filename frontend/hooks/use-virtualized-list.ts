'use client'

import { useEffect, useRef, useState } from 'react'
import type { ListImperativeAPI } from 'react-window'

interface UseVirtualizedListOptions<T> {
  data: T[]
  isFollowing: boolean
  gridClass: string
}

interface UseVirtualizedListReturn<T> {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<ListImperativeAPI>(null)
  const [containerHeight, setContainerHeight] = useState(384)

  // Freeze data when paused - this prevents re-renders while paused
  const [displayedData, setDisplayedData] = useState<T[]>(data)
  const [dataVersion, setDataVersion] = useState(0)

  // Update displayed data only when following
  useEffect(() => {
    if (isFollowing) {
      setDisplayedData(data)
      setDataVersion((prev) => prev + 1)
    }
  }, [data, isFollowing])

  // Store displayed data in ref for stable rowProps
  const dataRef = useRef<T[]>(displayedData)
  dataRef.current = displayedData

  // Auto-scroll to top when following and new data arrives
  useEffect(() => {
    if (
      isFollowing &&
      displayedData.length > 0 &&
      listRef.current &&
      dataVersion > 0
    ) {
      // Use requestAnimationFrame to ensure the List has updated before scrolling
      requestAnimationFrame(() => {
        if (listRef.current) {
          // Force scroll to top to show newest data
          listRef.current.scrollToRow({
            index: 0,
            align: 'start',
            behavior: 'auto', // Use 'auto' for immediate scroll when following
          })
        }
      })
    }
  }, [dataVersion, isFollowing])

  // Reset horizontal scroll when resuming (isFollowing becomes true)
  useEffect(() => {
    if (isFollowing && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0
    }
  }, [isFollowing])

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

  return {
    scrollContainerRef,
    containerRef,
    listRef,
    containerHeight,
    displayedData,
    dataRef,
    rowProps,
  }
}
