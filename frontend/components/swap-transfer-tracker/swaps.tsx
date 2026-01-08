'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { useVerticalScroll } from '@/hooks/use-vertical-scroll'
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
  swaps: SwapData[]
  gridClass: string
}

function SwapCell({
  index,
  style,
  swaps,
  gridClass,
}: RowComponentProps<SwapRowData>) {
  const swap = swaps[index]

  return (
    <div style={style}>
      <SwapRow swap={swap} gridClass={gridClass} />
    </div>
  )
}

export function Swaps({ data, isLoading, isFollowing }: SwapsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(384)

  // Reverse swaps so newest items are at the bottom
  const reversedSwaps = useMemo(() => [...data].reverse(), [data])

  const { listRef } = useVerticalScroll({
    items: reversedSwaps,
    isFollowing,
  })

  const rowProps = useMemo(
    () => ({ swaps: reversedSwaps, gridClass: TABLE_GRID }),
    [reversedSwaps],
  )

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

  // Prevent scroll with non-passive event listener when following
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
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-400">
              {isLoading ? 'Waiting for events...' : 'No swaps yet'}
            </p>
          </div>
        ) : (
          <List
            listRef={listRef}
            rowComponent={SwapCell}
            rowCount={reversedSwaps.length}
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
