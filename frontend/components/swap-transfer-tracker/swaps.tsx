'use client'

import type { ReactElement } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { useMouseHover } from '@/hooks/use-mouse-hover'
import { useVirtualizedList } from '@/hooks/use-virtualized-list'
import { cn } from '@/lib/utils'
import type { SwapData } from '@/types/swap'
import { CornerDecorationsContainer } from '../ui/corner-decorations-container'
import { SwapRow } from './swap-row'

interface SwapsProps {
  data: SwapData[]
  isLoading: boolean
  isFollowingData: boolean
}

const TABLE_GRID = 'flex justify-between items-center py-4 px-6'
const ROW_HEIGHT = 56

interface SwapRowData {
  data: SwapData[]
  gridClass: string
}

// Cell component defined outside to maintain stable reference
function SwapCell({
  index,
  style,
  data,
  gridClass,
}: RowComponentProps<SwapRowData>): ReactElement {
  const swap = data[index]

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
    <CornerDecorationsContainer className="flex flex-col mx-6 mb-6 sm:mx-10 sm:mb-10">
      {/* Table - horizontally scrollable */}
      <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-none">
        <div className="min-w-4xl lg:min-w-0">
          <div
            className={cn(
              'h-14 text-xs font-mono font-medium text-zinc-400 uppercase tracking-wide border-b',
              TABLE_GRID,
            )}
          >
            <span className="w-32">Transaction Hash</span>
            <span className="w-28 text-right">From Token</span>
            <span className="w-28 text-right">To Token</span>
            <span className="w-32">Provider</span>
            <span className="w-32">Sender</span>
            <span className="w-24">Time</span>
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
    </CornerDecorationsContainer>
  )
}
