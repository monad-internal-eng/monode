'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import type { GridImperativeAPI } from 'react-window'
import type { Block } from '@/types/block'

interface UseBlockchainScrollOptions {
  blocks: Block[]
  isFollowingChain: boolean
}

export function useBlockchainScroll({
  blocks,
  isFollowingChain,
}: UseBlockchainScrollOptions) {
  const gridRef = useRef<GridImperativeAPI>(null)
  const prevNewestBlockNumberRef = useRef<number | null>(null)

  // Sort blocks by Number (oldest on left, newest on right)
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.number - b.number),
    [blocks],
  )

  const newestBlockNumber =
    sortedBlocks.length > 0
      ? sortedBlocks[sortedBlocks.length - 1].number
      : null

  // Auto-scroll to the end when new blocks are added (only if following chain)
  useLayoutEffect(() => {
    if (!gridRef.current || newestBlockNumber === null || !isFollowingChain)
      return
    const prevNewestNumber = prevNewestBlockNumberRef.current
    const hasNewBlock =
      prevNewestNumber === null || newestBlockNumber > prevNewestNumber

    if (hasNewBlock) {
      requestAnimationFrame(() => {
        gridRef.current?.scrollToColumn({
          index: sortedBlocks.length - 1,
          align: 'end',
          behavior: 'smooth',
        })
      })
    }

    prevNewestBlockNumberRef.current = newestBlockNumber
  }, [newestBlockNumber, isFollowingChain, sortedBlocks.length])

  return { gridRef, sortedBlocks }
}
