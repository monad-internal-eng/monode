'use client'

import type { ReactElement } from 'react'
import { useEffect, useRef, useState } from 'react'
import { List, type ListImperativeAPI, type RowComponentProps } from 'react-window'
import { cn } from '@/lib/utils'
import type { SwapData } from '@/types/swap'
import { SwapRow } from './swap-row'

interface SwapsProps {
  data: SwapData[]
  isLoading: boolean
  isFollowing: boolean
}

const TABLE_GRID = 'grid grid-cols-6 gap-6 px-4'
const ROW_HEIGHT = 45

interface SwapRowData {
  swapsRef: React.RefObject<SwapData[]>
  gridClass: string
}

// Cell component defined outside to maintain stable reference
function SwapCell({
  index,
  style,
  swapsRef,
  gridClass,
}: RowComponentProps<SwapRowData>): ReactElement {
  const swap = swapsRef.current?.[index]

  return (
    <div style={style}>
      {swap && <SwapRow swap={swap} gridClass={gridClass} />}
    </div>
  )
}

// Stable rowProps object
const STABLE_GRID_CLASS = TABLE_GRID

export function Swaps({ data, isLoading, isFollowing }: SwapsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<ListImperativeAPI>(null)
  const [containerHeight, setContainerHeight] = useState(384)

  // Freeze data when paused - this prevents ALL re-renders while paused
  const [displayedData, setDisplayedData] = useState<SwapData[]>(data)
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
  const swapsRef = useRef<SwapData[]>(displayedData)
  swapsRef.current = displayedData

  // Auto-scroll to top when following and new data arrives
  useEffect(() => {
    if (isFollowing && displayedData.length > 0 && listRef.current) {
      listRef.current.scrollToRow({ index: 0, align: 'start', behavior: 'auto' })
    }
  }, [displayedData.length, isFollowing])

  // Stable rowProps - swapsRef never changes reference, only its .current
  const rowPropsRef = useRef({ swapsRef, gridClass: STABLE_GRID_CLASS })
  const rowProps = rowPropsRef.current

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

  return (
    <div className="flex flex-col min-w-4xl lg:min-w-0">
      <div
        className={cn(
          'py-3 text-xs font-medium text-zinc-400 border-b border-zinc-800',
          TABLE_GRID,
        )}
      >
        <span>Transaction Hash</span>
        <span>From Token</span>
        <span>To Token</span>
        <span>Provider</span>
        <span>Sender</span>
        <span>Time</span>
      </div>

      <div ref={containerRef} className="h-96">
        {displayedData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-400">
              {isLoading ? 'Waiting for events...' : 'No swaps yet'}
            </p>
          </div>
        ) : (
          <List
            listRef={listRef}
            rowComponent={SwapCell}
            rowCount={displayedData.length}
            rowHeight={ROW_HEIGHT}
            defaultHeight={containerHeight}
            rowProps={rowProps}
            style={{
              overflowX: 'hidden',
              overflowY: isFollowing ? 'hidden' : 'auto',
            }}
            className="scrollbar-none"
          />
        )}
      </div>
    </div>
  )
}
