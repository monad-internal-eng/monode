'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { type CellComponentProps, Grid } from 'react-window'
import { Spinner } from '@/components/spinner'
import { useBlockchainScroll } from '@/hooks/use-blockchain-scroll'
import type { Block } from '@/types/block'
import { BlockCard } from './block-card'

const ITEM_WIDTH = 162
const GRID_HEIGHT = 140

interface BlockchainProps {
  blocks: Block[]
  isFollowingChain: boolean
}

interface BlockCellProps {
  blocks: Block[]
}

function BlockCell({
  columnIndex,
  style,
  blocks,
}: CellComponentProps<BlockCellProps>) {
  const block = blocks[columnIndex]

  return (
    <div style={style} className="flex items-center justify-center relative">
      {columnIndex > 0 && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4.5 h-1 bg-[#3a3a5a] rounded-full" />
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

  const { gridRef, sortedBlocks } = useBlockchainScroll({
    blocks,
    isFollowingChain,
  })

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateWidth = () => setContainerWidth(node.clientWidth)
    updateWidth()

    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(node)
    return () => resizeObserver.disconnect()
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isFollowingChain) {
        e.preventDefault()
      }
    },
    [isFollowingChain],
  )

  return (
    <div
      ref={containerRef}
      className="flex-1 p-4 overflow-hidden min-h-[152px] sm:min-h-[172px]"
      onWheel={handleWheel}
    >
      {sortedBlocks.length === 0 ? (
        <div className="flex items-center justify-center w-full h-[120px] sm:h-[140px]">
          <Spinner text="Waiting for blocks..." />
        </div>
      ) : (
        <Grid
          gridRef={gridRef}
          columnCount={sortedBlocks.length}
          columnWidth={ITEM_WIDTH}
          rowCount={1}
          rowHeight={GRID_HEIGHT}
          defaultHeight={GRID_HEIGHT}
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
