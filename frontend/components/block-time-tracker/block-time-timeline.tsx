'use client'

import { useEffect, useRef, useState } from 'react'
import { type CellComponentProps, Grid } from 'react-window'
import { Spinner } from '@/components/ui/spinner'
import { useBlockchainScroll } from '@/hooks/use-blockchain-scroll'
import type { Block } from '@/types/block'
import BlockTime from './block-time'

const BLOCK_DIMENSIONS = {
  small: { itemWidth: 120, gridHeight: 280 },
  large: { itemWidth: 140, gridHeight: 280 },
}

const getResponsiveDimensions = () => {
  if (typeof window === 'undefined') {
    return BLOCK_DIMENSIONS.large
  }

  const width = window.innerWidth
  if (width < 640) {
    return BLOCK_DIMENSIONS.small
  }
  return BLOCK_DIMENSIONS.large
}

interface BlockTimeTimelineProps {
  blocks: Block[]
  isFollowingChain: boolean
  normalizedBlockExecutionTime: number
}

interface BlockCellData {
  blocks: Block[]
  normalizedBlockExecutionTime: number
}

function BlockCell({
  columnIndex,
  style,
  blocks,
  normalizedBlockExecutionTime,
}: CellComponentProps<BlockCellData>) {
  const block = blocks[columnIndex]

  return (
    <div style={style} className="flex items-center justify-center relative">
      <BlockTime
        block={block}
        normalizedBlockExecutionTime={normalizedBlockExecutionTime}
      />
    </div>
  )
}

/**
 * Horizontal block time timeline using react-window for virtualization.
 * Blocks are added from the right and stay in place as their state changes.
 * Auto-scrolls to show the newest blocks when following chain.
 */
export function BlockTimeTimeline({
  blocks,
  isFollowingChain,
  normalizedBlockExecutionTime,
}: BlockTimeTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [dimensions, setDimensions] = useState(getResponsiveDimensions())

  const { gridRef, sortedBlocks } = useBlockchainScroll({
    blocks,
    isFollowingChain,
  })

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateDimensions = () => {
      setContainerWidth(node.clientWidth)
      setDimensions(getResponsiveDimensions())
    }
    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(node)
    return () => resizeObserver.disconnect()
  }, [])

  // Prevent scroll with non-passive event listener
  useEffect(() => {
    const node = containerRef.current
    if (!node || !isFollowingChain) return

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault()
    }

    node.addEventListener('wheel', preventScroll, { passive: false })
    return () => node.removeEventListener('wheel', preventScroll)
  }, [isFollowingChain])

  return (
    <div ref={containerRef} className="flex-1 min-h-[280px]">
      {sortedBlocks.length === 0 ? (
        <div className="flex items-center justify-center w-full h-[280px]">
          <Spinner text="Waiting for blocks..." />
        </div>
      ) : (
        <Grid
          gridRef={gridRef}
          columnCount={sortedBlocks.length}
          columnWidth={dimensions.itemWidth}
          rowCount={1}
          rowHeight={dimensions.gridHeight}
          defaultHeight={dimensions.gridHeight}
          defaultWidth={containerWidth}
          overscanCount={3}
          cellComponent={BlockCell}
          cellProps={{ blocks: sortedBlocks, normalizedBlockExecutionTime }}
          className="scrollbar-none"
          style={{
            overflowX: isFollowingChain ? 'hidden' : 'auto',
            overflowY: 'hidden',
          }}
        />
      )}
    </div>
  )
}
