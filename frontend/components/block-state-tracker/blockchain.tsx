'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { type CellComponentProps, Grid } from 'react-window'
import { Spinner } from '@/components/spinner'
import { useBlockchainScroll } from '@/hooks/use-blockchain-scroll'
import type { Block } from '@/types/block'
import { BlockCard } from './block-card'

const BLOCK_DIMENSIONS = {
  small: { itemWidth: 200, gridHeight: 244 }, // w-48 + gap
  large: { itemWidth: 240, gridHeight: 250 }, // w-56 + gap
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

interface BlockchainProps {
  blocks: Block[]
  isFollowingChain: boolean
}

interface BlockCellData {
  blocks: Block[]
  latestBlockNumber: number
}

function BlockCell({
  columnIndex,
  style,
  blocks,
  latestBlockNumber,
}: CellComponentProps<BlockCellData>) {
  const block = blocks[columnIndex]
  const isLatest = block.number === latestBlockNumber

  return (
    <div style={style} className="flex items-center justify-center relative">
      <BlockCard block={block} isLatest={isLatest} />
    </div>
  )
}

/**
 * Horizontal blockchain visualization using react-window for virtualization.
 * Blocks are added from the right and stay in place as their state changes.
 * Auto-scrolls to show the newest blocks when following chain.
 */
export function Blockchain({ blocks, isFollowingChain }: BlockchainProps) {
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

  const preventScroll = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
  }, [])

  const latestBlockNumber =
    sortedBlocks.length > 0 ? Math.max(...sortedBlocks.map((b) => b.number)) : 0

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-visible min-h-60 sm:min-h-64"
      onWheel={isFollowingChain ? preventScroll : undefined}
    >
      {sortedBlocks.length === 0 ? (
        <div className="flex items-center justify-center w-full h-56 sm:h-60">
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
          cellProps={{ blocks: sortedBlocks, latestBlockNumber }}
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
