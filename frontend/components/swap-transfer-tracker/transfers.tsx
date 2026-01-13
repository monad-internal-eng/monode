'use client'

import type { ReactElement } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { useMouseHover } from '@/hooks/use-mouse-hover'
import { useVirtualizedList } from '@/hooks/use-virtualized-list'
import { cn } from '@/lib/utils'
import type { TransferData } from '@/types/transfer'
import { CumulativeTransferCounter } from './cumulative-transfer-counter'
import { TransferRow } from './transfer-row'

interface TransfersProps {
  transfers: TransferData[]
  isLoading: boolean
  cumulativeTransferred: bigint
  isFollowingData: boolean
}

const TABLE_GRID = 'grid grid-cols-6 gap-6 px-4'
const ROW_HEIGHT = 45

interface TransferRowData {
  dataRef: React.RefObject<TransferData[]>
  gridClass: string
}

// Cell component defined outside to maintain stable reference
function TransferCell({
  index,
  style,
  dataRef,
  gridClass,
}: RowComponentProps<TransferRowData>): ReactElement {
  const transfer = dataRef.current?.[index]

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
    <div className="flex flex-col">
      <CumulativeTransferCounter
        cumulativeTransferred={cumulativeTransferred}
      />

      {/* Table - horizontally scrollable */}
      <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-none">
        <div className="min-w-4xl lg:min-w-0">
          <div
            className={cn(
              'py-3 text-xs font-medium text-zinc-400 border-b border-zinc-800',
              TABLE_GRID,
            )}
          >
            <span>Transaction Hash</span>
            <span>From</span>
            <span>To</span>
            <span>Amount</span>
            <span>Token</span>
            <span>Time</span>
          </div>

          <div ref={containerRef} className="h-96" {...hoverProps}>
            {displayedData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-zinc-400">
                  {isLoading ? 'Waiting for events...' : 'No transfers yet'}
                </p>
              </div>
            ) : (
              <List
                key={displayedData.length > 0 ? displayedData[0]?.id : 'empty'}
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
    </div>
  )
}
