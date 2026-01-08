'use client'

import type { ReactElement } from 'react'
import { useEffect, useRef, useState } from 'react'
import { List, type ListImperativeAPI, type RowComponentProps } from 'react-window'
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
  transfersRef: React.RefObject<TransferData[]>
  gridClass: string
}

// Cell component defined outside to maintain stable reference
function TransferCell({
  index,
  style,
  transfersRef,
  gridClass,
}: RowComponentProps<TransferRowData>): ReactElement {
  const transfer = transfersRef.current?.[index]

  return (
    <div style={style}>
      {transfer && <TransferRow transfer={transfer} gridClass={gridClass} />}
    </div>
  )
}

// Stable rowProps object
const STABLE_GRID_CLASS = TABLE_GRID

export function Transfers({
  transfers,
  isLoading,
  cumulativeTransferred,
  isFollowing,
}: TransfersProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<ListImperativeAPI>(null)
  const [containerHeight, setContainerHeight] = useState(384)

  // Freeze data when paused - this prevents ALL re-renders while paused
  const [displayedData, setDisplayedData] = useState<TransferData[]>(transfers)
  const wasFollowingRef = useRef(isFollowing)

  // Update displayed data only when following, or when resuming from pause
  useEffect(() => {
    if (isFollowing) {
      setDisplayedData(transfers)
    }
    // If we just resumed from pause, update to latest
    if (isFollowing && !wasFollowingRef.current) {
      setDisplayedData(transfers)
    }
    wasFollowingRef.current = isFollowing
  }, [transfers, isFollowing])

  // Store displayed data in ref for stable rowProps
  const transfersRef = useRef<TransferData[]>(displayedData)
  transfersRef.current = displayedData

  // Auto-scroll to top when following and new data arrives
  useEffect(() => {
    if (isFollowing && displayedData.length > 0 && listRef.current) {
      listRef.current.scrollToRow({ index: 0, align: 'start', behavior: 'auto' })
    }
  }, [displayedData.length, isFollowing])

  // Stable rowProps - transfersRef never changes reference, only its .current
  const rowPropsRef = useRef({ transfersRef, gridClass: STABLE_GRID_CLASS })
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
  )
}
