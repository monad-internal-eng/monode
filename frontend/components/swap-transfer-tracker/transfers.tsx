'use client'

import type { ReactElement } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { useMouseHover } from '@/hooks/use-mouse-hover'
import { useVirtualizedList } from '@/hooks/use-virtualized-list'
import { cn } from '@/lib/utils'
import type { TransferData } from '@/types/transfer'
import { CornerDecorationsContainer } from '../ui/corner-decorations-container'
import { CumulativeTransferCounter } from './cumulative-transfer-counter'
import { TransferRow } from './transfer-row'

interface TransfersProps {
  transfers: TransferData[]
  isLoading: boolean
  cumulativeTransferred: bigint
  isFollowingData: boolean
}

const TABLE_GRID = 'flex justify-between items-center py-4 px-6'
const ROW_HEIGHT = 56

interface TransferRowData {
  data: TransferData[]
  gridClass: string
}

// Cell component defined outside to maintain stable reference
function TransferCell({
  index,
  style,
  data,
  gridClass,
}: RowComponentProps<TransferRowData>): ReactElement {
  const transfer = data[index]

  return (
    <div style={style}>
      {transfer && <TransferRow transfer={transfer} gridClass={gridClass} />}
    </div>
  )
}

export function Transfers({
  transfers,
  isLoading,
  cumulativeTransferred,
  isFollowingData,
}: TransfersProps) {
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
    data: transfers,
    isFollowing,
    gridClass: TABLE_GRID,
  })

  return (
    <CornerDecorationsContainer className="flex flex-col mx-6 mb-6 sm:mx-10 sm:mb-10">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-border-corner" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-border-corner" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-border-corner" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-border-corner" />

      <CumulativeTransferCounter
        cumulativeTransferred={cumulativeTransferred}
      />

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
            <span className="w-32">From</span>
            <span className="w-32">To</span>
            <span className="w-24 text-right">Amount</span>
            <span className="w-24">Time</span>
          </div>

          <div ref={containerRef} className="h-96 pt-4" {...hoverProps}>
            {displayedData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-zinc-400">
                  {isLoading ? 'Waiting for events...' : 'No transfers yet'}
                </p>
              </div>
            ) : (
              <List
                listRef={listRef}
                rowComponent={TransferCell}
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
