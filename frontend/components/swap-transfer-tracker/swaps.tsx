'use client'

import type { ReactElement } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { useMouseHover } from '@/hooks/use-mouse-hover'
import { useVirtualizedList } from '@/hooks/use-virtualized-list'
import { cn } from '@/lib/utils'
import type { SwapData } from '@/types/swap'
import { SwapRow } from './swap-row'

interface SwapsProps {
  data: SwapData[]
  isLoading: boolean
  isFollowingData: boolean
}

const TABLE_GRID = 'grid grid-cols-6 gap-6 px-4'
const ROW_HEIGHT = 45

interface SwapRowData {
  dataRef: React.RefObject<SwapData[]>
  gridClass: string
}

// Cell component defined outside to maintain stable reference
function SwapCell({
  index,
  style,
  dataRef,
  gridClass,
}: RowComponentProps<SwapRowData>): ReactElement {
  const swap = dataRef.current?.[index]

  return (
    <div style={style}>
      {swap && <SwapRow swap={swap} gridClass={gridClass} />}
    </div>
  )
}

export function Swaps({ data, isLoading, isFollowingData }: SwapsProps) {
  const { isHovering, hoverProps } = useMouseHover()
  const isFollowing = isFollowingData && !isHovering

  const {
    scrollContainerRef,
    containerRef,
    listRef,
    containerHeight,
    displayedData,
    rowProps,
  } = useVirtualizedList({
    data,
    isFollowing,
    gridClass: TABLE_GRID,
  })

  return (
    <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-none">
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

        <div ref={containerRef} className="h-96" {...hoverProps}>
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
    </div>
  )
}
