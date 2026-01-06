'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { type CellComponentProps, Grid } from 'react-window'
import { Spinner } from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useBlockchainScrollTest } from '@/hooks/use-blockchain-scroll-test'
import { calculateBarMetrics, fromNsToMsPrecise } from '@/lib/block-metrics'
import type { Block } from '@/types/block'
import { formatBlockNumber } from '@/utils/ui'
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
  maxBlockExecutionTime: number
}

interface BlockCellData {
  blocks: Block[]
  maxBlockExecutionTime: number
}

function BlockCell({
  columnIndex,
  style,
  blocks,
  maxBlockExecutionTime,
}: CellComponentProps<BlockCellData>) {
  const block = blocks[columnIndex]
  const { totalTransactionTime, isHighlyParallel } = useMemo(
    () => calculateBarMetrics(block, maxBlockExecutionTime),
    [block, maxBlockExecutionTime],
  )
  const formattedBlockExecutionTime = fromNsToMsPrecise(
    block.executionTime ?? BigInt(0),
  ).toFixed(3)
  const formattedTotalTransactionTime = totalTransactionTime.toFixed(3)
  const numberOfTransactions = (block.transactions ?? []).length
  const parallelPercentage = isHighlyParallel
    ? (Number(formattedTotalTransactionTime) * 100) /
      Number(formattedBlockExecutionTime)
    : 0 // Compute actual percentage of difference tx time and execution between block

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          style={style}
          className="flex items-center justify-center relative"
        >
          <BlockTime
            block={block}
            maxBlockExecutionTime={maxBlockExecutionTime}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent
        sideOffset={5}
        className="bg-[#0e0e1a] border border-[#2a2a4a] rounded-lg p-2 sm:p-3 shadow-xl text-xs sm:text-sm w-[350px]"
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-white uppercase tracking-wider">
              Block {formatBlockNumber(block.number)}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center justify-between">
                <p className="text-xs font-mono text-[#8888a0] break-all">
                  Block Execution Time
                </p>
                <p className="text-white text-sm font-medium">
                  {formattedBlockExecutionTime}ms
                </p>
              </div>
              <div className="flex flex-row items-center justify-between">
                <p className="text-xs font-mono text-[#8888a0] break-all">
                  Transaction Execution Time
                </p>
                <p className="text-white text-sm font-medium">
                  {formattedTotalTransactionTime}ms
                </p>
              </div>

              <div className="flex flex-row items-center justify-between">
                <p className="text-xs font-mono text-[#8888a0] break-all">
                  Transactions
                </p>
                <p className="text-white text-sm font-medium">
                  {numberOfTransactions}
                </p>
              </div>
              <div className="flex flex-row items-center justify-between">
                <p className="text-xs font-mono text-[#8888a0] break-all">
                  Parallel Execution
                </p>
                <p className="text-[#9C6EF8] text-sm font-medium">
                  {parallelPercentage}%
                </p>
              </div>
            </div>
          </div>
          {isHighlyParallel && (
            <div className="flex flex-col gap-0">
              <div className="border-t border-[#2C2735] my-2" />
              <div className="flex flex-row items-center gap-2">
                <div className="bg-[#9C6EF8] w-2 h-2 rounded-full" />
                <p className="text-[#9C6EF8] font-medium">
                  High parallel execution detected
                </p>
              </div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
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
  maxBlockExecutionTime,
}: BlockTimeTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [dimensions, setDimensions] = useState(getResponsiveDimensions())

  const { gridRef, sortedBlocks } = useBlockchainScrollTest({
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
          cellProps={{ blocks: sortedBlocks, maxBlockExecutionTime }}
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
