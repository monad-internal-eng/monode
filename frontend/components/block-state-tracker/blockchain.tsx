'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { type CellComponentProps, Grid } from 'react-window'
import { Spinner } from '@/components/spinner'
import { useBlockchainScroll } from '@/hooks/use-blockchain-scroll'
import type { Block } from '@/types/block'
import { BlockCard } from './block-card'

const BLOCK_DIMENSIONS = {
  small: { itemWidth: 110, gridHeight: 96 },
  medium: { itemWidth: 130, gridHeight: 112 },
  large: { itemWidth: 162, gridHeight: 140 },
}

const getResponsiveDimensions = () => {
  if (typeof window === 'undefined') {
    return BLOCK_DIMENSIONS.large
  }

  const width = window.innerWidth
  if (width < 640) {
    return BLOCK_DIMENSIONS.small
  }
  if (width < 768) {
    return BLOCK_DIMENSIONS.medium
  }
  return BLOCK_DIMENSIONS.large
}

interface BlockchainProps {
  blocks: Block[]
  isFollowingChain: boolean
}

interface BlockCellData {
  blocks: Block[]
}

function BlockCell({
  columnIndex,
  style,
  blocks,
}: CellComponentProps<BlockCellData>) {
  const block = blocks[columnIndex]

  return (
    <div style={style} className="flex items-center justify-center relative">
      {columnIndex > 0 && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 sm:w-3.5 lg:w-4.5 h-0.5 sm:h-0.5 lg:h-1 bg-[#3a3a5a] rounded-full" />
      )}
      <BlockCard block={block} />
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

  return (
    <div
      ref={containerRef}
      className="flex-1 p-4 overflow-hidden min-h-[120px] sm:min-h-[152px] lg:min-h-[172px]"
      onWheel={isFollowingChain ? preventScroll : undefined}
    >
      {sortedBlocks.length === 0 ? (
        <div className="flex items-center justify-center w-full h-[88px] sm:h-[120px] lg:h-[140px]">
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
          cellProps={{ blocks: sortedBlocks }}
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
