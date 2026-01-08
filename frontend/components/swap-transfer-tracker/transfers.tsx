'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { useVerticalScroll } from '@/hooks/use-vertical-scroll'
import { cn } from '@/lib/utils'
import type { TransferData } from '@/types/transfer'
import { CumulativeTransferCounter } from './cumulative-transfer-counter'
import { TransferRow } from './transfer-row'

interface TransfersProps {
  transfers: TransferData[]
  isLoading: boolean
  cumulativeTransferred: bigint
  isFollowing: boolean
}

const TABLE_GRID = 'grid grid-cols-6 gap-6 px-4'
const ROW_HEIGHT = 45

interface TransferRowData {
  transfers: TransferData[]
  gridClass: string
}

function TransferCell({
  index,
  style,
  transfers,
  gridClass,
}: RowComponentProps<TransferRowData>) {
  const transfer = transfers[index]

  return (
    <div style={style}>
      <TransferRow transfer={transfer} gridClass={gridClass} />
    </div>
  )
}

export function Transfers({
  transfers,
  isLoading,
  cumulativeTransferred,
  isFollowing,
}: TransfersProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(384)

  // Reverse transfers so newest items are at the bottom
  const reversedTransfers = useMemo(() => [...transfers].reverse(), [transfers])

  const { listRef } = useVerticalScroll({
    items: reversedTransfers,
    isFollowing,
  })

  const rowProps = useMemo(
    () => ({ transfers: reversedTransfers, gridClass: TABLE_GRID }),
    [reversedTransfers],
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
      <CumulativeTransferCounter
        cumulativeTransferred={cumulativeTransferred}
      />

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

      <div ref={containerRef} className="h-96">
        {transfers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-400">
              {isLoading ? 'Waiting for events...' : 'No transfers yet'}
            </p>
          </div>
        ) : (
          <List
            listRef={listRef}
            rowComponent={TransferCell}
            rowCount={reversedTransfers.length}
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
